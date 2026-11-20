#!/usr/bin/env python3
"""
High-Speed Cloud Sync for Bangla AI Datasets -> Google Drive
Designed to run in GitHub Actions / Cloud VMs at Gigabit speeds (100-300+ MB/s).
Uses GDRIVE_OAUTH_JSON secret to upload directly into Google Drive without touching local PC.
"""

import os
import sys
import json
import time
import hashlib
import urllib.request
import urllib.parse
import urllib.error
import mimetypes
import argparse
from pathlib import Path

DATASETS = [
    {
        "id": "BAI-002",
        "name": "Bangla2B+ / BanglaBERT Pre-training Corpus",
        "category_folder": "text_corpora/banglabert",
        "filename": "Bangla2B+.tar.bz2",
        "url": "https://drive.usercontent.google.com/download?id=1ORPugFNIBo8JfmS92zIOPe06XuWn4t_d&export=download&confirm=t"
    },
    {
        "id": "BAI-003",
        "name": "BanglaNMT Parallel Translation Corpus",
        "category_folder": "translation/indictrans2",
        "filename": "BanglaNMT.tar.bz2",
        "url": "https://huggingface.co/datasets/csebuetnlp/BanglaNMT/resolve/main/data/BanglaNMT.tar.bz2"
    },
    {
        "id": "BAI-004",
        "name": "BanglaParaphrase",
        "category_folder": "translation/banglaparaphrase",
        "filename": "BanglaParaphrase.zip",
        "url": "https://huggingface.co/datasets/csebuetnlp/BanglaParaphrase/resolve/main/data/BanglaParaphrase.zip"
    },
    {
        "id": "BAI-005",
        "name": "SentNoB Train",
        "category_folder": "sentiment/sentnob",
        "filename": "Train.csv",
        "url": "https://raw.githubusercontent.com/khondokerislam/SentNoB/main/Train.csv"
    },
    {
        "id": "BAI-005",
        "name": "SentNoB Test",
        "category_folder": "sentiment/sentnob",
        "filename": "Test.csv",
        "url": "https://raw.githubusercontent.com/khondokerislam/SentNoB/main/Test.csv"
    },
    {
        "id": "BAI-005",
        "name": "SentNoB Val",
        "category_folder": "sentiment/sentnob",
        "filename": "Val.csv",
        "url": "https://raw.githubusercontent.com/khondokerislam/SentNoB/main/Val.csv"
    },
    {
        "id": "BAI-006",
        "name": "BanglaBook Reviews Train",
        "category_folder": "sentiment/bangla_book_reviews",
        "filename": "train.csv",
        "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/train.csv"
    },
    {
        "id": "BAI-006",
        "name": "BanglaBook Reviews Test",
        "category_folder": "sentiment/bangla_book_reviews",
        "filename": "test.csv",
        "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/test.csv"
    },
    {
        "id": "BAI-006",
        "name": "BanglaBook Reviews Validation",
        "category_folder": "sentiment/bangla_book_reviews",
        "filename": "validation.csv",
        "url": "https://raw.githubusercontent.com/mohsinulkabir14/BanglaBook/main/data/csv/validation.csv"
    },
    {
        "id": "BAI-007",
        "name": "BanglaNER Train",
        "category_folder": "ner/banglaner",
        "filename": "train.jsonl",
        "url": "https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0/resolve/main/train.jsonl"
    },
    {
        "id": "BAI-007",
        "name": "BanglaNER Val",
        "category_folder": "ner/banglaner",
        "filename": "val.jsonl",
        "url": "https://huggingface.co/datasets/saiful9379/BanglaNER_V1.0/resolve/main/val.jsonl"
    },
    {
        "id": "BAI-008",
        "name": "WikiANN Bangla Train Parquet",
        "category_folder": "ner/wikiann",
        "filename": "train-00000-of-00001.parquet",
        "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/refs%2Fconvert%2Fparquet/bn/train/0000.parquet"
    },
    {
        "id": "BAI-008",
        "name": "WikiANN Bangla Test Parquet",
        "category_folder": "ner/wikiann",
        "filename": "test-00000-of-00001.parquet",
        "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/refs%2Fconvert%2Fparquet/bn/test/0000.parquet"
    },
    {
        "id": "BAI-008",
        "name": "WikiANN Bangla Validation Parquet",
        "category_folder": "ner/wikiann",
        "filename": "validation-00000-of-00001.parquet",
        "url": "https://huggingface.co/datasets/unimelb-nlp/wikiann/resolve/refs%2Fconvert%2Fparquet/bn/validation/0000.parquet"
    },
    {
        "id": "BAI-009",
        "name": "BanglaRQA QA Train",
        "category_folder": "question_answering/banglarqa",
        "filename": "Train.json",
        "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Train.json"
    },
    {
        "id": "BAI-009",
        "name": "BanglaRQA QA Test",
        "category_folder": "question_answering/banglarqa",
        "filename": "Test.json",
        "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Test.json"
    },
    {
        "id": "BAI-009",
        "name": "BanglaRQA QA Validation",
        "category_folder": "question_answering/banglarqa",
        "filename": "Validation.json",
        "url": "https://huggingface.co/datasets/sartajekram/BanglaRQA/resolve/main/Validation.json"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Audio Dev",
        "category_folder": "speech/fleurs",
        "filename": "dev.tar.gz",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/audio/dev.tar.gz"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Audio Test",
        "category_folder": "speech/fleurs",
        "filename": "test.tar.gz",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/audio/test.tar.gz"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Audio Train",
        "category_folder": "speech/fleurs",
        "filename": "train.tar.gz",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/audio/train.tar.gz"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Train TSV",
        "category_folder": "speech/fleurs",
        "filename": "train.tsv",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/train.tsv"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Dev TSV",
        "category_folder": "speech/fleurs",
        "filename": "dev.tsv",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/dev.tsv"
    },
    {
        "id": "BAI-012",
        "name": "Google FLEURS Bengali Test TSV",
        "category_folder": "speech/fleurs",
        "filename": "test.tsv",
        "url": "https://huggingface.co/datasets/google/fleurs/resolve/main/data/bn_in/test.tsv"
    },
    {
        "id": "BAI-015",
        "name": "DialectBD Train Parquet",
        "category_folder": "dialects/dialectbd",
        "filename": "train.parquet",
        "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/train.parquet"
    },
    {
        "id": "BAI-015",
        "name": "DialectBD Test Parquet",
        "category_folder": "dialects/dialectbd",
        "filename": "test.parquet",
        "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/test.parquet"
    },
    {
        "id": "BAI-015",
        "name": "DialectBD Validation Parquet",
        "category_folder": "dialects/dialectbd",
        "filename": "validation.parquet",
        "url": "https://huggingface.co/datasets/samim5669/bangla-regional-dialect-dataset/resolve/main/data/validation.parquet"
    },
    {
        "id": "BAI-016",
        "name": "BanFakeNews 2.0 Full",
        "category_folder": "fake_news/banfakenews",
        "filename": "All60Kdataset.csv",
        "url": "https://huggingface.co/datasets/hrshihab/BanFakeNews-2.0/resolve/main/All60Kdataset.csv"
    },
    {
        "id": "BAI-014",
        "name": "Ekush OCR Full Dataset Archive",
        "category_folder": "ocr_handwriting/ekush",
        "filename": "dataset.zip",
        "url": "https://drive.usercontent.google.com/download?id=1fI5a1ubgXczmjVM6We3DkB7Lqwdj80uj&export=download&confirm=t"
    },
    {
        "id": "BAI-014",
        "name": "Ekush OCR Image Metadata CSV",
        "category_folder": "ocr_handwriting/ekush",
        "filename": "metaData_img.csv",
        "url": "https://drive.usercontent.google.com/download?id=142hWB_25yZGOZlBYOvNZ3w5AWIdfInaK&export=download&confirm=t"
    },
    {
        "id": "BAI-001",
        "name": "C4 Bangla Validation Split",
        "category_folder": "text_corpora/bangla2b",
        "filename": "c4-bn-validation.tfrecord-00000-of-00001.json.gz",
        "url": "https://huggingface.co/datasets/allenai/c4/resolve/main/multilingual/c4-bn-validation.tfrecord-00000-of-00001.json.gz"
    },
    {
        "id": "BAI-001",
        "name": "C4 Bangla Train Shard 0",
        "category_folder": "text_corpora/bangla2b",
        "filename": "c4-bn.tfrecord-00000-of-00512.json.gz",
        "url": "https://huggingface.co/datasets/allenai/c4/resolve/main/multilingual/c4-bn.tfrecord-00000-of-00512.json.gz"
    },
    {
        "id": "BAI-010",
        "name": "Common Voice Bangla Train TSV",
        "category_folder": "speech/common_voice",
        "filename": "train.tsv",
        "url": "https://huggingface.co/datasets/bengaliAI/CommonVoiceBangla/resolve/main/bengali_ai_tsv/train.tsv"
    },
    {
        "id": "BAI-010",
        "name": "Common Voice Bangla Dev TSV",
        "category_folder": "speech/common_voice",
        "filename": "dev.tsv",
        "url": "https://huggingface.co/datasets/bengaliAI/CommonVoiceBangla/resolve/main/bengali_ai_tsv/dev.tsv"
    },
    {
        "id": "BAI-010",
        "name": "Common Voice Bangla Test TSV",
        "category_folder": "speech/common_voice",
        "filename": "test.tsv",
        "url": "https://huggingface.co/datasets/bengaliAI/CommonVoiceBangla/resolve/main/bengali_ai_tsv/test.tsv"
    },
    {
        "id": "BAI-010",
        "name": "Common Voice Bangla Audio Train Archive",
        "category_folder": "speech/common_voice",
        "filename": "train_audio.xz",
        "url": "https://drive.usercontent.google.com/download?id=1KYTCAi9J25ngzxq22mCrKTEVg0i3ZVil&export=download&confirm=t"
    },
    {
        "id": "BAI-011",
        "name": "Bengali.AI ASR Speech Shard 1",
        "category_folder": "speech/bengaliai_speech",
        "filename": "train-00000-of-00002.parquet",
        "url": "https://huggingface.co/datasets/arif11/Bengali_AI_Speech/resolve/main/data/train-00000-of-00002-a03a79119f68cd6c.parquet"
    },
    {
        "id": "BAI-011",
        "name": "Bengali.AI ASR Speech Shard 2",
        "category_folder": "speech/bengaliai_speech",
        "filename": "train-00001-of-00002.parquet",
        "url": "https://huggingface.co/datasets/arif11/Bengali_AI_Speech/resolve/main/data/train-00001-of-00002-701cda474601397f.parquet"
    },
    {
        "id": "BAI-018",
        "name": "Bangla Sign Sentences Excel",
        "category_folder": "sign_language/bdsl36",
        "filename": "Bangla_Sign_Sentence.xlsx",
        "url": "https://huggingface.co/datasets/banglagov/Ban-Sign-Sent-9K-V1/resolve/main/Bangla_Sign_Sentence.xlsx"
    },
    {
        "id": "BAI-013",
        "name": "BanglaLekha-Isolated Handwriting Full Dataset",
        "category_folder": "ocr_handwriting/banglalekha",
        "filename": "BanglaLekha-Isolated.zip",
        "url": "https://data.mendeley.com/public-files/datasets/hf6sf8zrkc/files/ffe73a3a-5999-4ad2-970f-3e14c141cdb1/file_downloaded"
    },
    {
        "id": "BAI-017",
        "name": "BanglaLekha-ImageCaption Captions JSON",
        "category_folder": "multimodal/bengali_image_captioning",
        "filename": "captions.json",
        "url": "https://data.mendeley.com/public-files/datasets/rxxch9vw59/files/9b3e789a-5a5c-48b3-8a2c-2c91e9307c2a/file_downloaded"
    },
    {
        "id": "BAI-017",
        "name": "BanglaLekha-ImageCaption Images Archive",
        "category_folder": "multimodal/bengali_image_captioning",
        "filename": "images.zip",
        "url": "https://data.mendeley.com/public-files/datasets/rxxch9vw59/files/220ffc5a-8645-4c0b-bd1b-97188836ed3b/file_downloaded"
    }
]

