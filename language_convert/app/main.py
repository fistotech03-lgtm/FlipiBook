import threading
import time
from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from app.config import settings
from app.languages import INDIC_LANGUAGES, resolve_language_code
from app.schemas import (
    TranslationRequest,
    TranslationResponse,
    FlipbookPageTranslationRequest,
    FlipbookPageTranslationResponse,
    LanguagesListResponse,
    LanguageItem,
)
from app.engine import IndicTransEngine
from app.svg_translator import SvgPageTranslator

app = FastAPI(
    title="FlipiBook IndicTrans2 Translation Microservice",
    description="State-of-the-Art Neural Machine Translation for 22 Indian Scheduled Languages + English",
    version="1.0.0",
)

# Enable CORS for Frontend & Backend services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = IndicTransEngine.get_instance()
svg_translator = SvgPageTranslator(engine)


@app.on_event("startup")
def preload_translation_model():
    # Preload and warm up the model in background so /health is ready immediately
    # while first-request cold-start download/JIT happens asynchronously.
    threading.Thread(target=engine.warmup, daemon=True).start()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "IndicTrans2-Translation-Service",
        "device": settings.DEVICE,
        "use_distilled": settings.USE_DISTILLED,
        "models_cached": list(engine.models.keys()),
    }

@app.get("/languages", response_model=LanguagesListResponse)
def list_supported_languages():
    items = [
        LanguageItem(code=code, name=data["name"], native=data["native"], script=data["script"])
        for code, data in INDIC_LANGUAGES.items()
    ]
    return LanguagesListResponse(total=len(items), languages=items)

@app.post("/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    start_time = time.time()

    src_lang = resolve_language_code(req.src_lang)
    tgt_lang = resolve_language_code(req.tgt_lang)

    if not src_lang:
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported source language: '{req.src_lang}'")
    if not tgt_lang:
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported target language: '{req.tgt_lang}'")
    if src_lang != "eng_Latn" or tgt_lang == "eng_Latn":
        raise HTTPException(
            status_code=400,
            detail="Only English ('eng_Latn') to Indian languages translation is supported."
        )
    if src_lang == tgt_lang:
        return TranslationResponse(
            translations=req.texts,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
            count=len(req.texts),
            time_taken_ms=0.0,
        )

    try:
        translations = engine.translate_batch(
            sentences=req.texts,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
            batch_size=req.batch_size or settings.DEFAULT_BATCH_SIZE,
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return TranslationResponse(
            translations=translations,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
            count=len(translations),
            time_taken_ms=elapsed_ms,
        )
    except Exception as e:
        err_msg = str(e)
        if "gated repo" in err_msg or "401" in err_msg or "restricted" in err_msg:
            detail = (
                "AI4Bharat IndicTrans2 is a gated model on Hugging Face. "
                "1. Go to https://huggingface.co/ai4bharat/indictrans2-en-indic-1B and click 'Agree and access repository'. "
                "2. Create a free Read Token at https://huggingface.co/settings/tokens. "
                "3. Restart the container with: docker run -p 8010:8010 -e HF_TOKEN=your_hf_token flipibook-translate"
            )
            raise HTTPException(status_code=401, detail=detail)
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.post("/translate/page", response_model=FlipbookPageTranslationResponse)
def translate_flipbook_page(req: FlipbookPageTranslationRequest):
    print(f"[API] Incoming /translate/page request: src={req.src_lang}, tgt={req.tgt_lang}, svg_len={len(req.svg_content)}", flush=True)
    start_time = time.time()

    src_lang = resolve_language_code(req.src_lang)
    tgt_lang = resolve_language_code(req.tgt_lang)

    if not src_lang or not tgt_lang:
        raise HTTPException(status_code=400, detail="Invalid source or target language code provided.")
    if src_lang != "eng_Latn" or tgt_lang == "eng_Latn":
        raise HTTPException(
            status_code=400,
            detail="Only English ('eng_Latn') to Indian languages translation is supported."
        )

    try:
        translated_svg, count = svg_translator.translate_svg_page(
            svg_content=req.svg_content,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return FlipbookPageTranslationResponse(
            translated_svg=translated_svg,
            translated_count=count,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
            time_taken_ms=elapsed_ms,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Page translation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
