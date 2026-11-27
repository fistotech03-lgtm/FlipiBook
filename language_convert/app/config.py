import os

try:
    import torch
    HAS_TORCH = True
except ImportError:
    torch = None
    HAS_TORCH = False

class Settings:
    # Model Hub Name (HuggingFace - English to 22 Indian Languages only)
    MODEL_EN_INDIC: str = os.getenv("MODEL_EN_INDIC", "ai4bharat/indictrans2-en-indic-1B")

    # Fast 200M Distilled Alternative (Set USE_DISTILLED=1 for low-VRAM/CPU systems)
    USE_DISTILLED: bool = os.getenv("USE_DISTILLED", "true").lower() in ("1", "true")
    MODEL_EN_INDIC_DISTILLED: str = "ai4bharat/indictrans2-en-indic-dist-200M"

    # Hardware Acceleration
    if HAS_TORCH and torch.cuda.is_available():
        DEVICE: str = "cuda"
        DTYPE = torch.float16
    elif HAS_TORCH and hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        DEVICE: str = "mps"
        DTYPE = torch.float32
    elif HAS_TORCH:
        DEVICE: str = "cpu"
        DTYPE = torch.float32
    else:
        DEVICE: str = "cpu"
        DTYPE = "auto"

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8010"))
    DEFAULT_BATCH_SIZE: int = int(os.getenv("DEFAULT_BATCH_SIZE", "16"))
    MAX_LENGTH: int = int(os.getenv("MAX_LENGTH", "256"))
    # Adaptive beam search: higher beams on short headings/phrases for accuracy, lower on long body blocks for CPU speed
    BEAM_SIZE: int = int(os.getenv("BEAM_SIZE", "2" if DEVICE == "cpu" else "4"))
    HEADING_BEAM_SIZE: int = int(os.getenv("HEADING_BEAM_SIZE", "4"))
    HF_TOKEN = os.getenv("HF_TOKEN") or None

settings = Settings()
