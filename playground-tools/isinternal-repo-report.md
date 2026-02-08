---
title: "ISInternal Repository Report"
author: "Integrity Studio"
date: 2026-02-06
tags: [architecture, MCP, internal tools, monorepo]
description: "A comprehensive overview of the ISInternal monorepo - its purpose, structure, tech stack, and 27+ subprojects."
---

# ISInternal Repository Report

## What Is ISInternal?

ISInternal is Integrity Studio's internal monorepo -- a single directory housing every tool, bot, and integration the team builds and maintains. Rather than scattering projects across dozens of separate repositories, ISInternal keeps them under one roof so they can share configuration, agents, and operational patterns.

The dominant theme across the entire codebase is **MCP (Model Context Protocol)** -- the open standard that lets AI assistants like Claude interact with external services through a uniform interface. More than half of the subprojects are MCP servers that expose real-world APIs (Google Calendar, Discord, LinkedIn, Cloudflare, Tailscale, and others) to AI-driven workflows.

---

## Repository at a Glance

| Metric | Value |
|--------|-------|
| Top-level subprojects | 27+ |
| Primary languages | TypeScript, Python, Go, Shell |
| MCP servers | 17 |
| Custom Claude Code agents | 20+ |
| Repomix packed size | ~1 million lines |

---

## Tech Stack

- **Languages**: TypeScript (majority), Python, Go, Shell
- **Frontend**: React, Tailwind CSS, Next.js
- **Testing**: Vitest, pytest
- **Infrastructure**: Docker, GitHub Actions, Doppler (secrets), Tailscale (networking)
- **AI / MCP**: Model Context Protocol throughout, with integrations for Google Calendar API, LinkedIn API, Discord API, Perplexity API, Cloudflare API, Porkbun API, Temporal, and more
- **Data**: FAISS vector indexes, SQLite, Socrata Open Data API

---

## Subproject Directory

### MCP Servers

These are the backbone of the repo. Each server wraps an external API so that AI assistants can call it through MCP.

**Calendar Family** -- Multiple variants exist, likely deployed per-client or per-bot:

| Project | Purpose |
|---------|---------|
| `bot-army-google-calendar-mcp` | Full-featured Google Calendar MCP: multi-calendar support, event CRUD, recurring events, free/busy queries, smart scheduling, image/PDF event import |
| `bots-google-calendar-mcp` | Calendar MCP variant with CI/CD publishing workflows |
| `calendarmanager-google-calendar-mcp` | Per-client calendar deployment |
| `calendarmanager-discord-mcp` | Posts calendar events to Discord channels |
| `calendarmanager-perplexity-mcp` | Perplexity AI integration for calendar context |

**Communication & Social**

| Project | Purpose |
|---------|---------|
| `discordmcp` | General-purpose Discord MCP -- send/read messages via LLMs |
| `singlesitescraper-discordmcp` | Discord MCP paired with single-site web scraping |
| `linkedin-mcpserver` | LinkedIn API MCP -- profile search, jobs, messaging |
| `linkedinMCP` | Alternate LinkedIn MCP variant |

**Infrastructure & DevOps**

| Project | Purpose |
|---------|---------|
| `mcp-server-cloudflare` | Cloudflare services MCP -- Workers, DNS, D1, KV, R2, and more |
| `tailscale-mcp-server` | Tailscale network management MCP with 42 tools (Go-based) |
| `porkbun-mcp-server` | Porkbun domain and DNS management |
| `mcp-oauth-gateway` | OAuth 2.1 gateway that adds authentication to any MCP server without code changes (reference implementation) |
| `temporal-mcp` | Temporal workflow orchestration -- trigger long-running workflows via AI chat |

**Knowledge & Schema**

| Project | Purpose |
|---------|---------|
| `Schema` | Schema.org vocabulary MCP -- type lookup, hierarchy, JSON-LD generation |
| `schema-org-mcp` | Extended Schema.org MCP with performance testing integration |
| `1mcpserver` | MCP server discovery and registry with web scraping, FAISS index, and a static docs site |

