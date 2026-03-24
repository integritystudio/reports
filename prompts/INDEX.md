# Prompts Directory Index

## What's Inside

A curated collection of **AI prompts** organized by category, sourced from the [fka/prompts.chat](https://huggingface.co/datasets/fka/prompts.chat) Hugging Face dataset.

### 📊 Directory Contents

```
prompts/
├── README.md              ← Start here (complete documentation)
├── QUICKSTART.md          ← Quick reference and common tasks
├── INDEX.md              ← This file
├── dev/                  ← 4 developer-focused prompts
├── general/              ← 6 general/creative prompts
└── metadata/
    ├── catalog.json      ← Searchable index
    └── index.json        ← Full data export
```

---

## 💻 Developer Prompts (4)

### 1. **Linux Terminal**
- **File:** `dev/linux-terminal.md`
- **Purpose:** Simulate a Linux terminal environment
- **Contributor:** f
- **Use case:** Execute shell commands and see terminal output

### 2. **Python Interpreter**
- **File:** `dev/python-interpreter.md`
- **Purpose:** Execute Python code directly
- **Contributor:** ameya-2003
- **Use case:** Run Python scripts and see results

### 3. **Ethereum Developer**
- **File:** `dev/ethereum-developer.md`
- **Purpose:** Get blockchain development expertise
- **Contributor:** developer1
- **Use case:** Solidity programming and smart contracts

### 4. **API Design Expert**
- **File:** `dev/api-design-expert.md`
- **Purpose:** Design APIs following best practices
- **Contributor:** dev-expert
- **Use case:** REST API design guidance and architecture

---

## 🎭 General Prompts (6)

### Creative

**Storyteller** (`general/storyteller.md`)
- Create engaging, imaginative stories
- Entertaining narratives for any audience

**Stand-up Comedian** (`general/stand-up-comedian.md`)
- Develop comedy routines
- Current event humor and observational comedy

### Professional

**Public Speaking Coach** (`general/public-speaking-coach.md`)
- Improve presentation skills
- Build confidence and overcome nervousness

**Writing Consultant** (`general/writing-consultant.md`)
- Enhance writing clarity and structure
- Content improvement feedback

### Lifestyle & Personal

**Life Coach** (`general/life-coach.md`)
- Personal goal setting and strategy
- Understand personality and values

**English Translator** (`general/english-translator.md`)
- Language translation and correction
- Multi-language support with improvement

---

## 🚀 Quick Start

### View a Prompt
```bash
cat prompts/dev/linux-terminal.md
```

### Search for Prompts
```bash
# Find prompts about writing
grep -i "writing" prompts/general/*.md

# Search all metadata
jq '.prompts[] | select(.act | contains("Python"))' prompts/metadata/index.json
```

### Import Full Dataset (1,546 prompts)
```bash
python3 scripts/import_prompts.py
```

### Use in Your Chat
1. Open any `.md` file
2. Copy the text under `## Prompt`
3. Paste into Claude, ChatGPT, or other AI

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Complete guide, dataset info, schema details |
| **QUICKSTART.md** | Common tasks, search examples, quick reference |
| **INDEX.md** | This file — directory overview and prompt list |

---

## 🔍 Metadata Files

### `catalog.json`
Searchable index of all available prompts:
```bash
jq '.developer_prompts[].title' prompts/metadata/catalog.json
```

### `index.json`
Complete dataset with all fields:
```bash
jq '.prompts[] | {act, for_devs, contributor}' prompts/metadata/index.json
```

---

## 📊 Statistics

- **Total prompts in dataset:** 1,546
- **Current collection:** 10 (4 dev, 6 general)
- **License:** CC0 1.0 (Public Domain) — use freely
- **Source:** https://huggingface.co/datasets/fka/prompts.chat
- **HF Downloads:** 26K+ monthly
- **Models trained:** 1,183+

---

## 🎯 Next Steps

1. **Browse prompts** → Check `dev/` and `general/` folders
2. **Read full guide** → Open `README.md`
3. **Import more** → Run `python3 scripts/import_prompts.py`
4. **Share & contribute** → Visit https://prompts.chat

---

## 🔗 Related Resources

- **Original Platform:** https://prompts.chat
- **GitHub Repository:** https://github.com/f/awesome-chatgpt-prompts
- **Hugging Face Dataset:** https://huggingface.co/datasets/fka/prompts.chat
- **Community Prompts:** Submit your own at prompts.chat

---

**Version:** 1.0
**Last Updated:** 2026-03-24
**Dataset Source:** fka/prompts.chat
**License:** CC0 1.0 (Public Domain)
