#!/usr/bin/env python3
"""
Categorize general prompts in prompts/metadata/catalog.json by title/content keywords.
Adds a `category` field to each general prompt entry and writes updated catalog + summary.
"""

import json
import re
import os
from collections import defaultdict
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"
CATALOG_PATH = PROMPTS_DIR / "metadata" / "catalog.json"
INDEX_PATH = PROMPTS_DIR / "metadata" / "index.json"

# ── Category definitions ────────────────────────────────────────────────────
# Each entry: (category_slug, display_name, [title keywords], [content keywords])
# Rules are applied in order — first match wins.

CATEGORIES = [
    (
        "multilingual",
        "Multilingual & Non-English",
        [],  # detected via non-ASCII character check
        [],
    ),
    (
        "image-visual",
        "Image & Visual Generation",
        [
            "3d", "render", "illustration", "portrait", "avatar", "photo",
            "image", "visual", "art style", "pixar", "diorama", "isometric",
            "storyboard", "floor plan", "anatomy model", "wallpaper",
            "photorealistic", "cinematic", "drawing", "sketch", "poster",
            "clay", "miniature", "surreal", "plush", "silhouette",
            "selfie", "candid", "neon alley", "street scene", "room scene",
            "window scene", "cozy", "light scene", "aesthetic", "noir",
            "studio shot", "color palette", "color picker", "retro-futuristic",
            "sci-fi scene", "fantasy scene", "landscape", "cityscape",
            "architectural render", "fashion shoot", "editorial",
            "vintage photo", "film photography", "blender", "midjourney",
            "stable diffusion", "image generat", "visual prompt",
            "storyboard", "comic style", "anime", "manga", "pixel art",
            "vector art", "logo design", "graphic", "infograph",
        ],
        [
            "generate an image", "image prompt", "visual prompt", "create an image",
            "hyperrealistic", "hyper realistic", "hyper-realistic",
            "photorealism", "photorealistic", "ultra-detailed", "ultra-realistic",
            "8k", "4k uhd", "cinematic lighting", "cinematic scene",
            "depth of field", "wide-angle", "macro lens", "--ar ", "--v ",
            "lifelike", "skin texture", "golden hour", "dramatic sky",
            "camera angle", "long shot", "close-up shot", "bokeh",
            "subject_and_scene", "\"description\":", "\"lighting\":",
            "dynamic lighting", "soft light", "ambient occlusion",
            "stable diffusion prompt", "midjourney prompt",
        ],
    ),
    (
        "games-entertainment",
        "Games & Entertainment",
        [
            "game", "puzzle", "quiz", "chess", "football", "sport", "soccer",
            "basketball", "cricket", "racing", "fps", "rpg", "dungeon",
            "trivia", "magic", "comedian", "stand-up", "comedy", "gnomist",
            "entertainer", "storyteller", "bard", "impersonat",
            "betting", "gambling", "lottery", "escape room",
            "league of legends", "gomoku", "lol player",
        ],
        [],
    ),
    (
        "writing-creative",
        "Writing & Creative",
        [
            "novelist", "screenwriter", "poet", "rapper", "songwriter",
            "author", "fiction", "storytell", "script", "lyric", "creative writ",
            "ghost writ", "copywriter", "essay", "blog", "article writer",
            "content writer", "narrator", "debate", "speech", "rhetoric",
            "commentator", "journalist", "reporter", "editor",
            "children's book", "letter writ", "book creat", "documentary",
            "announce", "milestone", "tell your story", "music video",
            "classical music", "composer", "acoustic", "songwrit",
            "story generator", "aphorism", "title generator",
            "new language creator", "fancy title", "wisdom generat",
            "song recommender", "music recommender",
            "commentariat", "opinion piece", "editorial writ",
        ],
        [],
    ),
    (
        "education-teaching",
        "Education & Teaching",
        [
            "teacher", "tutor", "professor", "instructor", "lesson",
            "flashcard", "study", "learning", "education", "academic",
            "school", "university", "course", "curriculum", "quiz maker",
            "homework", "student", "classroom", "roadmap",
            "socratic", "fallacy", "encyclopedia", "explainer", "analogies",
            "mentor", "teach", "explain", "historian", "mathematician",
            "statistician", "fill in the blank", "worksheets", "elocutionist",
        ],
        [],
    ),
    (
        "language-translation",
        "Language & Translation",
        [
            "translat", "english teacher", "pronunciation", "grammar",
            "language coach", "language teacher", "linguist", "etymolog",
            "spelling", "proofreader", "text improver", "paraphras",
            "rewrite", "recap", "summarize text", "synonym",
            "rephraser", "obfuscat", "plagiarism",
        ],
        [],
    ),
    (
        "health-wellness",
        "Health & Wellness",
        [
            "medical", "doctor", "nurse", "health", "fitness", "nutrition",
            "diet", "therapist", "therapy", "mental health", "psychiatr",
            "psycholog", "wellness", "workout", "exercise", "physical",
            "emergency response", "first aid", "pharmacist", "surgeon",
            "dentist", "veterinarian", "diabetes", "treatment", "patient",
            "pilates", "yoga", "anatomy", "symptom", "diagnosis",
        ],
        [],
    ),
    (
        "technology-ai",
        "Technology & AI",
        [
            "developer", "coder", "programmer", "software", "data scientist",
            "machine learning", "neural", "ai consultant", "ai tool",
            "prompt engineer", "prompt generat", "prompt writer", "prompt refin",
            "llm", "algorithm", "repository", "codebase", "api", "database",
            "system design", "devops", "cybersecurity", "cyber security",
            "it architect", "data analyst", "data engineer", "cloud",
            "tech reviewer", "simulation", "automation", "robotics",
            "iot", "blockchain", "web developer", "mobile app", "plugin",
            "chatbot", "commit message", "code snippet", "url shortener",
            "file system", "pdf viewer", "todo list", "web design",
            "web app", "web application", "frontend", "backend", "fullstack",
            "flutter", "swiftui", "ios app", "android app", "react",
            "vue", "angular", "node", "python dev", "dev container",
            "dashboard", "sidebar", "ui design", "ux design",
            "accessibility", "vr", "virtual reality", "augmented reality",
            "linux", "monitoring", "update checker", "form validation",
            "open source", "license selection", "deployment", "ci/cd",
            "testing", "debugging", "refactor", "optimization",
            "virtualization", "network", "infrastructure",
            "password generator", "password tool", "encryption tool",
            "benchmarking", "memory profiler", "kanban", "text analyzer",
            "typing speed", "pomodoro", "scientific calculator",
            "music player", "file encr", "technical architecture",
            "reasoning protocol", "iterative reasoning", "idea clarif",
            "http tool", "markdown notes", "secure password",
        ],
        [],
    ),
    (
        "social-media-marketing",
        "Social Media & Marketing",
        [
            "social media", "linkedin", "twitter", "instagram", "tiktok",
            "youtube", "facebook", "influencer", "content creat", "seo",
            "marketing", "advertis", "brand", "campaign", "email market",
            "newsletter", "growth hack", "viral", "engagement",
            "community manag", "pr ", "public relations",
            "sponsor", "product promotion", "promote", "outreach",
            "tweet", "post creator", "social post",
        ],
        [],
    ),
    (
        "business-professional",
        "Business & Professional",
        [
            "business", "entrepreneur", "startup", "ceo", "cto", "founder",
            "recruiter", "hr ", "human resource", "consultant", "strategy",
            "management", "project manag", "product manag", "scrum",
            "agile", "pitch", "investor", "venture", "b2b", "sales",
            "negotiat", "presentation", "proposal", "report writ",
            "job interview", "meeting", "email professional", "emails",
            "logistician", "logistics", "supply chain", "procurement",
            "impact metric", "enterprise", "sponsorship", "workforce",
            "hiring", "onboard", "payroll", "compensation",
            "career counsel", "career coach", "cover letter",
            "event planner", "virtual event", "professional bio",
            "direct impact", "monthly update", "success stor",
            "time commitment", "creative perks", "project spotlight",
            "future vision", "showcase", "chief executive",
            "logistician", "job", "interview",
        ],
        [],
    ),
    (
        "legal-finance",
        "Legal, Finance & Real Estate",
        [
            "legal", "law", "lawyer", "attorney", "contract", "patent",
            "finance", "financial", "accountant", "tax", "invest",
            "real estate", "mortgage", "loan", "insurance", "banking",
            "stock", "crypto", "trading", "budget", "economic",
            "currency exchange", "cost", "break down cost", "pricing",
            "revenue", "profit", "grant",
        ],
        [],
    ),
    (
        "personal-development",
        "Personal Development & Coaching",
        [
            "life coach", "motivat", "self-help", "mindset", "productivity",
            "goal", "habit", "mindfulness", "meditation", "journal",
            "relationship coach", "dating", "communication", "emotion",
            "confidence", "leadership coach", "talent coach", "nietzschean",
            "growth", "holistic", "gift idea", "personal", "self-improv",
            "public speaking coach", "decision filter", "wisdom",
            "elocution", "aphorism",
        ],
        [],
    ),
    (
        "research-analysis",
        "Research & Analysis",
        [
            "research", "analyst", "analysis", "summariz", "reviewer",
            "critic", "evaluat", "audit", "investigat", "report",
            "discovery", "insight", "intelligence", "assessm",
            "wikipedia", "encyclopedia", "fact check", "verify",
        ],
        [],
    ),
    (
        "travel-culture",
        "Travel, Food & Culture",
        [
            "travel", "tourism", "tour guide", "culture", "food", "recipe",
            "cooking", "chef", "restaurant", "cuisine", "cocktail",
            "wine", "barista", "coffee", "drink", "meal", "ingredient",
        ],
        [],
    ),
    (
        "roleplay-character",
        "Role-Play & Characters",
        [
            "roleplay", "role play", "character", "persona", "act as",
            "pretend", "fictional", "villain", "hero", "knight",
            "wizard", "philosopher", "imam", "priest", "monk",
            "drunk person", "dan ", "jailbreak", "unconstrained",
            "escape the box", "cold war", "historical",
            "pirate", "buddha", "lunatic", "gaslighter", "flirting",
            "babysitter", "astrologer", "dream interpret", "healing grandma",
            "girl of dreams", "friend", "silent standoff",
            "yogi", "socrat",
        ],
        [],
    ),
    (
        "lifestyle-home",
        "Lifestyle, Home & Hobbies",
        [
            "interior decor", "florist", "makeup artist", "pet behav",
            "automobile mechanic", "diy expert", "diy ", "home improv",
            "gardening", "fashion", "style", "beauty", "skincare",
            "tea-taster", "tea taster", "sommelier", "organiz",
            "minimalist", "declutter", "home design", "architect",
            "car ", "vehicle", "mechanic", "repair",
        ],
        [],
    ),
    (
        "other",
        "Other",
        [],
        [],
    ),
]


