"""
prompts-api — Cloudflare Python Worker
Serves a REST API over the prompts.chat catalog stored in KV.

Endpoints:
  GET /api/categories
  GET /api/prompts?category=&q=&page=1&limit=24
  GET /api/prompt?file=dev/foo.md
"""

from workers import WorkerEntrypoint, Response
from urllib.parse import urlparse, parse_qs
import json

DEFAULT_LIMIT = 24
MAX_LIMIT = 100


def _allowed_origins(env) -> set:
    raw = getattr(env, "ALLOWED_ORIGINS", "https://integritystudio.io")
    return {o.strip() for o in raw.split(",") if o.strip()}


def _cors_headers(origin: str, env) -> dict:
    allowed = _allowed_origins(env)
    effective = origin if origin in allowed else "https://integritystudio.io"
    return {
        "Access-Control-Allow-Origin": effective,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    }


def _json(data, origin: str, env, status: int = 200) -> Response:
    return Response(
        json.dumps(data),
        status=status,
        headers={"Content-Type": "application/json", **_cors_headers(origin, env)},
    )


def _safe_int(params: dict, key: str, default: int, min_val: int, max_val: int) -> int:
    try:
        return max(min_val, min(max_val, int(params.get(key, [str(default)])[0])))
    except (ValueError, IndexError):
        return default


class Default(WorkerEntrypoint):

    # ── Catalog cache ────────────────────────────────────────────────────────

    async def _catalog(self) -> dict | None:
        raw = await self.env.PROMPTS_KV.get("catalog")
        if raw is None:
            return None
        return json.loads(raw)

    # ── Request router ───────────────────────────────────────────────────────

    async def fetch(self, request) -> Response:
        origin = request.headers.get("Origin", "https://integritystudio.io")
        parsed = urlparse(request.url)
        path = parsed.path.rstrip("/") or "/"
        params = parse_qs(parsed.query)

        if request.method == "OPTIONS":
            return Response("", status=204, headers=_cors_headers(origin, self.env))

        if request.method != "GET":
            return _json({"error": "Method not allowed"}, origin, self.env, 405)

        if path == "/api/categories":
            return await self._categories(origin)
        if path == "/api/prompts":
            return await self._prompts(params, origin)
        if path == "/api/prompt":
            return await self._prompt(params, origin)

        return _json({"error": "Not found"}, origin, self.env, 404)

    # ── Handlers ─────────────────────────────────────────────────────────────

    async def _categories(self, origin: str) -> Response:
        catalog = await self._catalog()
        if catalog is None:
            return _json({"error": "Catalog not seeded. Run scripts/seed_kv.py."}, origin, self.env, 503)

        summary = dict(catalog["general_prompts"]["category_summary"])
        summary["developer"] = {
            "name": "Developer",
            "count": len(catalog["developer_prompts"]),
        }
        return _json(summary, origin, self.env)

    async def _prompts(self, params: dict, origin: str) -> Response:
        catalog = await self._catalog()
        if catalog is None:
            return _json({"error": "Catalog not seeded. Run scripts/seed_kv.py."}, origin, self.env, 503)

        category = (params.get("category", [""])[0] or "").strip().lower()
        query = (params.get("q", [""])[0] or "").strip().lower()
        page = _safe_int(params, "page", 1, 1, 10_000)
        limit = _safe_int(params, "limit", DEFAULT_LIMIT, 1, MAX_LIMIT)

        all_prompts: list[dict] = []

        include_dev = category in ("", "all", "developer")
        include_general = category != "developer"

        if include_dev:
            for p in catalog["developer_prompts"]:
                all_prompts.append({**p, "category": "developer"})

        if include_general:
            for p in catalog["general_prompts"]["general"]:
                if not category or category == "all" or p.get("category") == category:
                    all_prompts.append(p)

        if query:
            all_prompts = [p for p in all_prompts if query in p.get("title", "").lower()]

        total = len(all_prompts)
        start = (page - 1) * limit
        return _json(
            {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": max(1, (total + limit - 1) // limit),
                "prompts": all_prompts[start : start + limit],
            },
            origin,
            self.env,
        )

    async def _prompt(self, params: dict, origin: str) -> Response:
        file_path = (params.get("file", [""])[0] or "").strip()

        if not file_path:
            return _json({"error": "file parameter required"}, origin, self.env, 400)

        # Sanitize: only allow paths within dev/ and general/
        if not (file_path.startswith("dev/") or file_path.startswith("general/")):
            return _json({"error": "Invalid file path"}, origin, self.env, 400)
        if ".." in file_path or file_path.count("/") > 1:
            return _json({"error": "Invalid file path"}, origin, self.env, 400)
        if not file_path.endswith(".md"):
            return _json({"error": "Invalid file path"}, origin, self.env, 400)

        # Try KV first
        content = await self.env.PROMPTS_KV.get(f"prompt:{file_path}")

        # Fall back to GitHub raw if not seeded
        if content is None:
            base = getattr(self.env, "GITHUB_RAW_BASE", "").rstrip("/")
            if not base:
                return _json({"error": "Prompt not found"}, origin, self.env, 404)
            from js import fetch as js_fetch  # noqa: PLC0415
            resp = await js_fetch(f"{base}/{file_path}")
            if not resp.ok:
                return _json({"error": "Prompt not found"}, origin, self.env, 404)
            content = await resp.text()

        return Response(
            content,
            status=200,
            headers={"Content-Type": "text/plain; charset=utf-8", **_cors_headers(origin, self.env)},
        )
