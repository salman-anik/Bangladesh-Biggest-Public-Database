#!/usr/bin/env python3
"""
Example: Loading Speech Transcripts and Regional Dialect Datasets
Demonstrates loading Google FLEURS TSVs and DialectBD Parquet splits from Drive.
"""

import os
import pandas as pd

DRIVE_FLEURS = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\speech\fleurs"
DRIVE_DIALECTS = r"G:\My Drive\Bangladesh-Biggest-Public-Database\bangla_ai\dialects\dialectbd"

def load_fleurs_transcripts():
    train_tsv = os.path.join(DRIVE_FLEURS, "train.tsv")
    if os.path.exists(train_tsv):
        df_fleurs = pd.read_csv(train_tsv, sep="\t", header=None)
        print("Google FLEURS (Bengali bn_in) Transcripts:")
        print(f"Total train sentences: {len(df_fleurs)}")
        print(df_fleurs.head(2))

def load_dialects():
    train_parquet = os.path.join(DRIVE_DIALECTS, "train.parquet")
    if os.path.exists(train_parquet):
        df_dialects = pd.read_parquet(train_parquet)
        print("\nBangla Regional Dialects (DialectBD):")
        print(f"Total train samples: {len(df_dialects)}")
        print(df_dialects.head(2))

if __name__ == "__main__":
    load_fleurs_transcripts()
    load_dialects()
