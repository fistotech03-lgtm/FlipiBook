# FlipiBook IndicTrans2 Translation Microservice

High-performance, open-source Neural Machine Translation microservice powered by **AI4Bharat IndicTrans2**, specifically tailored for translating **FlipiBook catalogues, flipbooks, SVG pages, and UI text** across all 22 scheduled Indian languages and English.

---

## 🌟 Key Features

- **22 Scheduled Indian Languages + English**: Full support for Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, and Urdu.
- **In-Place Flipbook SVG Page Translation**: Parses SVG page elements (`<text>`, `<tspan>`), extracts text, batch-translates it, and reconstructs the SVG in-place while keeping positions, rotations, colors, and layout intact.
- **Script Unification**: Uses AI4Bharat's lexical transfer and Brahmic script unification for high-accuracy translation in low-resource languages.
- **RESTful FastAPI Service**: Ready to plug into FlipiBook's Node.js Backend Gateway and React Page Editor.
- **Hardware Acceleration**: Automatically selects CUDA (Nvidia GPU), Apple MPS (Apple Silicon), or CPU with Float16/Float32 optimization.

---

## 📁 Architecture Overview

```
language_convert/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application & HTTP endpoints
│   ├── config.py            # Environment settings & device acceleration
│   ├── languages.py         # 22 Scheduled Indian languages mapping & Flores-200 codes
│   ├── schemas.py           # Pydantic request & response models
│   ├── engine.py            # IndicTrans2 model loader, tokenizer & batch generator
│   └── svg_translator.py    # SVG parser & in-place text replacement engine
├── test_translation.py      # Standalone verification & pipeline test script
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container deployment configuration
└── README.md                # Documentation & API guide
```

---

## 🚀 Quickstart

### 1. Local Setup

```bash
cd language_convert

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install git+https://github.com/VarunGumma/IndicTransToolkit.git

# Run quick verification test
python3 test_translation.py

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

### 2. Docker Deployment

```bash
docker build -t flipibook-language-convert .
docker run -p 8010:8010 --gpus all flipibook-language-convert
```

---

## 📡 API Reference

### 1. Health Check
`GET /health`
```json
{
  "status": "healthy",
  "service": "IndicTrans2-Translation-Service",
  "device": "cuda",
  "use_distilled": false,
  "models_cached": ["en-indic"]
}
```

### 2. List Supported Languages
`GET /languages`
Returns all 22 Indian languages with their script codes and native names (e.g., `tam_Taml` for தமிழ், `hin_Deva` for हिन्दी).

### 3. Translate Batch Text
`POST /translate`
```json
{
  "texts": [
    "Explore our complete interactive catalogue and flipbook collection.",
    "Click the button below to download the pricing brochure."
  ],
  "src_lang": "eng_Latn",
  "tgt_lang": "tam_Taml"
}
```
**Response:**
```json
{
  "translations": [
    "எங்கள் முழுமையான ஊடாடும் பட்டியல் மற்றும் ஃப்ளிப்புக் தொகுப்பை ஆராயுங்கள்.",
    "விலை சிற்றேட்டைப் பதிவிறக்க கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்."
  ],
  "src_lang": "eng_Latn",
  "tgt_lang": "tam_Taml",
  "count": 2,
  "time_taken_ms": 142.5
}
```

### 4. Translate Flipbook SVG Page In-Place
`POST /translate/page`
```json
{
  "svg_content": "<svg ...><text x='100' y='150'>Welcome to FlipiBook</text></svg>",
  "src_lang": "eng_Latn",
  "tgt_lang": "tam_Taml"
}
```
**Response:**
```json
{
  "translated_svg": "<svg ...><text x='100' y='150'>FlipiBook-க்கு வரவேற்கிறோம்</text></svg>",
  "translated_count": 1,
  "src_lang": "eng_Latn",
  "tgt_lang": "tam_Taml",
  "time_taken_ms": 115.8
}
```

---

## 🔗 Integration with FlipiBook Backend (Node.js)

Call this service from your Node.js backend (`Backend/services/page-editor-service` or Gateway):

```javascript
import axios from 'axios';

const TRANSLATE_SERVICE_URL = process.env.TRANSLATE_SERVICE_URL || 'http://localhost:8010';

export async function translateFlipbookPage(svgContent, targetLanguage = 'tam_Taml') {
  const response = await axios.post(`${TRANSLATE_SERVICE_URL}/translate/page`, {
    svg_content: svgContent,
    src_lang: 'eng_Latn',
    tgt_lang: targetLanguage
  });
  return response.data.translated_svg;
}
```