---

### Automation and Bots

| Project | Purpose |
|---------|---------|
| `analyticsbot-indeed-mcp` | Indeed job platform integration with auth management and job sync |
| `IntegrityMonitor` | GitHub Actions monitoring -- watches for CI failures and auto-creates fix PRs |

---

### Web and Performance Tools

| Project | Purpose |
|---------|---------|
| `Webscraper` | SingleSiteScraper -- a React/Tailwind web scraper UI |
| `PerformanceTest` | Core Web Vitals and beyond -- a JavaScript performance testing suite |
| `schema-impact-analyzer` | Generates reports measuring the impact of Schema.org markup on sites |
| `RepoViz` | Git commit visualization utilities (Python package, hosted on GitHub) |
| `sodapy` | Vendored/forked Python client for the Socrata Open Data API |

---

### Infrastructure and Configuration

| Project | Purpose |
|---------|---------|
| `arc-fix` | Migration scripts -- Doppler secrets migration, LRU cache migration, performance fixes, dev environment organization |
| `hubspot` | HubSpot app integration -- cards, settings pages, webhooks, SCIM |
| `x-controllers` | Knowledge base and Claude agent for cross-controller patterns (server-to-client data passing) |
| `observability` | Observability tooling directory |

---

### Claude Code Agents (`.claude/agents/`)

The repo ships with **20+ custom Claude Code agents**, each specialized for a different task:

- `analytics-fundraising-expert` -- Analytics for non-profit fundraising campaigns
- `auth-route-debugger` -- Debug 401/403 errors, cookie/JWT issues
- `auth-route-tester` -- Test routes for correct data handling and DB records
- `auto-error-resolver` -- Auto-fix TypeScript compilation errors
- `code-architecture-reviewer` -- Review code for best practices and system integration
- `code-refactor-master` -- Reorganize files, break down large components
- `codebase-vulnerability-auditor` -- Adversarial audit for security/performance issues
- `config-copier` -- Copy agent configurations between projects
- `dev-environment-organizer` -- Relocate language dirs, update PATH/env vars
- `documentation-architect` -- Create and update developer documentation
- `event-scraper-discord` -- Scrape events from URLs and post to Discord
- `financial-analyst` -- Startup metrics, burn rate, runway calculations
- `frontend-error-fixer` -- Diagnose build-time and runtime frontend errors
- `integrity-analytics-bootstrapper` -- Set up GA/GTM for new clients
- `plan-reviewer` -- Review development plans before implementation
- `refactor-planner` -- Create detailed refactoring plans with risk assessment
- `schema-org-optimizer` -- Add and validate Schema.org structured data
- `semantic-html-enhancer` -- Analyze and improve HTML semantic quality
- `typo-spelling-fixer` -- Find and fix typos across code and docs
- `ui-ux-design-expert` -- UI/UX review and recommendations
- `web-research-specialist` -- Research across GitHub issues, forums, Stack Overflow
- `webscraping-research-analyst` -- Evaluate and recommend scraping tools

---

## Architecture Patterns

A few patterns recur across the codebase:

1. **MCP everywhere** -- Nearly every external integration is wrapped as an MCP server, creating a uniform interface for AI assistants.
2. **Variant deployments** -- Several services (Calendar, Discord, LinkedIn) have multiple copies, suggesting per-client or per-bot configurations.
3. **Docker-first** -- Most subprojects include a `Dockerfile` and often a `docker-compose.yml`.
4. **Comprehensive testing** -- TypeScript projects use Vitest with unit and integration test suites. Python projects use pytest.
5. **Agent-driven development** -- The `.claude/agents/` directory provides specialized AI agents for nearly every phase of development, from planning to code review to deployment.

---

## Summary

ISInternal is a dense, MCP-centric monorepo that powers Integrity Studio's AI-assisted tooling and client integrations. It connects AI assistants to real-world services (calendars, social platforms, DNS, networking, workflow orchestration) through a standardized protocol, while providing a rich set of custom Claude Code agents to streamline the development process itself.
