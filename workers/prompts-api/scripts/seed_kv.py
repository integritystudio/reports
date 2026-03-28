#!/usr/bin/env python3
"""
seed_kv.py — Upload catalog.json (and optionally all prompt .md files) to
Cloudflare KV via the REST API.

Usage:
  # Catalog only (fast, required for API to work)
  python3 scripts/seed_kv.py --catalog-only

  # Catalog + all prompt files (1,562 files — slow, ~5 min)
  python3 scripts/seed_kv.py

Environment variables (or .dev.vars):
  CF_ACCOUNT_ID   — Cloudflare account ID
  CF_API_TOKEN    — API token with KV:Edit permission
  KV_NAMESPACE_ID — Target KV namespace ID

The KV_NAMESPACE_ID defaults to the production namespace. Pass
KV_NAMESPACE_ID=<preview_id> to seed the preview namespace for local dev.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import httpx
except ImportError:
    print("httpx not installed. Run: pip install httpx")
    sys.exit(1)

REPO_ROOT = Path(__file__).parent.parent.parent.parent  # reports/
PROMPTS_DIR = REPO_ROOT / "prompts"
CATALOG_PATH = PROMPTS_DIR / "metadata" / "catalog.json"

CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "b3868dd0fd5c0faa7d98aa325a9c2377")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")
KV_NAMESPACE_ID = os.environ.get("KV_NAMESPACE_ID", "ea9267c947334bf89917e218f3cd6ce7")

KV_BASE = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}"

# KV bulk write limit: 10,000 pairs per request, 100MB total
BULK_SIZE = 100


def headers() -> dict:
    if not CF_API_TOKEN:
        print("ERROR: CF_API_TOKEN env var not set.")
        sys.exit(1)
    return {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json",
    }


def put_bulk(client: httpx.Client, pairs: list[dict]) -> None:
    resp = client.put(f"{KV_BASE}/bulk", json=pairs, headers=headers())
    if resp.status_code not in (200, 201):
        print(f"  ERROR {resp.status_code}: {resp.text[:200]}")
        sys.exit(1)


def seed_catalog(client: httpx.Client) -> None:
    print("Seeding catalog.json …")
    catalog_text = CATALOG_PATH.read_text(encoding="utf-8")
    put_bulk(client, [{"key": "catalog", "value": catalog_text}])
    size_kb = len(catalog_text.encode()) / 1024
    print(f"  catalog → {size_kb:.1f} KB  OK")


def seed_prompts(client: httpx.Client) -> None:
    files = list((PROMPTS_DIR / "dev").glob("*.md")) + \
            list((PROMPTS_DIR / "general").glob("*.md"))

    print(f"Seeding {len(files)} prompt files …")
    batch: list[dict] = []
    written = 0

    for i, path in enumerate(files, 1):
        rel = path.relative_to(PROMPTS_DIR)  # e.g. dev/linux-terminal.md
        key = f"prompt:{rel}"
        value = path.read_text(encoding="utf-8")
        batch.append({"key": key, "value": value})

        if len(batch) >= BULK_SIZE:
            put_bulk(client, batch)
            written += len(batch)
            print(f"  {written}/{len(files)} uploaded …")
            batch = []
            time.sleep(0.3)  # stay well within rate limits

    if batch:
        put_bulk(client, batch)
        written += len(batch)

    print(f"  {written} prompt files seeded  OK")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Cloudflare KV for prompts-api")
    parser.add_argument("--catalog-only", action="store_true",
                        help="Upload only catalog.json (skip individual prompt files)")
    args = parser.parse_args()

    print(f"Target namespace: {KV_NAMESPACE_ID}")

    with httpx.Client(timeout=30) as client:
        seed_catalog(client)
        if not args.catalog_only:
            seed_prompts(client)

    print("\nDone.")


if __name__ == "__main__":
    main()
