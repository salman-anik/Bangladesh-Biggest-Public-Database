# Bangla AI & Machine Learning Hub

[![Status: Maintained](https://img.shields.io/badge/Status-Maintained-brightgreen.svg)](#)
[![Datasets: 18 Benchmarks](https://img.shields.io/badge/Datasets-18%20Benchmarks-blue.svg)](#)
[![Drive Mirror: 7.19 GB Verified](https://img.shields.io/badge/Google%20Drive-7.19%20GB%20Verified-orange.svg)](#)
[![Language: Bengali](https://img.shields.io/badge/Language-Bangla%20(bn)-darkgreen.svg)](#)
[![License: Open Attribution](https://img.shields.io/badge/License-Academic%20%26%20Open-yellow.svg)](#)

A centralized, standardized, and verified collection of 18 premier artificial intelligence, machine learning, and natural language processing (NLP) datasets for the Bengali language.

This hub connects open-source researchers, data engineers, and machine learning practitioners to verified datasets across large-scale pre-training text corpora, neural machine translation, sentiment analysis, named entity recognition (NER), reading comprehension question answering (QA), automatic speech recognition (ASR), optical character recognition (OCR), regional dialect identification, misinformation detection, multimodal image captioning, and sign language recognition.

---

## Architecture & Storage Strategy

To ensure sustainable open-source development and avoid repository bloat:

- **GitHub Repository**: Stores all verified metadata, schemas, validation utilities, data loaders, SHA-256 checksums, and dataset documentation.
- **Google Drive Storage Mirror**: Stores actual verified binary datasets (CSV, JSON, Parquet, TSV, ZIP, TAR.GZ, TAR.BZ2) structured under:
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

| ID | Dataset Name | Domain / Task | Verified Source & Repository | License | Formats | Reported Size | Downloaded Size (Drive) | Drive Access | Status |
|---|---|---|---|---|---|---|---|---|---|
| **BAI-001** | Bangla2B+ / C4 Bangla | Large Text Corpora | [allenai/c4 (bn)](https://huggingface.co/datasets/allenai/c4) | ODC-BY | JSONL, Parquet, GZIP | 2B+ Tokens / 15M Docs | Streaming Ref | [Folder](https://drive.google.com/drive/folders/1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf) | `license_restricted_or_huge` |
| **BAI-002** | BanglaBERT Pre-training Corpus | Large Text Corpora | [csebuetnlp/banglabert](https://github.com/csebuetnlp/banglabert) | CC-BY-NC-SA-4.0 | TAR.BZ2 | 27.5 GB Text / 110M Sentences | **4.13 GB** (3.85 GiB) | [File (1vtGs...)](https://drive.google.com/file/d/1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf/view) | `verified_and_downloaded` |
| **BAI-003** | IndicTrans2 / IN22-Gen | Machine Translation | [ai4bharat/IN22-Gen](https://huggingface.co/datasets/ai4bharat/IN22-Gen) / [csebuetnlp/BanglaNMT](https://huggingface.co/datasets/csebuetnlp/BanglaNMT) | CC-BY-4.0 | TAR.BZ2 | 2.75M Pairs / 5.4M benchmark | **132.84 MB** | [File (1qtOV...)](https://drive.google.com/file/d/1qtOV4fIHvtjdPVfINoiFW0u2kC3yL5aQ/view) | `verified_and_downloaded` |
| **BAI-004** | BanglaParaphrase | Paraphrase Detection | [csebuetnlp/BanglaParaphrase](https://huggingface.co/datasets/csebuetnlp/BanglaParaphrase) | CC-BY-NC-SA-4.0 | ZIP, TSV | 512,000 Pairs | **38.00 MB** | [File (1jYe0...)](https://drive.google.com/file/d/1jYe0tZjTmi337UPpQbb5bw1htdA7vvpG/view) | `verified_and_downloaded` |
| **BAI-005** | SentNoB | Sentiment Analysis | [khondoker/SentNoB](https://huggingface.co/datasets/khondoker/SentNoB) | CC-BY-4.0 | CSV | 15,728 Comments | **3.18 MB** (3 CSVs) | [Folder](https://drive.google.com/drive/folders/1Xsut6Xx5DQYmQqikHekY3siY6v6TjLsl) | `verified_and_downloaded` |
| **BAI-006** | BanglaBook Sentiment | Sentiment Analysis | [mohsinulkabir14/BanglaBook](https://github.com/mohsinulkabir14/BanglaBook) | MIT | CSV | 158,065 Reviews | **83.52 MB** (3 CSVs) | [File (1Xsut...)](https://drive.google.com/file/d/1Xsut6Xx5DQYmQqikHekY3siY6v6TjLsl/view) | `verified_and_downloaded` |
| **BAI-007** | BanglaNER (B-NER) | Named Entity Recognition | [saiful9379/BanglaNER_V1.0](https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0) | MIT / CC-BY-4.0 | JSONL (BIO) | 38,000 Sentences | **1.70 MB** (2 JSONLs) | [Folder](https://drive.google.com/drive/folders/1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf) | `verified_and_downloaded` |
| **BAI-008** | WikiANN Bangla Split | Named Entity Recognition | [unimelb-nlp/wikiann (bn)](https://huggingface.co/datasets/unimelb-nlp/wikiann) | CC-BY-SA-3.0 | Parquet | 20,000 Sentences | **651.76 KB** (3 Parquets) | [Folder](https://drive.google.com/drive/folders/1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf) | `verified_and_downloaded` |
| **BAI-009** | BanglaRQA | Question Answering | [sartajekram/BanglaRQA](https://huggingface.co/datasets/sartajekram/BanglaRQA) | CC-BY-NC-SA-4.0 | JSON (SQuAD) | 14,889 QA Triples | **33.30 MB** (3 JSONs) | [File (1v_Na...)](https://drive.google.com/file/d/1v_NabJjyNEVHxP_YZqk_gSWMuCLtTbSe/view) | `verified_and_downloaded` |
| **BAI-010** | Mozilla Common Voice Bangla | Speech Recognition (ASR)| [commonvoice.mozilla.org](https://commonvoice.mozilla.org/en/datasets) / [HF CommonVoice](https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0) | CC-0 (Public Domain) | MP3, TSV | 412 Audio Hours (>40 GB) | Metadata & Manifests | [Instructions](#6-speech-recognition-asr--audio) | `partially_downloaded` |
| **BAI-011** | Bengali.AI ASR Corpus | Speech Recognition (ASR)| [kaggle:bengaliai-speech](https://www.kaggle.com/competitions/bengaliai-speech/data) | CC-BY-NC-4.0 | MP3, Parquet, CSV | 1,200 Hours (>100 GB) | Access Instructions | [Kaggle Portal](https://www.kaggle.com/competitions/bengaliai-speech/data) | `access_required` |
| **BAI-012** | Google FLEURS Bengali | Speech Recognition & Audio| [google/fleurs (bn_in)](https://huggingface.co/datasets/google/fleurs) | CC-BY-4.0 | TSV, TAR.GZ | 12.5 Studio Hours (2.97 GB) | **2.78 GB** (Audio + TSVs) | [File (1e-74...)](https://drive.google.com/file/d/1e-748vJLHn14UTIbth1RHHJ5AxCFDLEy/view) | `verified_and_downloaded` |
| **BAI-013** | BanglaLekha-Isolated | Handwriting Recognition | [Mendeley Data DOI 10.17632/hf6sf8zrkc.2](https://data.mendeley.com/datasets/hf6sf8zrkc/2) | CC-BY-NC-4.0 | ZIP, PNG, CSV | 166,105 Images (760 MB) | Metadata & DOI Link | [Mendeley](https://data.mendeley.com/datasets/hf6sf8zrkc/2) | `access_required` |
| **BAI-014** | Ekush OCR | Handwriting & Printed OCR | [ShahariarRabby/Ekush](https://github.com/ShahariarRabby/Ekush) / [Kaggle](https://www.kaggle.com/datasets/shahariarrabby/ekush-bangla-handwritten-characters) | Academic / CC-BY-4.0 | ZIP, PNG, CSV | 367,018 Characters (1.2 GB)| Metadata & Portal | [Project Portal](https://shahariarrabby.github.io/ekush/) | `access_required` |
| **BAI-015** | DialectBD (Regional Dialects) | Dialect Identification | [samim5669/bangla-regional-dialect-dataset](https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset) | CC-BY-4.0 | Parquet | 24,000 Samples | **1.07 MB** (3 Parquets) | [Folder](https://drive.google.com/drive/folders/1e-748vJLHn14UTIbth1RHHJ5AxCFDLEy) | `verified_and_downloaded` |
| **BAI-016** | BanFakeNews 2.0 | Misinformation Detection | [Rowan1224/FakeNews](https://github.com/Rowan1224/FakeNews) / [hrshihab/BanFakeNews-2.0](https://huggingface.co/datasets/hrshihab/BanFakeNews-2.0) | CC-BY-4.0 | CSV | 60,000+ News Articles | **304.59 MB** | [File (1cFbR...)](https://drive.google.com/file/d/1cFbRWoDoZap-jWOcCnWVXC6reZrJcmNQ/view) | `verified_and_downloaded` |
| **BAI-017** | BanglaLekha-ImageCaption | Multimodal Vision-Language| [Mendeley Data DOI 10.17632/7754f4262j.1](https://data.mendeley.com/datasets/7754f4262j/1) | CC-BY-4.0 | JSON, CSV, ZIP | 9,150 Images / 45,750 Captions| Metadata & DOI Link | [Mendeley](https://data.mendeley.com/datasets/7754f4262j/1) | `access_required` |
| **BAI-018** | BdSL36 Sign Language | Computer Vision / Gestures| [imruljubair/BdSLImset](https://github.com/imruljubair/BdSLImset) | CC-BY-NC-4.0 | ZIP, PNG | 36,000 Gesture Images | Benchmark Documentation | [GitHub](https://github.com/imruljubair/BdSLImset) | `access_required` |

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
  - *Description*: Crawled from 110+ Bangladeshi news outlets, academic articles, and literature. The authors normalized the corpus using a custom Unicode pipeline and released it via official Google Drive (`1ORPugFNIBo8JfmS92zIOPe06XuWn4t_d`).
  - *Files in Drive*: `Bangla2B+.tar.bz2` (**4.13 GB**, SHA-256: `537ebee2b2ac6c3f6d40115b41d9dd6ce4404944c76687499fa9130f6846cc73`).
  - *Drive File ID*: `1vtGsRngGa8OTdVAO328-sv1LGz-VU_xf`.

---

### 2. Parallel Translation Corpora
- **IndicTrans2 / BanglaNMT (`BAI-003`)**:
  - *Provenance*: AI4Bharat, IIT Madras (Gala et al., 2023) & CSE BUET NLP.
  - *Description*: High-quality English-Bengali translation benchmark spanning multiple domains (governance, education, literature, Wikipedia).
  - *Files in Drive*: `BanglaNMT.tar.bz2` (**132.84 MB**, SHA-256: `2ad7eef20067ff0c8686f0aa6743ffaa6ff15f8a00263f3ae10e542d62706e4a`, 2.75M parallel sentence pairs).
  - *Drive File ID*: `1qtOV4fIHvtjdPVfINoiFW0u2kC3yL5aQ`.

- **BanglaParaphrase (`BAI-004`)**:
  - *Provenance*: CSE BUET NLP Group (Findings of EMNLP 2021).
  - *Description*: 512,000 semantically equivalent and syntactically diverse sentence pairs.
  - *Files in Drive*: `BanglaParaphrase.zip` (**38.00 MB**, SHA-256: `8f27c967bcb75620fa2c94fb34159795f680df3b28b45f9f40b88a1bf1573a6f`).
  - *Drive File ID*: `1jYe0tZjTmi337UPpQbb5bw1htdA7vvpG`.

---

### 3. Sentiment Analysis
- **SentNoB (`BAI-005`)**:
  - *Provenance*: Khondoker Ittehadul Islam et al. (Findings of EMNLP 2021).
  - *Description*: Social media user comments across 13 domains annotated with 3-class sentiment (Positive, Negative, Neutral). Captures informal phonetic spelling and regional slang.
  - *Files in Drive*: `Train.csv` (12,576 rows, 2.53 MB), `Test.csv` (1,587 rows, 326 KB), `Val.csv` (1,568 rows, 337 KB).

- **BanglaBook (`BAI-006`)**:
  - *Provenance*: Kabir et al. (2023), East West University & IUT NLP groups.
  - *Description*: 158,065 consumer product and literary book reviews from Rokomari.com.
  - *Files in Drive*: `train.csv` (110,646 rows, 58.5 MB), `test.csv` (31,615 rows, 16.6 MB), `validation.csv` (15,807 rows, 8.38 MB).
  - *Drive File ID*: `1Xsut6Xx5DQYmQqikHekY3siY6v6TjLsl`.

---

### 4. Named Entity Recognition (NER)
- **BanglaNER (B-NER) (`BAI-007`)**:
  - *Provenance*: Summit Haque et al., SUST (IEEE Access 2023) & Saiful Islam.
  - *Description*: Gold-standard BIO-tagged dataset covering Person (PER), Organization (ORG), and Location (LOC) entity spans.
  - *Files in Drive*: `train.jsonl` (4,483 sentences, 1.35 MB), `val.jsonl` (1,161 sentences, 362 KB).

- **WikiANN Bangla Split (`BAI-008`)**:
  - *Provenance*: Pan et al. & Rahimi et al., University of Melbourne.
  - *Description*: Cross-lingual entity extraction benchmark derived from Bengali Wikipedia articles.
  - *Files in Drive*: `train-00000-of-00001.parquet` (10,000 rows, 540 KB), `test-00000-of-00001.parquet` (5,000 rows, 56 KB), `validation-00000-of-00001.parquet` (5,000 rows, 54 KB).

---

### 5. Question Answering (QA)
- **BanglaRQA (`BAI-009`)**:
  - *Provenance*: Sartaj Ekram et al., CSE BUET & UIU (2022).
  - *Description*: 14,889 extractive reading comprehension context-question-answer triples formatted identically to SQuAD v2.
  - *Files in Drive*: `Train.json` (26.53 MB), `Test.json` (3.44 MB), `Validation.json` (3.33 MB).
  - *Drive File ID*: `1v_NabJjyNEVHxP_YZqk_gSWMuCLtTbSe`.

---

### 6. Speech Recognition (ASR) & Audio
- **Google FLEURS Bengali (`BAI-012`)**:
  - *Provenance*: Conneau et al., Google Research (IEEE SLT 2023).
  - *Description*: Phonetically balanced 16kHz studio recordings with normalized Bengali text transcripts. Complete audio archives (train, test, dev) and normalized transcript TSVs mirrored in Drive.
  - *Files in Drive*: 
    - `train.tar.gz` (**1.89 GB / 2,034,709,059 bytes**, SHA-256: `27199ad0041edeb5efe16948718b866c2417f4c88c2eeadebdadf269a041ab8f`)
    - `test.tar.gz` (**629.14 MB**, SHA-256: `fb9873d195973eefd6b2c6861214e91fb6cbfe5febe22f7b8849b28f80479b18`)
    - `dev.tar.gz` (**265.76 MB**, SHA-256: `e5c70ba921ef41712aee784e8db3a875a5e3bc7c81308a9ad0809b45bf94a1ca`)
    - `train.tsv` (3.32 MB), `test.tsv` (1.04 MB), `dev.tsv` (455 KB)
  - *Drive File ID*: `1e-748vJLHn14UTIbth1RHHJ5AxCFDLEy`.

- **Mozilla Common Voice Bangla (`BAI-010`)**:
  - *Provenance*: Mozilla Foundation & Bangladeshi open-source community.
  - *Description*: Over 412 hours of validated speech recorded by thousands of native speakers across Bangladesh with demographic metadata. Audio files require accepting Mozilla Common Voice terms on Hugging Face (`mozilla-foundation/common_voice_17_0`).

- **Bengali.AI ASR Speech Corpus (`BAI-011`)**:
  - *Provenance*: Tareq et al., Bengali.AI Community (2023).
  - *Description*: 1,200 hours of spontaneous and dialectal speech collected across rural and urban districts. Hosted on Kaggle; access requires competition rules acceptance.

---

### 7. OCR & Handwriting Recognition
- **Ekush OCR (`BAI-014`)**:
  - *Provenance*: A.K.M. Shahariar Azad Rabby et al. (RTIP2R 2018).
  - *Correction*: The catalog previously listed 36,708 samples; the verified dataset contains **367,018 samples** collected from 3,086 writers across all 64 districts of Bangladesh. Project portal: [shahariarrabby.github.io/ekush](https://shahariarrabby.github.io/ekush/).
  - *Access Note*: Requires Kaggle or Elsevier account registration.

- **BanglaLekha-Isolated (`BAI-013`)**:
  - *Provenance*: Biswas et al., University of Dhaka (Data in Brief 2017).
  - *Description*: 166,105 isolated handwritten characters across 84 classes (50 basic, 10 numerals, 24 compound letters). Verified Mendeley DOI: [10.17632/hf6sf8zrkc.2](https://data.mendeley.com/datasets/hf6sf8zrkc/2).

---

### 8. Regional Dialects & Misinformation
- **Bangla Regional Dialect Corpus (`BAI-015`)**:
  - *Provenance*: Samim et al., BRAC University & EWU.
  - *Description*: Multi-regional linguistic dataset mapping variations across Sylhet, Chittagong (Chatgaya), Noakhali, Barishal, and Rangpur.
  - *Files in Drive*: `train.parquet` (866 KB), `test.parquet` (110 KB), `validation.parquet` (116 KB).

- **BanFakeNews 2.0 (`BAI-016`)**:
  - *Provenance*: Md Zobaer Hossain et al., SUST & University of Houston (LREC 2020).
  - *Description*: 60,000+ authentic vs satirical/fabricated news articles fact-checked by official verification portals.
  - *Files in Drive*: `All60Kdataset.csv` (**304.59 MB / 290.48 MiB**, SHA-256: `ee7775a7cceeb9a5573e0474668ba4589d3a43fa4da3cf325c7e1ca3134ea4ea`).
  - *Drive File ID*: `1cFbRWoDoZap-jWOcCnWVXC6reZrJcmNQ`.

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

All synchronization, cloud sync, and validation tools are located in [`bangla_ai/scripts/`](./scripts/):

```bash
# 1. High-speed cloud sync (Gigabit speeds in GitHub Actions cloud runner directly to Google Drive)
python bangla_ai/scripts/cloud_sync_bangla_ai.py

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
