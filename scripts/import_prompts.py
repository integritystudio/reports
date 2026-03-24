#!/usr/bin/env python3
"""
Import full prompts.chat dataset from Hugging Face and organize into local directory.

Usage:
    python3 scripts/import_prompts.py

Requirements:
    pip install datasets pyarrow
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def sanitize_filename(text: str) -> str:
    """Convert prompt title to valid filename."""
    return text.lower().replace(" ", "-").replace("/", "-").replace(":", "")

def load_dataset():
    """Load dataset from Hugging Face."""
    try:
        from datasets import load_dataset
        print("📥 Loading dataset from Hugging Face...")
        dataset = load_dataset("fka/prompts.chat")
        return [dict(example) for example in dataset['train']]
    except ImportError:
        print("❌ Error: 'datasets' library not installed")
        print("   Install with: pip install datasets pyarrow")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        sys.exit(1)

def organize_prompts(prompts_dir: Path, prompts_data: list):
    """Organize prompts into dev/general directories."""
    # Create subdirectories
    dev_dir = prompts_dir / "dev"
    general_dir = prompts_dir / "general"
    metadata_dir = prompts_dir / "metadata"

    dev_dir.mkdir(parents=True, exist_ok=True)
    general_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)

    # Categorize prompts
    dev_prompts = []
    general_prompts = defaultdict(list)

    print(f"📋 Processing {len(prompts_data)} prompts...")

    for idx, prompt in enumerate(prompts_data):
        if idx % 100 == 0:
            print(f"   [{idx}/{len(prompts_data)}]")

        act = prompt.get("act", f"prompt_{idx}")
        prompt_text = prompt.get("prompt", "")
        is_dev = prompt.get("for_devs", False)
        contributor = prompt.get("contributor", "unknown")

        # Create markdown file
        filename = f"{sanitize_filename(act)}.md"
        category = "development" if is_dev else "general"

        content = f"""# {act}

**Category:** {category.title()}
**For Developers:** {is_dev}
**Contributor:** {contributor}
**Type:** {prompt.get('type', 'TEXT')}

## Prompt

{prompt_text}

---
*Source: [prompts.chat](https://prompts.chat) | License: CC0 1.0 (Public Domain)*
"""

        # Save file
        if is_dev:
            filepath = dev_dir / filename
            dev_prompts.append({
                "title": act,
                "file": f"dev/{filename}",
                "contributor": contributor
            })
        else:
            filepath = general_dir / filename
            general_prompts[category].append({
                "title": act,
                "file": f"general/{filename}",
                "category": category,
                "contributor": contributor
            })

        filepath.write_text(content, encoding='utf-8')

    # Save metadata
    print("💾 Saving metadata...")

    # Create index
    index_data = {
        "dataset": "fka/prompts.chat",
        "source_url": "https://huggingface.co/datasets/fka/prompts.chat",
        "total_prompts": len(prompts_data),
        "dev_prompts": len(dev_prompts),
        "general_prompts": len(prompts_data) - len(dev_prompts),
        "created": datetime.now().isoformat(),
        "license": "CC0 1.0 (Public Domain)",
        "prompts": prompts_data
    }

    with open(metadata_dir / "index.json", 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)

    # Create catalog
    catalog_data = {
        "developer_prompts": dev_prompts,
        "general_prompts": {k: v for k, v in sorted(general_prompts.items())}
    }

    with open(metadata_dir / "catalog.json", 'w', encoding='utf-8') as f:
        json.dump(catalog_data, f, indent=2, ensure_ascii=False)

    return len(dev_prompts), len(prompts_data) - len(dev_prompts)

def main():
    """Main entry point."""
    print("🚀 Prompts.chat Dataset Import Tool")
    print("=" * 50)

    # Determine prompts directory
    script_dir = Path(__file__).parent
    prompts_dir = script_dir.parent / "prompts"

    print(f"📁 Target directory: {prompts_dir}")
    print()

    # Load dataset
    prompts_data = load_dataset()
    print(f"✅ Loaded {len(prompts_data)} prompts from Hugging Face")
    print()

    # Organize
    dev_count, general_count = organize_prompts(prompts_dir, prompts_data)

    print()
    print("✨ Import Complete!")
    print("=" * 50)
    print(f"📊 Summary:")
    print(f"   Total prompts: {len(prompts_data)}")
    print(f"   Developer prompts: {dev_count}")
    print(f"   General prompts: {general_count}")
    print()
    print(f"📂 Files created:")
    print(f"   {dev_count} files in prompts/dev/")
    print(f"   {general_count} files in prompts/general/")
    print(f"   2 metadata files in prompts/metadata/")
    print()
    print(f"📖 Next steps:")
    print(f"   1. Browse prompts in: {prompts_dir}")
    print(f"   2. View metadata: {prompts_dir}/metadata/catalog.json")
    print(f"   3. Read guide: {prompts_dir}/README.md")

if __name__ == "__main__":
    main()