class GdriveCloudClient:
    def __init__(self, oauth_json_str):
        data = json.loads(oauth_json_str)
        self.client_id = data.get("client_id")
        self.client_secret = data.get("client_secret")
        self.refresh_token = data.get("refresh_token")
        self.access_token = data.get("access_token")
        self.token_expiry = 0

    def get_token(self):
        now = time.time()
        if self.access_token and now < self.token_expiry - 60:
            return self.access_token
        
        body = urllib.parse.urlencode({
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": self.refresh_token,
            "grant_type": "refresh_token"
        }).encode("utf-8")
        req = urllib.request.Request("https://oauth2.googleapis.com/token", data=body, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            tok = json.loads(resp.read().decode("utf-8"))
        self.access_token = tok["access_token"]
        self.token_expiry = now + int(tok.get("expires_in", 3600))
        return self.access_token

    def find_or_create_folder(self, name, parent_id="root"):
        token = self.get_token()
        query = f"name = '{name}' and '{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
        url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(query)}&fields=files(id,name)"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("files"):
                return data["files"][0]["id"]

        # Create folder
        create_url = "https://www.googleapis.com/drive/v3/files?fields=id"
        body = json.dumps({
            "name": name,
            "parents": [parent_id],
            "mimeType": "application/vnd.google-apps.folder"
        }).encode("utf-8")
        req = urllib.request.Request(create_url, data=body, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))["id"]

    def find_file(self, name, parent_id):
        token = self.get_token()
        query = f"name = '{name}' and '{parent_id}' in parents and trashed = false"
        url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(query)}&fields=files(id,name,size)"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("files"):
                return data["files"][0]
        return None

    def upload_file_resumable(self, file_path, parent_id):
        file_path = Path(file_path)
        file_size = file_path.stat().st_size
        mime = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        token = self.get_token()

        # Step 1: Initialize resumable session
        init_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name"
        meta = json.dumps({"name": file_path.name, "parents": [parent_id]}).encode("utf-8")
        init_req = urllib.request.Request(init_url, data=meta, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": mime,
            "X-Upload-Content-Length": str(file_size)
        }, method="POST")

        with urllib.request.urlopen(init_req, timeout=60) as resp:
            session_url = resp.headers["Location"]

        # Step 2: Upload in 16 MB chunks
        chunk_size = 16 * 1024 * 1024
        with open(file_path, "rb") as f:
            offset = 0
            while offset < file_size:
                chunk = f.read(chunk_size)
                end = offset + len(chunk) - 1
                headers = {
                    "Content-Range": f"bytes {offset}-{end}/{file_size}",
                    "Content-Length": str(len(chunk))
                }
                put_req = urllib.request.Request(session_url, data=chunk, headers=headers, method="PUT")
                try:
                    with urllib.request.urlopen(put_req, timeout=120) as put_resp:
                        if put_resp.status in (200, 201):
                            data = json.loads(put_resp.read().decode("utf-8"))
                            return data["id"]
                except urllib.error.HTTPError as e:
                    if e.code == 308: # Resume incomplete, proceed to next chunk
                        pass
                    else:
                        raise e
                offset += len(chunk)
                print(f"    Uploaded: {offset / (1024*1024):.1f} MB / {file_size / (1024*1024):.1f} MB ({(offset/file_size)*100:.1f}%)")
        return None

