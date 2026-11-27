"""
Standalone Quick Test for IndicTrans2 Language Convert Architecture
"""

import sys
from app.languages import INDIC_LANGUAGES, resolve_language_code
from app.svg_translator import SvgPageTranslator

class DummyEngine:
    """Mock engine to test pipeline integration and SVG processing without downloading 4GB models."""
    def translate_batch(self, sentences, src_lang, tgt_lang, batch_size=16):
        sample_translations = {
            "Explore our complete interactive catalogue and flipbook collection.": "எங்கள் முழுமையான ஊடாடும் பட்டியல் மற்றும் ஃப்ளிப்புக் தொகுப்பை ஆராயுங்கள்.",
            "Click the button below to download the pricing brochure.": "விலை சிற்றேட்டைப் பதிவிறக்க கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்.",
            "Welcome to FlipiBook": "FlipiBook-க்கு வரவேற்கிறோம்",
            "Page 1: Product Overview": "பக்கம் 1: தயாரிப்பு கண்ணோட்டம்"
        }
        return [sample_translations.get(s, f"[{tgt_lang}] {s}") for s in sentences]

def main():
    print("=" * 60)
    print("INDIC TRANS 2 ARCHITECTURE TEST")
    print("=" * 60)

    # 1. Test Language Resolution
    print("\n1. Testing Language Resolution:")
    queries = ["en", "english", "tam_Taml", "tamil", "hi", "hindi", "telugu", "kannada", "malayalam"]
    for q in queries:
        resolved = resolve_language_code(q)
        info = INDIC_LANGUAGES.get(resolved, {})
        print(f"  - Input: '{q}' -> Resolved: {resolved} ({info.get('name')} - {info.get('native')})")

    # 2. Test Text Translation Pipeline
    print("\n2. Testing Text Translation Pipeline:")
    dummy_engine = DummyEngine()
    sentences = [
        "Explore our complete interactive catalogue and flipbook collection.",
        "Click the button below to download the pricing brochure."
    ]
    translations = dummy_engine.translate_batch(sentences, "eng_Latn", "tam_Taml")
    for s, t in zip(sentences, translations):
        print(f"  [EN] {s}\n  [TA] {t}\n")

    # 3. Test SVG Flipbook Page Translation
    print("3. Testing Flipbook SVG Page In-Place Translation:")
    sample_svg = """
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100">
      <rect width="100%" height="100%" fill="#ffffff" />
      <text x="100" y="150" font-size="28" fill="#111111">Welcome to FlipiBook</text>
      <text x="100" y="220" font-size="18" fill="#555555">
        <tspan>Page 1: Product Overview</tspan>
      </text>
    </svg>
    """

    translator = SvgPageTranslator(dummy_engine)
    translated_svg, count = translator.translate_svg_page(sample_svg, "eng_Latn", "tam_Taml")
    print(f"  Translated {count} text elements inside SVG.")
    print("\n  Output SVG snippet:")
    for line in translated_svg.strip().splitlines()[:10]:
        print(f"    {line}")

    print("\nArchitecture test passed successfully!")

if __name__ == "__main__":
    main()
