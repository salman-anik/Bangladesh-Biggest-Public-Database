#!/usr/bin/env python3
"""
Example: Loading Bangla Sentiment Datasets
Demonstrates loading SentNoB and BanglaBook from Hugging Face and local/Drive mirrors.
"""

import os
import pandas as pd

# Method 1: Loading from Google Drive mirror or local CSV
DRIVE_SENTNOB = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\sentiment\sentnob"
DRIVE_BANGLABOOK = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\sentiment\bangla_book_reviews"

def load_from_drive():
    if os.path.exists(DRIVE_SENTNOB):
        train_csv = os.path.join(DRIVE_SENTNOB, "Train.csv")
        df_sentnob = pd.read_csv(train_csv)
        print("SentNoB Loaded from Drive:")
        print(f"Total rows: {len(df_sentnob)}")
        print(df_sentnob.head(2))

    if os.path.exists(DRIVE_BANGLABOOK):
        train_csv = os.path.join(DRIVE_BANGLABOOK, "train.csv")
        df_book = pd.read_csv(train_csv)
        print("\nBanglaBook Loaded from Drive:")
        print(f"Total rows: {len(df_book)}")
        print(df_book.head(2))

# Method 2: Loading via Hugging Face datasets library
def load_from_huggingface():
    try:
        from datasets import load_dataset
        ds = load_dataset("khondoker/SentNoB")
        print("\nSentNoB via Hugging Face datasets:")
        print(ds["train"][0])
    except ImportError:
        print("\nInstall datasets: pip install datasets")

if __name__ == "__main__":
    load_from_drive()