def main():
    parser = argparse.ArgumentParser(description="Bangla AI Gigabit Cloud Sync to Google Drive")
    parser.add_argument("--dataset", default="all", help="Dataset ID (e.g. BAI-013, BAI-017) or 'all'")
    args = parser.parse_args()

    oauth_json = os.environ.get("GDRIVE_OAUTH_JSON")
    if not oauth_json:
        print("Error: GDRIVE_OAUTH_JSON environment variable is required.")
        sys.exit(1)

    print("=" * 80)
    print("GITHUB ACTIONS CLOUD SYNC -> GOOGLE DRIVE (GIGABIT SPEED)")
    print(f"Target filter: {args.dataset}")
    print("=" * 80)

    client = GdriveCloudClient(oauth_json)
    root_folder = client.find_or_create_folder("Bangladesh-Biggest-Public-Database")
    bangla_ai_folder = client.find_or_create_folder("bangla_ai", root_folder)

    tmp_dir = Path("/tmp/bangla_ai_cloud_sync")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    for item in DATASETS:
        if args.dataset.lower() != "all" and item["id"].lower() != args.dataset.lower():
            continue

        fname = item["filename"]
        url = item["url"]
        cat_parts = item["category_folder"].split("/")
        
        # Ensure category folder exists in Drive
        cur_parent = bangla_ai_folder
        for part in cat_parts:
            cur_parent = client.find_or_create_folder(part, cur_parent)

        # Deduplication check: skip if already present in Google Drive
        existing = client.find_file(fname, cur_parent)
        if existing and int(existing.get("size", 0)) > 0:
            print(f"[SKIP] {fname} ({item['name']}) already exists in Drive (ID: {existing['id']}, Size: {int(existing['size'])/(1024*1024):.2f} MB). Skipping download.")
            continue

        local_file = tmp_dir / fname
        print(f"\n[CLOUD STREAM] Downloading {fname} ({item['name']}) at Gigabit speed...")
        t0 = time.time()
        
        # Download at Azure cloud speed with progress
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=300) as resp, open(local_file, "wb") as f:
            total_dl = 0
            content_length = int(resp.headers.get("Content-Length", 0))
            last_print = time.time()
            while chunk := resp.read(4 * 1024 * 1024): # 4 MB buffer
                f.write(chunk)
                total_dl += len(chunk)
                if time.time() - last_print > 5:
                    if content_length > 0:
                        print(f"    Downloaded: {total_dl / (1024*1024):.1f} MB / {content_length / (1024*1024):.1f} MB ({(total_dl/content_length)*100:.1f}%)")
                    else:
                        print(f"    Downloaded: {total_dl / (1024*1024):.1f} MB")
                    last_print = time.time()
        
        dl_time = time.time() - t0
        size_mb = local_file.stat().st_size / (1024*1024)
        print(f"  Downloaded {size_mb:.2f} MB in {dl_time:.1f}s ({size_mb / max(dl_time, 0.001):.2f} MB/s)")

        print(f"  Uploading to Google Drive folder '{item['category_folder']}'...")
        t1 = time.time()
        file_id = client.upload_file_resumable(local_file, cur_parent)
        ul_time = time.time() - t1
        print(f"  Uploaded to Drive! File ID: {file_id} in {ul_time:.1f}s")

        # Delete local file from cloud runner immediately
        local_file.unlink()

    print("\nCloud sync to Google Drive completed successfully!")

if __name__ == "__main__":
    main()
