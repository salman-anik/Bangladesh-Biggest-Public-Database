# Bangla AI & Machine Learning Datasets Hub

Welcome to the **Bangla AI & Machine Learning Datasets Hub** within the Bangladesh Biggest Public Database repository.

This directory is an index and reference collection of natural language processing (NLP), automatic speech recognition (ASR), computer vision (OCR), and multimodal datasets for the Bengali language and Bangladesh context.

---

## Quick Navigation

| Domain / Task | Top Datasets | Records / Scale | Direct Access |
|---|---|---|---|
| **Text Corpora** | Bangla2B+, BanglaBERT Corpus | 2B+ tokens / 110M sentences | `bangla_ai/text/` |
| **Translation** | IndicTrans2, BanglaPARAPH | 5.4M sentence pairs | `bangla_ai/translation/` |
| **Sentiment Analysis** | SentNoB, Book Reviews | 20,000+ labeled reviews | `bangla_ai/sentiment/` |
| **Named Entity Recognition** | BanglaNER, WikiANN (bn) | 58,000+ sentences (BIO) | `bangla_ai/ner/` |
| **Question Answering** | BanglaRQA | 14,889 SQuAD-style QA | `bangla_ai/question_answering/` |
| **Speech Recognition (ASR)**| Mozilla Common Voice, Bengali.AI | 1,600+ audio hours | `bangla_ai/speech/` |
| **Text-to-Speech (TTS)** | Google Fleurs (bn) | 12.5 studio hours | `bangla_ai/speech/` |
| **Handwriting & OCR** | BanglaLekha-Isolated, Ekush | 200,000+ character images | `bangla_ai/ocr_handwriting/` |
| **Dialects** | DialectBD (5 regions) | 24,000 samples | `bangla_ai/dialects/` |
| **Fake News Detection** | BanFakeNews | 50,000 fact-checked news | `bangla_ai/fake_news/` |
| **Image Captioning** | Bengali COCO | 45,750 native captions | `bangla_ai/multimodal/` |
| **Sign Language** | BdSL36 | 36,000 gesture images | `bangla_ai/sign_language/` |

---

## How to Load Datasets via Python (`datasets`)

Most listed datasets are hosted on the Hugging Face Hub under open licenses. You can load and stream them in Python:

```python
from datasets import load_dataset

# 1. Load SentNoB Sentiment Dataset
sentiment_ds = load_dataset("Universal-SentNoB/SentNoB")
print(sentiment_ds["train"][0])

# 2. Stream Bangla Large Language Corpus
c4_bangla = load_dataset("allenai/c4", "bn", split="train", streaming=True)
for sample in c4_bangla:
    print(sample["text"][:200])
    break

# 3. Load Bangla Question Answering
qa_ds = load_dataset("csebuetnlp/banglarqa")
print(qa_ds["train"][0])
```

---

## Licensing & Fair Use

We strictly honor dataset licenses (Creative Commons, MIT, Apache 2.0, Open Data Commons). For datasets that prohibit direct re-distribution in public git repos, this catalog provides direct links, Python loader code, and schema definitions.
