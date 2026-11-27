"""
Supported Languages across all 22 Scheduled Indian Languages + English
Using standard Flores-200 ISO-639-3 script codes required by IndicTrans2.
"""

from typing import Dict, Optional

INDIC_LANGUAGES: Dict[str, Dict[str, str]] = {
    "eng_Latn": {"name": "English", "native": "English", "script": "Latin"},
    "tam_Taml": {"name": "Tamil", "native": "தமிழ்", "script": "Tamil"},
    "hin_Deva": {"name": "Hindi", "native": "हिन्दी", "script": "Devanagari"},
    "tel_Telu": {"name": "Telugu", "native": "తెలుగు", "script": "Telugu"},
    "kan_Knda": {"name": "Kannada", "native": "ಕನ್ನಡ", "script": "Kannada"},
    "mal_Mlym": {"name": "Malayalam", "native": "മലയാളം", "script": "Malayalam"},
    "mar_Deva": {"name": "Marathi", "native": "मराठी", "script": "Devanagari"},
    "ben_Beng": {"name": "Bengali", "native": "বাংলা", "script": "Bengali"},
    "guj_Gujr": {"name": "Gujarati", "native": "ગુજરાતી", "script": "Gujarati"},
    "pan_Guru": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ", "script": "Gurmukhi"},
    "ory_Orya": {"name": "Odia", "native": "ଓଡ଼ିଆ", "script": "Odia"},
    "urd_Arab": {"name": "Urdu", "native": "اردو", "script": "Perso-Arabic"},
    "asm_Beng": {"name": "Assamese", "native": "অসমীয়া", "script": "Bengali"},
    "san_Deva": {"name": "Sanskrit", "native": "संस्कृतम्", "script": "Devanagari"},
    "mai_Deva": {"name": "Maithili", "native": "मैथिली", "script": "Devanagari"},
    "gom_Deva": {"name": "Konkani", "native": "कोंकणी", "script": "Devanagari"},
    "brx_Deva": {"name": "Bodo", "native": "बर'", "script": "Devanagari"},
    "doi_Deva": {"name": "Dogri", "native": "डोगरी", "script": "Devanagari"},
    "npi_Deva": {"name": "Nepali", "native": "नेपाली", "script": "Devanagari"},
    "sat_Olck": {"name": "Santali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "script": "Ol Chiki"},
    "mni_Mtei": {"name": "Manipuri (Meitei)", "native": "ꯃꯤꯇꯩꯂꯣꯟ", "script": "Meitei"},
    "mni_Beng": {"name": "Manipuri (Bengali)", "native": "মণিপুরী", "script": "Bengali"},
    "kas_Arab": {"name": "Kashmiri (Arabic)", "native": "کٲشُر", "script": "Perso-Arabic"},
    "kas_Deva": {"name": "Kashmiri (Devanagari)", "native": "कॉशुर", "script": "Devanagari"},
    "snd_Arab": {"name": "Sindhi (Arabic)", "native": "سنڌي", "script": "Perso-Arabic"},
    "snd_Deva": {"name": "Sindhi (Devanagari)", "native": "सिन्धी", "script": "Devanagari"},
}

# Alias mapping for user convenience (e.g., 'tamil' -> 'tam_Taml', 'hi' -> 'hin_Deva')
LANGUAGE_ALIASES: Dict[str, str] = {
    "en": "eng_Latn", "english": "eng_Latn",
    "ta": "tam_Taml", "tamil": "tam_Taml",
    "hi": "hin_Deva", "hindi": "hin_Deva",
    "te": "tel_Telu", "telugu": "tel_Telu",
    "kn": "kan_Knda", "kannada": "kan_Knda",
    "ml": "mal_Mlym", "malayalam": "mal_Mlym",
    "mr": "mar_Deva", "marathi": "mar_Deva",
    "bn": "ben_Beng", "bengali": "ben_Beng",
    "gu": "guj_Gujr", "gujarati": "guj_Gujr",
    "pa": "pan_Guru", "punjabi": "pan_Guru",
    "or": "ory_Orya", "odia": "ory_Orya",
    "ur": "urd_Arab", "urdu": "urd_Arab",
    "as": "asm_Beng", "assamese": "asm_Beng",
    "sa": "san_Deva", "sanskrit": "san_Deva",
    "ne": "npi_Deva", "nepali": "npi_Deva",
}

def resolve_language_code(code_or_name: str) -> Optional[str]:
    """Resolves short codes, names, or Flores codes to valid Flores-200 IndicTrans2 codes."""
    if not code_or_name:
        return None
    normalized = code_or_name.strip()
    if normalized in INDIC_LANGUAGES:
        return normalized
    lower = normalized.lower()
    if lower in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[lower]
    for code, info in INDIC_LANGUAGES.items():
        if info["name"].lower() == lower:
            return code
    return None
