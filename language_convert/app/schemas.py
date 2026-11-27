from pydantic import BaseModel, Field  # type: ignore
from typing import List, Optional

class TranslationRequest(BaseModel):
    texts: List[str] = Field(..., description="List of strings/sentences to translate")
    src_lang: str = Field(default="eng_Latn", description="Source language code (e.g., 'eng_Latn', 'en', 'english')")
    tgt_lang: str = Field(default="tam_Taml", description="Target language code (e.g., 'tam_Taml', 'ta', 'tamil')")
    batch_size: Optional[int] = Field(default=16, ge=1, le=128, description="Batch size for model inference")

class TranslationResponse(BaseModel):
    translations: List[str]
    src_lang: str
    tgt_lang: str
    count: int
    time_taken_ms: float

class FlipbookPageTranslationRequest(BaseModel):
    svg_content: str = Field(..., description="Raw SVG string containing <text> and <tspan> elements")
    src_lang: str = Field(default="eng_Latn")
    tgt_lang: str = Field(default="tam_Taml")

class FlipbookPageTranslationResponse(BaseModel):
    translated_svg: str
    translated_count: int
    src_lang: str
    tgt_lang: str
    time_taken_ms: float

class LanguageItem(BaseModel):
    code: str
    name: str
    native: str
    script: str

class LanguagesListResponse(BaseModel):
    total: int
    languages: List[LanguageItem]
