#!/usr/bin/env python3
"""
Example: Loading Bangla QA and NER Datasets
Demonstrates loading BanglaRQA, BanglaNER, and WikiANN from Google Drive and Hugging Face.
"""

import os
import json

DRIVE_QA = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\question_answering\banglarqa"
DRIVE_NER = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\ner\banglaner"

def load_qa():
    train_json = os.path.join(DRIVE_QA, "Train.json")
    if os.path.exists(train_json):
        with open(train_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            print("BanglaRQA Loaded:")
            print(f"Top-level keys: {list(data.keys())}")
            if "data" in data and len(data["data"]) > 0:
                sample = data["data"][0]
                print(f"Sample Title: {sample.get('title')}")
                if "paragraphs" in sample and len(sample["paragraphs"]) > 0:
                    p = sample["paragraphs"][0]
                    print(f"Context snippet: {p.get('context')[:150]}...")

def load_ner():
    train_jsonl = os.path.join(DRIVE_NER, "train.jsonl")
    if os.path.exists(train_jsonl):
        print("\nBanglaNER Loaded:")
        with open(train_jsonl, "r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                if i >= 2:
                    break
                print(f"Record {i+1}: {line.strip()[:150]}...")

if __name__ == "__main__":
    load_qa()
    load_ner()
