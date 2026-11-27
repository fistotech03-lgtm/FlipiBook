import time
import logging
import os
import re
import sys
import threading
import types
from collections import OrderedDict
from typing import List, Tuple, Optional, Dict
from app.config import settings

# Backward compatibility shim for IndicTrans2 remote code referencing deprecated transformers.onnx
if "transformers.onnx" not in sys.modules or "transformers.onnx.utils" not in sys.modules:
    try:
        import transformers
        import transformers.onnx  # type: ignore
        import transformers.onnx.utils  # type: ignore
    except (ImportError, ModuleNotFoundError, AttributeError):
        try:
            import transformers
        except ImportError:
            transformers = None
        onnx_shim = types.ModuleType("transformers.onnx")
        onnx_utils_shim = types.ModuleType("transformers.onnx.utils")
        class DummyOnnxConfig:
            pass
        class DummyOnnxSeq2SeqConfigWithPast(DummyOnnxConfig):
            pass
        onnx_shim.OnnxConfig = DummyOnnxConfig  # type: ignore
        onnx_shim.OnnxConfigWithPast = DummyOnnxConfig  # type: ignore
        onnx_shim.OnnxSeq2SeqConfigWithPast = DummyOnnxSeq2SeqConfigWithPast  # type: ignore
        onnx_shim.__path__ = []
        onnx_shim.utils = onnx_utils_shim
        if transformers:
            transformers.onnx = onnx_shim
        sys.modules["transformers.onnx"] = onnx_shim
        sys.modules["transformers.onnx.utils"] = onnx_utils_shim

logger = logging.getLogger("IndicTransEngine")
logging.basicConfig(level=logging.INFO)

