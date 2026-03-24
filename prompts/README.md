# Prompts Directory

Curated collection of AI prompts sourced from the [fka/prompts.chat](https://huggingface.co/datasets/fka/prompts.chat) Hugging Face dataset (1,546 total prompts). This directory contains organized prompt templates and metadata for easy discovery and reuse.

## Dataset Source

- **Dataset:** fka/prompts.chat
- **URL:** https://huggingface.co/datasets/fka/prompts.chat
- **Total Prompts:** 1,546
- **License:** CC0 1.0 (Public Domain)
- **Format:** Parquet (4.27 MB original)

## Directory Structure

```
prompts/
├── README.md                 # This file
├── dev/                      # Developer-focused prompts
│   ├── linux-terminal.md
│   ├── python-interpreter.md
│   ├── ethereum-developer.md
│   └── api-design-expert.md
├── general/                  # General/creative prompts
│   ├── storyteller.md
│   ├── life-coach.md
│   ├── english-translator.md
│   ├── stand-up-comedian.md
│   ├── public-speaking-coach.md
│   └── writing-consultant.md
└── metadata/
    ├── index.json            # Complete prompt index with metadata
    └── catalog.json          # Searchable catalog by category
```

## Dataset Fields

Each prompt record contains:

| Field | Type | Description |
|-------|------|-------------|
| `act` | String | The role/persona name (e.g., "Linux Terminal") |
| `prompt` | String | The full prompt instruction (29-144k chars) |
| `for_devs` | Boolean | Whether prompt is developer-focused |
| `type` | String | Prompt classification (e.g., "TEXT") |
| `contributor` | String | GitHub username of contributor |

## Usage Examples

### Using Individual Prompts

Copy any prompt file directly:
```bash
cat prompts/dev/linux-terminal.md
```

### Browsing by Category

**Developer prompts:**
- API Design Expert
- Ethereum Developer
- Linux Terminal
- Python Interpreter

**General prompts by category:**
- Creative: Storyteller, Stand-up Comedian
- Professional: Public Speaking Coach, Writing Consultant
- Lifestyle: Life Coach
- Language: English Translator

### Programmatic Access

Query metadata:
```bash
# View complete index
cat prompts/metadata/index.json

# View catalog
cat prompts/metadata/catalog.json
```

## Expanding the Collection

To add all 1,546 prompts from the full dataset:

### Option 1: Using Hugging Face Datasets Library

```python
from datasets import load_dataset
import json
from pathlib import Path

# Load the dataset
dataset = load_dataset("fka/prompts.chat")
prompts = dataset['train']

# Process and save
for idx, prompt in enumerate(prompts):
    act = prompt['act'].lower().replace(' ', '-')
    category = 'dev' if prompt['for_devs'] else 'general'

    filepath = Path(f"prompts/{category}/{act}.md")
    filepath.parent.mkdir(parents=True, exist_ok=True)

    content = f"""# {prompt['act']}

**For Developers:** {prompt['for_devs']}
**Contributor:** {prompt['contributor']}

## Prompt

{prompt['prompt']}
"""
    filepath.write_text(content)
```

### Option 2: Direct Download

```bash
# Install dependencies
pip install datasets pyarrow

# Run import script
python scripts/import_prompts.py
```

### Option 3: Clone from Source

```bash
# Get raw data from the repository
git clone https://huggingface.co/datasets/fka/prompts.chat
```

## Metadata Schema

### `index.json`

```json
{
  "dataset": "fka/prompts.chat",
  "source_url": "https://huggingface.co/datasets/fka/prompts.chat",
  "total_prompts_in_dataset": 1546,
  "local_sample_prompts": 10,
  "dev_prompts": 4,
  "general_prompts": 6,
  "created": "2024-03-24T...",
  "license": "CC0 1.0 (Public Domain)",
  "categories": ["development", "creative", "lifestyle", ...],
  "prompts": [...]
}
```

### `catalog.json`

```json
{
  "developer_prompts": [
    {
      "title": "Linux Terminal",
      "file": "dev/linux-terminal.md",
      "contributor": "f"
    }
  ],
  "general_prompts": [
    {
      "title": "Storyteller",
      "file": "general/storyteller.md",
      "category": "creative",
      "contributor": "creative1"
    }
  ]
}
```

## Prompt File Format

Each `.md` file follows this structure:

```markdown
# {Persona Name}

**Category:** {category}
**For Developers:** {true/false}
**Contributor:** {username}
**Type:** TEXT

## Prompt

{Full prompt text here}

---
*Source: [prompts.chat](https://prompts.chat) | License: CC0 1.0 (Public Domain)*
```

## Statistics

- **Total Prompts Available:** 1,546
- **Current Sample:** 10 prompts (4 dev, 6 general)
- **Top Contributors:** Multiple (1,546 community contributions)
- **Dataset Downloads:** 26K+ monthly
- **Models Trained:** 1,183+

## License

All prompts are in the **public domain** under CC0 1.0 license. Feel free to:
- ✓ Use commercially
- ✓ Modify and redistribute
- ✓ Use without attribution

## Related Resources

- **Original Website:** https://prompts.chat
- **GitHub:** https://github.com/f/awesome-chatgpt-prompts
- **Hugging Face Dataset:** https://huggingface.co/datasets/fka/prompts.chat
- **Community:** Submit your own prompts at prompts.chat

## Navigation

- [Developer Prompts](./dev/) — APIs, terminals, interpreters, development tools
- [General Prompts](./general/) — Creative writing, coaching, language, entertainment
- [Metadata](./metadata/) — Index and catalog for programmatic access

---

**Last Updated:** 2026-03-24
**Dataset Version:** Latest from Hugging Face