def has_non_ascii(text: str) -> bool:
    """Return True if the text contains non-ASCII characters (signals non-English)."""
    try:
        text.encode("ascii")
        return False
    except UnicodeEncodeError:
        return True


def categorize_title(title: str, content: str = "") -> str:
    title_lower = title.lower()
    content_lower = content.lower()

    # Multilingual: non-ASCII in title
    if has_non_ascii(title):
        return "multilingual"

    for slug, _name, title_kws, content_kws in CATEGORIES:
        if slug in ("multilingual", "other"):
            continue
        for kw in title_kws:
            if kw in title_lower:
                return slug
        for kw in content_kws:
            if kw in content_lower:
                return slug

    return "other"


def load_prompt_content(filename: str) -> str:
    """Load first 500 chars of a prompt file for keyword matching."""
    path = PROMPTS_DIR / "general" / filename
    try:
        return path.read_text(encoding="utf-8")[:900].lower()
    except Exception:
        return ""


def main():
    print("Loading catalog...")
    with open(CATALOG_PATH) as f:
        catalog = json.load(f)

    general = catalog["general_prompts"]["general"]
    print(f"Categorizing {len(general)} general prompts...")

    counts = defaultdict(int)
    category_map = {slug: name for slug, name, *_ in CATEGORIES}

    for prompt in general:
        title = prompt.get("title", "")
        filename = prompt.get("file", "").replace("general/", "")
        content = load_prompt_content(filename)
        cat = categorize_title(title, content)
        prompt["category"] = cat
        counts[cat] += 1

    # Rebuild catalog grouped by category
    by_category = defaultdict(list)
    for p in general:
        by_category[p["category"]].append(p)

    catalog["general_prompts"] = {
        "general": general,
        "by_category": {
            slug: {
                "name": category_map.get(slug, slug),
                "count": len(items),
                "prompts": items,
            }
            for slug, items in sorted(
                by_category.items(),
                key=lambda x: -len(x[1]),
            )
        },
        "category_summary": {
            slug: {"name": category_map.get(slug, slug), "count": cnt}
            for slug, cnt in sorted(counts.items(), key=lambda x: -x[1])
        },
    }

    # Save updated catalog
    with open(CATALOG_PATH, "w") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Save category summary to index
    try:
        with open(INDEX_PATH) as f:
            index = json.load(f)
    except Exception:
        index = {}

    index["general_categories"] = catalog["general_prompts"]["category_summary"]
    with open(INDEX_PATH, "w") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    # Print results
    print("\nCategory breakdown:")
    print(f"{'Category':<40} {'Count':>6}  {'Bar'}")
    print("-" * 65)
    for slug, cnt in sorted(counts.items(), key=lambda x: -x[1]):
        name = category_map.get(slug, slug)
        bar = "█" * (cnt // 20)
        print(f"{name:<40} {cnt:>6}  {bar}")

    print(f"\nTotal categorized: {sum(counts.values())}")
    print(f"Updated: {CATALOG_PATH}")
    print(f"Updated: {INDEX_PATH}")


if __name__ == "__main__":
    main()