class IndicTransEngine:
    _instance: Optional["IndicTransEngine"] = None

    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.processor = None
        self._cache: OrderedDict[Tuple[str, str, str], str] = OrderedDict()
        self._cache_lock = threading.Lock()
        self._infer_lock = threading.Lock()
        self._warmed_up = False
        self._max_cache_size = 5000
        self._init_processor()

    @classmethod
    def get_instance(cls) -> "IndicTransEngine":
        if cls._instance is None:
            cls._instance = IndicTransEngine()
        return cls._instance

    def _init_processor(self):
        try:
            from IndicTransToolkit.processor import IndicProcessor  # type: ignore
            self.processor = IndicProcessor(inference=True)
            logger.info("Successfully initialized IndicTransToolkit.IndicProcessor.")
        except ImportError:
            logger.warning(
                "IndicTransToolkit not found in environment. Using fallback text normalizer. "
                "Install via: pip install git+https://github.com/VarunGumma/IndicTransToolkit.git"
            )
            self.processor = None

    def _get_direction_model_name(self, src_lang: str, tgt_lang: str) -> Tuple[str, str]:
        """Determines the IndicTrans2 model checkpoint (English to Indian languages only)."""
        is_src_en = src_lang == "eng_Latn"
        is_tgt_en = tgt_lang == "eng_Latn"

        if not is_src_en or is_tgt_en:
            raise ValueError(
                f"Unsupported translation direction '{src_lang}' -> '{tgt_lang}'. "
                "Only English ('eng_Latn') to Indian languages is enabled."
            )

        direction = "en-indic"
        model_name = settings.MODEL_EN_INDIC_DISTILLED if settings.USE_DISTILLED else settings.MODEL_EN_INDIC
        return direction, model_name

    def load_model(self, direction: str, model_name: str):
        """Loads and caches the model and tokenizer for a specific translation direction."""
        if direction in self.models:
            return self.models[direction], self.tokenizers[direction]

        logger.info(f"Loading IndicTrans2 [{direction}] model: {model_name} on {settings.DEVICE}...")
        try:
            import torch  # type: ignore
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer  # type: ignore

            # Leave 1-2 host cores headroom on CPU containers to prevent OS/OpenMP contention stalls
            cpu_cnt = os.cpu_count() or 4
            torch.set_num_threads(max(1, min(6, cpu_cnt - 2 if cpu_cnt >= 6 else cpu_cnt)))
            hf_token = settings.HF_TOKEN
            resolved_dtype = torch.float16 if settings.DEVICE == "cuda" else torch.float32

            try:
                tokenizer = AutoTokenizer.from_pretrained(
                    model_name, trust_remote_code=True, token=hf_token, local_files_only=True
                )
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    trust_remote_code=True,
                    torch_dtype=resolved_dtype,
                    low_cpu_mem_usage=True,
                    token=hf_token,
                    local_files_only=True,
                ).to(settings.DEVICE)
            except Exception:
                tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True, token=hf_token)
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    model_name,
                    trust_remote_code=True,
                    torch_dtype=resolved_dtype,
                    low_cpu_mem_usage=True,
                    token=hf_token
                ).to(settings.DEVICE)

            model.eval()
            self.models[direction] = model
            self.tokenizers[direction] = tokenizer
            logger.info(f"Model [{direction}] loaded successfully.")
            return model, tokenizer
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise e

    def warmup(self):
        """Pre-loads the model and runs one tiny inference so cold-start JIT/paging completes before user requests."""
        if self._warmed_up:
            return
        try:
            t0 = time.time()
            self.translate_batch(["Hello"], src_lang="eng_Latn", tgt_lang="tam_Taml", batch_size=1)
            self._warmed_up = True
            logger.info(f"Startup model warmup completed in {time.time() - t0:.2f}s.")
        except Exception as e:
            logger.warning(f"Startup warmup skipped: {e}")

    def translate_batch(
        self,
        sentences: List[str],
        src_lang: str,
        tgt_lang: str,
        batch_size: int = 8
    ) -> List[str]:
        """Translates a list of sentences from src_lang to tgt_lang with caching and length-sorted batching."""
        if not sentences:
            return []

        # Split long multi-sentence blocks at sentence boundaries so CPU NMT doesn't drift/truncate
        # across 40+ word paragraphs (helps both /translate and /translate/page).
        sent_split_re = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9"\'\(\[])')
        expanded_map: List[List[str]] = []
        flat_sentences: List[str] = []
        for raw_s in sentences:
            cleaned = re.sub(r'\s+', ' ', (raw_s or '')).strip()
            if len(cleaned.split()) >= 12:
                parts = [p.strip() for p in sent_split_re.split(cleaned) if p.strip()]
                if len(parts) > 1:
                    expanded_map.append(parts)
                    flat_sentences.extend(parts)
                    continue
            expanded_map.append([raw_s])
            flat_sentences.append(raw_s)

        if len(flat_sentences) > len(sentences):
            flat_results = self.translate_batch(flat_sentences, src_lang=src_lang, tgt_lang=tgt_lang, batch_size=batch_size)
            rebuilt: List[str] = []
            cursor = 0
            for group in expanded_map:
                cnt = len(group)
                chunk_res = flat_results[cursor : cursor + cnt]
                cursor += cnt
                rebuilt.append(" ".join(x.strip() for x in chunk_res if x and x.strip()) if cnt > 1 else chunk_res[0])
            return rebuilt

        direction, model_name = self._get_direction_model_name(src_lang, tgt_lang)

        results: List[Optional[str]] = [None] * len(sentences)
        uncached_items: List[Tuple[int, str]] = []

        # 1. Serve cached translations immediately (without waiting on inference lock)
        with self._cache_lock:
            for idx, text in enumerate(sentences):
                key = (src_lang, tgt_lang, text)
                if key in self._cache:
                    self._cache.move_to_end(key)
                    results[idx] = self._cache[key]
                else:
                    uncached_items.append((idx, text))

        if not uncached_items:
            return [r or "" for r in results]

        import torch  # type: ignore

        # 2. Serialize model loading + CPU inference so concurrent requests don't thrash OpenMP threads
        with self._infer_lock:
            # Re-check cache in case another in-flight request just populated entries
            still_uncached: List[Tuple[int, str]] = []
            with self._cache_lock:
                for idx, text in uncached_items:
                    key = (src_lang, tgt_lang, text)
                    if key in self._cache:
                        self._cache.move_to_end(key)
                        results[idx] = self._cache[key]
                    else:
                        still_uncached.append((idx, text))

            if not still_uncached:
                return [r or "" for r in results]

            model, tokenizer = self.load_model(direction, model_name)

            # Sort uncached sentences by beam tier + length so short headings get high-accuracy beam search
            # without slowing down or padding beside long body paragraphs.
            def _beam_for_text(t: str) -> int:
                words = len(t.split())
                if words <= 12 and len(t) <= 90:
                    return max(1, settings.HEADING_BEAM_SIZE)
                if words <= 35:
                    return max(1, settings.BEAM_SIZE)
                return 1 if settings.DEVICE == "cpu" else max(1, settings.BEAM_SIZE)

            bucketed: Dict[int, List[Tuple[int, str]]] = {}
            for idx, text in still_uncached:
                b = _beam_for_text(text)
                bucketed.setdefault(b, []).append((idx, text))

            micro_batch_size = min(batch_size or 8, 8)

            for beam_count, bucket_items in bucketed.items():
                bucket_items.sort(key=lambda item: len(item[1]))
                for i in range(0, len(bucket_items), micro_batch_size):
                    sub_items = bucket_items[i : i + micro_batch_size]
                    chunk = [text for _, text in sub_items]

                    if self.processor:
                        preprocessed = self.processor.preprocess_batch(chunk, src_lang=src_lang, tgt_lang=tgt_lang)
                    else:
                        preprocessed = chunk

                    inputs = tokenizer(
                        preprocessed,
                        padding="longest",
                        truncation=True,
                        max_length=settings.MAX_LENGTH,
                        return_tensors="pt",
                        return_attention_mask=True,
                    ).to(settings.DEVICE)

                    in_len = inputs["input_ids"].shape[1]
                    # Scale max_new_tokens tightly to batch length so short labels exit quickly
                    dynamic_max_tokens = min(144, max(14, in_len * 2 + 12))

                    with torch.no_grad():
                        generated_tokens = model.generate(
                            **inputs,
                            use_cache=True,
                            min_length=0,
                            max_new_tokens=dynamic_max_tokens,
                            num_beams=beam_count,
                            do_sample=False,
                            pad_token_id=tokenizer.pad_token_id,
                            eos_token_id=tokenizer.eos_token_id,
                        )

                    with tokenizer.as_target_tokenizer():
                        decoded = tokenizer.batch_decode(
                            generated_tokens.detach().cpu().numpy(),
                            skip_special_tokens=True
                        )

                    if self.processor:
                        postprocessed = self.processor.postprocess_batch(decoded, lang=tgt_lang)
                    else:
                        postprocessed = decoded

                    with self._cache_lock:
                        for (orig_idx, orig_text), trans_text in zip(sub_items, postprocessed):
                            results[orig_idx] = trans_text
                            key = (src_lang, tgt_lang, orig_text)
                            self._cache[key] = trans_text
                            self._cache.move_to_end(key)
                        if len(self._cache) > self._max_cache_size:
                            self._cache.popitem(last=False)

        self._warmed_up = True
        return [r or "" for r in results]
