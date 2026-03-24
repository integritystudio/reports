# Prompts Directory — Quick Start Guide

## Overview

This directory contains AI prompts from the [fka/prompts.chat](https://huggingface.co/datasets/fka/prompts.chat) dataset (1,546 total prompts in full collection).

**Current Status:** 10-prompt sample (4 dev, 6 general)
**Full Dataset:** Ready to import with script

## Find a Prompt

### Browse by Category

**Developer Prompts** (`prompts/dev/`):
```bash
ls -la prompts/dev/
```

Available: Linux Terminal, Python Interpreter, Ethereum Developer, API Design Expert

**General Prompts** (`prompts/general/`):
```bash
ls -la prompts/general/
```

Available: Storyteller, Life Coach, English Translator, Stand-up Comedian, Public Speaking Coach, Writing Consultant

### Search Prompts

Find prompts by keyword:
```bash
# Search in all prompts
grep -r "terminal" prompts/

# Search with context
grep -r "template" prompts/ -A 2

# Search in catalog
jq '.developer_prompts[] | select(.title | contains("Python"))' prompts/metadata/catalog.json
```

### View Prompt Details

Read a specific prompt:
```bash
cat prompts/dev/linux-terminal.md
```

## Use a Prompt

### Copy to Clipboard (macOS)

```bash
cat prompts/dev/python-interpreter.md | pbcopy
```

### Extract Just the Prompt Text

```bash
# Get everything after "## Prompt" section
sed -n '/## Prompt/,/^---/p' prompts/dev/api-design-expert.md
```

### Programmatic Access

Query metadata:
```bash
# List all developer prompts
jq '.developer_prompts[].title' prompts/metadata/catalog.json

# Count prompts by category
jq '.general_prompts | keys' prompts/metadata/catalog.json

# Get full prompt data
jq '.prompts[] | select(.act == "Linux Terminal")' prompts/metadata/index.json
```

## Import Full Dataset

The full 1,546 prompts are ready to import:

```bash
# Install dependencies (one-time)
pip install datasets pyarrow

# Run import script
python3 scripts/import_prompts.py
```

This will:
- Download the full dataset from Hugging Face
- Organize into `dev/` and `general/` directories
- Create updated metadata files
- Takes ~2-3 minutes

## File Structure Reference

```
prompts/
├── README.md                    # Complete guide
├── QUICKSTART.md               # This file
├── dev/                        # Developer-focused prompts
│   ├── api-design-expert.md
│   ├── ethereum-developer.md
│   ├── linux-terminal.md
│   └── python-interpreter.md
├── general/                    # General & creative prompts
│   ├── english-translator.md
│   ├── life-coach.md
│   ├── public-speaking-coach.md
│   ├── stand-up-comedian.md
│   ├── storyteller.md
│   └── writing-consultant.md
└── metadata/
    ├── catalog.json            # Searchable index
    └── index.json              # Full data with all fields
```

## Dataset Info

| Property | Value |
|----------|-------|
| **Total Prompts** | 1,546 |
| **Source** | https://huggingface.co/datasets/fka/prompts.chat |
| **License** | CC0 1.0 (Public Domain) |
| **Format** | Markdown files + JSON metadata |
| **HF Downloads/mo** | 26K+ |
| **Models Trained** | 1,183+ |

## Common Tasks

### "I want to use the Linux Terminal prompt"

```bash
cat prompts/dev/linux-terminal.md
```

Copy the text after `## Prompt` section and paste into your AI chat.

### "Show me all developer prompts"

```bash
cat prompts/metadata/catalog.json | jq '.developer_prompts[].title'
```

### "Find prompts about writing"

```bash
grep -i "writing\|write" prompts/general/*.md -l
```

### "Get the full 1,546 prompts"

```bash
python3 scripts/import_prompts.py
```

### "Export prompts to CSV"

```bash
jq -r '.prompts[] | [.act, .for_devs, .contributor] | @csv' \
  prompts/metadata/index.json > prompts.csv
```

## Metadata Schema

Each prompt file contains:

- **Title** — The persona/role name
- **Category** — development, creative, lifestyle, professional, language, entertainment, writing
- **For Developers** — Boolean flag for dev-focused content
- **Contributor** — GitHub username who contributed the prompt
- **Type** — TEXT (all current prompts are text-based)
- **Prompt** — Full instruction text

## Tips

1. **Customize prompts** — Feel free to edit any prompt to fit your needs
2. **Combine prompts** — Mix multiple prompts for compound tasks
3. **Add to your toolbox** — Version control these in your own dotfiles
4. **Share improvements** — Submit back to [prompts.chat](https://prompts.chat)

## Next Steps

- Read [README.md](./README.md) for complete documentation
- Import full dataset with `python3 scripts/import_prompts.py`
- Browse [prompts.chat](https://prompts.chat) for more ideas
- Check dataset on [Hugging Face](https://huggingface.co/datasets/fka/prompts.chat)

---

**Last Updated:** 2026-03-24
**Quick Start Version:** 1.0
