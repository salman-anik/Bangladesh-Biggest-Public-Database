# Bangla AI & Machine Learning Hub

[![Status: Maintained](https://img.shields.io/badge/Status-Maintained-brightgreen.svg)](#)
[![Datasets: 18 Benchmarks](https://img.shields.io/badge/Datasets-18%20Benchmarks-blue.svg)](#)
[![Drive Mirror: Verified](https://img.shields.io/badge/Google%20Drive-Active%20Mirror-orange.svg)](#)
[![Language: Bengali](https://img.shields.io/badge/Language-Bangla%20(bn)-darkgreen.svg)](#)
[![License: Open Attribution](https://img.shields.io/badge/License-Academic%20%26%20Open-yellow.svg)](#)

A centralized, standardized, and verified collection of 18 premier artificial intelligence, machine learning, and natural language processing (NLP) datasets for the Bengali language.

This hub connects open-source researchers, data engineers, and machine learning practitioners to verified datasets across large-scale pre-training text corpora, neural machine translation, sentiment analysis, named entity recognition (NER), reading comprehension question answering (QA), automatic speech recognition (ASR), optical character recognition (OCR), regional dialect identification, misinformation detection, multimodal image captioning, and sign language recognition.

---

## Architecture & Storage Strategy

To ensure sustainable open-source development and avoid repository bloat:

- **GitHub Repository**: Stores all verified metadata, schemas, validation utilities, data loaders, SHA-256 checksums, and dataset documentation.
- **Google Drive Storage Mirror**: Stores actual verified binary datasets (CSV, JSON, Parquet, TSV, ZIP, TAR.GZ) structured under:
  ```text
  Bangladesh-Biggest-Public-Database/
  └── bangla_ai/
      ├── README.md
      ├── manifest.json
      ├── download_report.csv
      ├── checksums.csv
      │
      ├── text_corpora/
      │   ├── bangla2b/
      │   └── banglabert/
      ├── translation/
      │   ├── indictrans2/
      │   └── banglaparaphrase/
      ├── sentiment/
      │   ├── sentnob/
      │   └── bangla_book_reviews/
      ├── ner/
      │   ├── banglaner/
      │   └── wikiann/
      ├── question_answering/
      │   └── banglarqa/
      ├── speech/
      │   ├── common_voice/
      │   ├── bengaliai_speech/
      │   └── fleurs/
      ├── ocr_handwriting/
      │   ├── banglalekha/
      │   └── ekush/
      ├── dialects/
      │   └── dialectbd/
      ├── fake_news/
      │   └── banfakenews/
      ├── multimodal/
      │   └── bengali_image_captioning/
      └── sign_language/
          └── bdsl36/
  ```

---

## Dataset Catalog (All 18 Benchmarks)

| ID | Dataset Name | Domain / Task | Verified Source & Repository | License | Formats | Reported Size | Downloaded Size (Drive) | Status |
|---|---|---|---|---|---|---|---|---|
| **BAI-001** | Bangla2B+ / C4 Bangla | Large Text Corpora | [allenai/c4 (bn)](https://huggingface.co/datasets/allenai/c4) / [legacy-datasets/mc4](https://huggingface.co/datasets/legacy-datasets/mc4) | ODC-BY | JSONL, Parquet, GZIP | 2B+ Tokens / 15M Docs | Streaming Ref | `license_restricted_or_huge` |
| **BAI-002** | BanglaBERT Pre-training Corpus | Large Text Corpora | [csebuetnlp/banglabert](https://github.com/csebuetnlp/banglabert) (GDrive `1ORPugFNIBo8JfmS92zIOPe06XuWn4t_d`) | CC-BY-NC-SA-4.0 | TXT, GZIP | 27.5 GB Text / 110M Sentences | Metadata & Links | `license_restricted_or_huge` |
| **BAI-003** | IndicTrans2 / IN22-Gen | Machine Translation | [ai4bharat/IN22-Gen](https://huggingface.co/datasets/ai4bharat/IN22-Gen) / [ai4bharat/BPCC](https://huggingface.co/datasets/ai4bharat/BPCC) | CC-BY-4.0 | TAR.GZ, CSV | 5.4M Pairs (1,024 eval) | 3.35 MB | `verified_and_downloaded` |
| **BAI-004** | BanglaParaphrase | Paraphrase Detection | [csebuetnlp/BanglaParaphrase](https://huggingface.co/datasets/csebuetnlp/BanglaParaphrase) | CC-BY-NC-SA-4.0 | ZIP, TSV | 512,000 Pairs | 36.24 MB (ZIP) | `verified_and_downloaded` |
| **BAI-005** | SentNoB | Sentiment Analysis | [khondoker/SentNoB](https://huggingface.co/datasets/khondoker/SentNoB) / [KhondokerIslam/SentNoB](https://github.com/KhondokerIslam/SentNoB) | CC-BY-4.0 | CSV | 15,728 Comments | 3.18 MB (3 CSVs) | `verified_and_downloaded` |
| **BAI-006** | BanglaBook Sentiment | Sentiment Analysis | [mohsinulkabir14/BanglaBook](https://github.com/mohsinulkabir14/BanglaBook) | MIT | CSV | 158,065 Reviews | 83.52 MB (3 CSVs) | `verified_and_downloaded` |
| **BAI-007** | BanglaNER (B-NER) | Named Entity Recognition | [saiful9379/BanglaNER_V1.0](https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0) / SUST B-NER | MIT / CC-BY-4.0 | JSONL (BIO) | 38,000 Sentences | 1.70 MB (2 JSONLs) | `verified_and_downloaded` |
| **BAI-008** | WikiANN Bangla Split | Named Entity Recognition | [unimelb-nlp/wikiann (bn)](https://huggingface.co/datasets/unimelb-nlp/wikiann) | CC-BY-SA-3.0 | Parquet | 20,000 Sentences | 651.76 KB (3 Parquets)| `verified_and_downloaded` |
| **BAI-009** | BanglaRQA | Question Answering | [sartajekram/BanglaRQA](https://huggingface.co/datasets/sartajekram/BanglaRQA) | CC-BY-NC-SA-4.0 | JSON (SQuAD) | 14,889 QA Triples | 33.30 MB (3 JSONs) | `verified_and_downloaded` |
| **BAI-010** | Mozilla Common Voice Bangla | Speech Recognition (ASR)| [bengaliAI/CommonVoiceBangla](https://huggingface.co/datasets/bengaliAI/CommonVoiceBangla) / [Mozilla Voice](https://commonvoice.mozilla.org/en/datasets) | CC-0 (Public Domain) | MP3, TSV | 412 Audio Hours (>40 GB) | Metadata & Manifests | `partially_downloaded` |
| **BAI-011** | Bengali.AI ASR Corpus | Speech Recognition (ASR)| [kaggle:bengaliai-speech](https://www.kaggle.com/competitions/bengaliai-speech/data) | CC-BY-NC-4.0 | MP3, Parquet, CSV | 1,200 Hours (>100 GB) | Access Instructions | `access_required` |
| **BAI-012** | Google FLEURS Bengali | Speech Recognition & Audio| [google/fleurs (bn_in)](https://huggingface.co/datasets/google/fleurs) | CC-BY-4.0 | TSV, TAR.GZ | 12.5 Studio Hours (2.97 GB) | 4.80 MB (TSVs) | `verified_and_downloaded` |
| **BAI-013** | BanglaLekha-Isolated | Handwriting Recognition | [Mendeley Data DOI 10.17632/hf6sf8zrkc.2](https://data.mendeley.com/datasets/hf6sf8zrkc/2) | CC-BY-NC-4.0 | ZIP, PNG, CSV | 166,105 Images (760 MB) | Metadata & DOI Link | `verified_metadata_only` |
| **BAI-014** | Ekush OCR | Handwriting & Printed OCR | [ShahariarRabby/Ekush](https://github.com/ShahariarRabby/Ekush) / [Kaggle Ekush](https://www.kaggle.com/datasets/shahariarrabby/ekush-bangla-handwritten-characters) | Academic / CC-BY-4.0 | ZIP, PNG, CSV | 367,018 Characters (1.2 GB)| Metadata & Portal | `verified_metadata_only` |
| **BAI-015** | DialectBD (Regional Dialects) | Dialect Identification | [samim5669/bangla-regional-dialect-dataset](https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset) | CC-BY-4.0 | Parquet | 24,000 Samples | 1.07 MB (3 Parquets) | `verified_and_downloaded` |
| **BAI-016** | BanFakeNews | Misinformation Detection | [Rowan1224/FakeNews](https://github.com/Rowan1224/FakeNews) / [hrshihab/BanFakeNews-2.0](https://huggingface.co/datasets/hrshihab/BanFakeNews-2.0) | CC-BY-4.0 | CSV | 50,000+ News Articles | Verification Docs | `verified_and_downloaded` |
| **BAI-017** | BanglaLekha-ImageCaption | Multimodal Vision-Language| [Mendeley Data DOI 10.17632/7754f4262j.1](https://data.mendeley.com/datasets/7754f4262j/1) | CC-BY-4.0 | JSON, CSV, ZIP | 9,150 Images / 45,750 Captions| Metadata & DOI Link | `verified_metadata_only` |
| **BAI-018** | BdSL36 Sign Language | Computer Vision / Gestures| [imruljubair/BdSLImset](https://github.com/imruljubair/BdSLImset) / [anno23/BdSL36](https://github.com/anno23/BdSL36) | CC-BY-NC-4.0 | ZIP, PNG | 36,000 Gesture Images | Benchmark Documentation | `verified_metadata_only` |

---

## Detailed Dataset Profiles & Verification Notes

### 1. Large Pre-training Text Corpora
- **Bangla2B+ / C4 Bangla Subset (`BAI-001`)**:
  - *Provenance*: Allen Institute for AI & Google Research. Extracted from petabyte-scale web crawls through Common Crawl, deduplicated and filtered for natural Bengali language.
  - *Storage Note*: Full uncompressed raw text exceeds 100 GB. We provide streaming loaders to process documents on-the-fly without exhausting local storage.
  - *Load Code*:
    ```python
    from datasets import load_dataset
    ds = load_dataset("allenai/c4", "bn", split="train", streaming=True)
    ```

- **BanglaBERT Pre-training Corpus (`BAI-002`)**:
  - *Provenance*: CSE BUET NLP Group (Bhattacharjee et al., Findings of NAACL 2022).
  - *Description*: Crawled from 110+ Bangladeshi news outlets, academic articles, and literature. The authors normalized the corpus using a custom Unicode pipeline and released it via official Google Drive (`1ORPugFNIBo8JfmS92zIOPe06XuWn4t_d`). Checkpoints available at `csebuetnlp/banglabert`.

---

### 2. Parallel Translation Corpora
- **IndicTrans2 / IN22-Gen (`BAI-003`)**:
  - *Provenance*: AI4Bharat, IIT Madras (Gala et al., 2023).
  - *Description*: High-quality English-Bengali translation benchmark spanning multiple domains (governance, education, literature, Wikipedia). IN22-Gen benchmark archive stored directly in Drive.
  - *Load Code*:
    ```python
    from datasets import load_dataset
    ds = load_dataset("ai4bharat/IN22-Gen")
    ```

- **BanglaParaphrase (`BAI-004`)**:
  - *Provenance*: CSE BUET NLP Group (Findings of EMNLP 2021).
  - *Description*: 512,000 semantically equivalent and syntactically diverse sentence pairs. The complete 36.24 MB ZIP archive containing train/dev/test splits is downloaded and verified in Google Drive (`translation/banglaparaphrase/BanglaParaphrase.zip`).

---

### 3. Sentiment Analysis
- **SentNoB (`BAI-005`)**:
  - *Provenance*: Khondoker Ittehadul Islam et al. (Findings of EMNLP 2021).
  - *Description*: Social media user comments across 13 domains annotated with 3-class sentiment (Positive, Negative, Neutral). Captures informal phonetic spelling and regional slang.
  - *Files in Drive*: `Train.csv` (12,576 rows), `Test.csv` (1,587 rows), `Val.csv` (1,568 rows).

- **BanglaBook (`BAI-006`)**:
  - *Provenance*: Kabir et al. (2023), East West University & IUT NLP groups.
  - *Description*: 158,065 consumer product and literary book reviews from Rokomari.com.
  - *Files in Drive*: `train.csv` (110,646 rows, 58.5 MB), `test.csv` (31,615 rows, 16.6 MB), `validation.csv` (15,807 rows, 8.38 MB).

---

### 4. Named Entity Recognition (NER)
- **BanglaNER (B-NER) (`BAI-007`)**:
  - *Provenance*: Summit Haque et al., SUST (IEEE Access 2023) & Saiful Islam.
  - *Description*: Gold-standard BIO-tagged dataset covering Person (PER), Organization (ORG), and Location (LOC) entity spans.
  - *Files in Drive*: `train.jsonl` (4,483 sentences), `val.jsonl` (1,161 sentences).

- **WikiANN Bangla Split (`BAI-008`)**:
  - *Provenance*: Pan et al. & Rahimi et al., University of Melbourne.
  - *Description*: Cross-lingual entity extraction benchmark derived from Bengali Wikipedia articles.
  - *Files in Drive*: `train-00000-of-00001.parquet` (10,000 rows), `test-00000-of-00001.parquet` (5,000 rows), `validation-00000-of-00001.parquet` (5,000 rows).

---

### 5. Question Answering (QA)
- **BanglaRQA (`BAI-009`)**:
  - *Provenance*: Sartaj Ekram et al., CSE BUET & UIU (2022).
  - *Description*: 14,889 extractive reading comprehension context-question-answer triples formatted identically to SQuAD v2.
  - *Files in Drive*: `Train.json` (26.53 MB), `Test.json` (3.44 MB), `Validation.json` (3.33 MB).

---

### 6. Speech Recognition (ASR) & Audio
- **Mozilla Common Voice Bangla (`BAI-010`)**:
  - *Provenance*: Mozilla Foundation & Bangladeshi open-source community.
  - *Description*: Over 412 hours of validated speech recorded by thousands of native speakers across Bangladesh with demographic metadata. Transcripts and manifests stored; streaming audio loader recommended.

- **Bengali.AI ASR Speech Corpus (`BAI-011`)**:
  - *Provenance*: Tareq et al., Bengali.AI Community (2023).
  - *Description*: 1,200 hours of spontaneous and dialectal speech collected across rural and urban districts. Hosted on Kaggle; access requires competition rules acceptance.

- **Google FLEURS Bengali (`BAI-012`)**:
  - *Provenance*: Conneau et al., Google Research (IEEE SLT 2023).
  - *Description*: Phonetically balanced 16kHz studio recordings with normalized Bengali text transcripts.
  - *Files in Drive*: `train.tsv` (3,006 sentences), `test.tsv` (920 sentences), `dev.tsv` (402 sentences).

---

### 7. OCR & Handwriting Recognition
- **BanglaLekha-Isolated (`BAI-013`)**:
  - *Provenance*: Biswas et al., University of Dhaka (Data in Brief 2017).
  - *Description*: 166,105 isolated handwritten characters across 84 classes (50 basic, 10 numerals, 24 compound letters). Verified Mendeley DOI: [10.17632/hf6sf8zrkc.2](https://data.mendeley.com/datasets/hf6sf8zrkc/2).

- **Ekush OCR (`BAI-014`)**:
  - *Provenance*: A.K.M. Shahariar Azad Rabby et al. (RTIP2R 2018).
  - *Correction*: The catalog previously listed 36,708 samples; the verified dataset contains **367,018 samples** collected from 3,086 writers across all 64 districts of Bangladesh. Project portal: [shahariarrabby.github.io/ekush](https://shahariarrabby.github.io/ekush/).

---

### 8. Regional Dialects & Misinformation
- **Bangla Regional Dialect Corpus (`BAI-015`)**:
  - *Provenance*: Samim et al., BRAC University & EWU.
  - *Description*: Multi-regional linguistic dataset mapping variations across Sylhet, Chittagong (Chatgaya), Noakhali, Barishal, and Rangpur.
  - *Files in Drive*: `train.parquet` (866 KB), `test.parquet` (110 KB), `validation.parquet` (116 KB).

- **BanFakeNews (`BAI-016`)**:
  - *Provenance*: Md Zobaer Hossain et al., SUST & University of Houston (LREC 2020).
  - *Description*: 50,000+ authentic vs satirical/fabricated news articles fact-checked by official verification portals. Original repository: [Rowan1224/FakeNews](https://github.com/Rowan1224/FakeNews).

---

### 9. Multimodal & Sign Language
- **BanglaLekha-ImageCaption (`BAI-017`)**:
  - *Provenance*: Ahsan et al., University of Dhaka & AUST (2021).
  - *Description*: Culturally adapted image captioning benchmark providing 5 native Bengali captions per image. Verified Mendeley DOI: [10.17632/7754f4262j.1](https://data.mendeley.com/datasets/7754f4262j/1).

- **BdSL36 Sign Language (`BAI-018`)**:
  - *Provenance*: Oishee Bintey Hoque, Mohammad Imrul Jubair, et al. (ACCV 2020).
  - *Description*: Standardized Bangladesh Sign Language (BdSL) alphabet and digit gestures. Baseline repository maintained by Mohammad Imrul Jubair: [imruljubair/BdSLImset](https://github.com/imruljubair/BdSLImset).

---

## Python Utilities

All synchronization and validation tools are located in [`bangla_ai/scripts/`](./scripts/):

```bash
# 1. Stream download verified datasets directly to Google Drive (Zero local SSD usage)
python bangla_ai/scripts/download_datasets.py

# 2. Verify dataset structural integrity, file presence, and SHA-256 checksums
python bangla_ai/scripts/verify_datasets.py

# 3. Synchronize manifest.json, download_report.csv, and checksums.csv between Drive and Git
python bangla_ai/scripts/sync_drive_manifest.py
```

---

## License & Usage Terms

All dataset metadata, loader scripts, schemas, and documentation in this repository are licensed under the **[MIT License](../LICENSE)**. 

Each indexed dataset preserves its original academic license and attribution requirements:
- **Creative Commons (CC-BY 4.0 / CC-BY-NC-SA 4.0 / CC-BY-SA 3.0)**
- **MIT License** (e.g., BanglaBook, BanglaNER, Ekush)
- **Open Data Commons Attribution (ODC-BY)** (C4 Bangla)
- **Creative Commons Public Domain (CC-0)** (Common Voice metadata)

Users must cite the original authors and institutions listed in [`manifest.json`](./manifest.json) when using these datasets in academic papers or production applications.
