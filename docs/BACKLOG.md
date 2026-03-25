# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Open: Medium Priority

---

### NN1. Enhance lesson plan with LPTHW pedagogy elements
**Priority:** Medium (learning experience, completeness)
**Source:** Content review (Mar 25, neural-networks learning roadmap) + LPTHW audit hook
**Status:** Backlog, waiting for hook feedback before implementation

**Related:** Session-start hook configured to audit lesson-plan.md against LPTHW methodology on next session start.

**LPTHW Pedagogical Elements to Add:**

1. **Exercise-Driven Learning**
   - Add 1-2 "Try This" exercises per phase (hands-on tasks)
   - Phase 1: Watch 3Blue1Brown Ch1, then sketch a neural network on paper showing how neurons connect
   - Phase 2: After Karpathy Lec 1, write a 50-line Python function that computes loss manually
   - Phase 3: After OTEL intro, instrument a simple training script with 3 lines of OTEL code
   - Phase 4: After Illustrated Transformer, visualize attention weights using BertViz on a real model
   - Phase 5: Deploy a quantized model and measure inference latency vs. full-precision

2. **Learning Objectives Per Phase**
   - "By end of Phase 1, you should be able to: explain what a neuron is, describe forward pass, draw a simple network"
   - "By end of Phase 2, you should be able to: code backpropagation from scratch, identify overfitting, tune learning rate"
   - "By end of Phase 3, you should be able to: set up OTEL traces for model training, interpret training metrics"
   - etc.

3. **Teach-Back Reflection Prompts** (after each phase)
   - Phase 1: "Explain to a colleague why gradient descent is like walking downhill in the dark"
   - Phase 2: "What does it mean when training loss drops but validation loss rises?"
   - Phase 3: "Why would you monitor gradient_norm in OTEL, and when would high values be bad?"
   - Phase 4: "What's the difference between why a model hallucinates (Phase 4) and how to detect it (OTEL)?"

4. **Common Pitfalls & Error Patterns**
   - "Training Instability: If loss spikes every few steps, you likely have..."
   - "Dead Neurons: When activation_mean → 0 for a layer, check..."
   - "Observability Gap: If you can't explain why accuracy dropped, you're missing..."
   - "OTEL Anti-patterns: Don't instrument every weight; instead focus on..."

5. **Production Examples** (1-2 per phase)
   - Phase 2: Real case: "How a startup's training loop failed silently (and what metrics would have caught it)"
   - Phase 3: "Monitoring a fine-tuning run in production: what alerts matter and why"
   - Phase 4: "Detecting hallucination drift: a metric-based approach with real examples"

6. **Role-Based Customization Guidance**
   - If you're on Observability team: prioritize Phase 3 → Phase 2 → Phase 4
   - If you're on Safety/Reliability team: prioritize Phase 4 → Phase 3 → Phase 2
   - If you're a General Engineer: follow the standard sequence linearly

7. **Per-Phase Glossary Callouts**
   - Phase 1 glossary: AI, ML, DL, NN, forward pass, activation
   - Phase 2 glossary: backprop, gradient, loss, overfitting, regularization, learning rate
   - Phase 3 glossary: OTEL, metric, trace, span, observability, drift
   - Phase 4 glossary: attention, hallucination, interpretability, saliency, embedding
   - Phase 5 glossary: quantization, fine-tuning, inference, latency, throughput

8. **Teaching-Background Perspective Throughout**
   - Add callouts: "As an educator, you know that..."
   - Highlight pedagogical gaps in resources: "Resource X skips the 'why', Resource Y fixes it by..."
   - Connect to learning theory: "This is like the zone of proximal development in teaching..."

**Implementation approach:**
- Edit `learn-neural-networks-quick-bootstrap/lesson-plan.md` in place
- Add exercises as indented callout blocks (e.g., `> **Try This:** ...`)
- Add learning objectives as section headers per phase
- Add teach-back prompts at phase conclusions
- Create a new "Common Pitfalls" section in the glossary area
- Weave teaching perspective into phase comparison notes

**Effort estimate:**
- Lightweight: 3-4 hours (add objectives, teach-back prompts, one exercise per phase)
- Comprehensive: 6-8 hours (full exercises, production examples, pitfalls catalog, role-based guidance)
- Recommended: Comprehensive (transforms it from reference list → interactive learning journey)

**Timeline:** Implement after LPTHW audit hook provides specific feedback (expected next session start)
- Hook will surface pedagogical gaps the agent identifies
- Use hook output + this checklist to prioritize which elements to add first

---

### NN2. Bridge neural network training to OTEL instrumentation (Highest-Leverage)
**Priority:** HIGH (core competency gap, competitive advantage)
**Source:** Content review (Mar 25) — identified as critical missing bridge
**Status:** Ready for implementation

**Deliverable:** Internal guide "Instrumenting Neural Network Training for OTEL Observability"
**Save location:** `docs/neural-networks-otel-bridge.md`

**Content outline:**
1. **Mapping table:** Phase 2 training concepts → OTEL signals
   - Loss function → metrics (training_loss, validation_loss, loss_spike_rate)
   - Gradient magnitude → metrics (gradient_norm, dead_neuron_ratio, activation_mean)
   - Learning rate → observable parameters
   - Overfitting signal → metric thresholds for alerts

2. **Concrete walkthrough:** Instrumenting Karpathy's Zero to Hero code
   - Before/after code snippets (Python + OpenTelemetry)
   - Three lines of OTEL setup to capture training metrics
   - Example: how to emit loss as a scalar metric at each step

3. **Production patterns & alerting:**
   - When to alert (gradient explosion, loss plateau, dead neurons)
   - Thresholds for warning vs. critical (based on model size/architecture)
   - Dashboard queries for monitoring training health in real-time

4. **Failure case studies:**
   - Training instability patterns and their OTEL signatures
   - Overfitting detection via metric divergence
   - How to distinguish learning rate issues from architecture problems

5. **Why this matters for new hires:**
   - Makes the abstract (Phase 2 backprop) concrete (Phase 3 dashboards)
   - Bridges the gap between "understanding how networks learn" and "measuring if they're learning"

**Why this is highest-leverage:**
- No public article currently covers this specific bridge (verified via research)
- Essential for OTEL-focused startup: ties training science to observability practice
- Directly applicable to new hire's onboarding (can reference this after Karpathy/Phase 3)
- Reusable for internal training, documentation, and knowledge transfer

**Effort estimate:**
- Quick version: 2-3 hours (~2000 words, essentials only)
- Comprehensive: 4-5 hours (~4000 words, production patterns + case studies)
- Recommended: Comprehensive (this is a differentiator)

**Ready to start on:** Next available session after lesson-plan distribution

---

### NN3. URL verification for lesson-plan.md — Done
**Priority:** Critical (pre-distribution)
**Source:** Quality audit (Mar 25) — hallucination flag on unverified URLs/dates

All 14 resource URLs verified via WebFetch (Mar 25, 2026):
- ✅ All URLs active and accessible
- ✅ All author attributions correct (3Blue1Brown, Karpathy, Lil'Log, OTEL, fast.ai, etc.)
- ✅ Resource descriptions match actual content
- ✅ Time estimates reasonable based on content scope
- ✅ Future-dated resources (2025) confirmed authentic — we're now in March 2026, so these are contemporary

**Hallucination risk resolved:** The three "future-dated" resources (Rohan Paul explainability, LoRA/Quantization DEV article, OTEL AI Agent Observability post) that triggered warnings are legitimate 2025 publications. No fabrication; judge's caution was appropriate at evaluation time.

**Lesson plan is CLEARED for distribution to new hire.**

**[DONE]**

---

### H11. Extract inline styles from 50 report files — Done (Phase 4)
**Priority:** Medium (code quality, maintainability)
**Source:** CSS architecture audit (Mar 9)
**Phase 1 (Mar 9):** Extended `section h2, #toc h2` CSS selector; removed nav#toc and h2 redundant inline styles (29 instances); replaced `color: white` with `color: var(--color-white)` (11 files). ~290 inline styles remain (was ~367, excluding overflow-x:auto).
**Phase 2 (Mar 9):** Added 24 utility classes to `report-base.css`. Replaced 150+ inline styles across 37 files. Extracted hardcoded SWOT hex colors to semantic CSS classes in edgar_nadyne files.
**Phase 3 (Mar 9):** Added spacing tokens and SWOT utilities. Extracted 30 more inline styles from 6 edgar_nadyne files.
**Phase 4 (Mar 9):** Added `--color-swot-opportunity` token to edgar-nadyne brand and `.color-swot-opportunity` utility (with dark mode override). Replaced `#4a1a6b`/`#6B2D5B` heading colors in artist profile files with `.color-swot-opportunity`/`.text-primary`. Replaced `margin-top: 5px` with `.mt-xs` in leora dashboards. Remaining: table column widths and `overflow-x:auto` wrappers intentionally left as-is (layout-critical, not extractable to shared utilities).

**[DONE]**

---

### T1. Create `content-translator` skill — Done
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Built `~/.claude/skills/content-translator/SKILL.md` — 5-phase workflow: source extraction, translation, localization, assembly, QA validation. Handles BCP-47 lang tags, source-tracking comments, skip-link translation, hub card and TRANSLATION_STATUS.md updates. Invoke via `/content-translator <file.html> --lang <BCP-47>`.

**[DONE]**

---

### T5. Multi-language support beyond PT-BR — Done
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Added locale conventions table (19 BCP-47 tags: pt-BR, pt-PT, es, es-MX, es-ES, fr, fr-CA, de, he, it, ja, zh-CN, zh-TW, ko, ar, nl, pl, sv, tr) to `content-translator` SKILL.md. Covers date formats, decimal separators, currency symbols, quote marks, and RTL handling (ar, he). Replaces two ad-hoc inline bullet points with a structured, extensible reference table. Phase 3 localization table also updated with per-locale examples.

**[DONE]**

---

### W1. Repomix granular compression config — track upstream
**Priority:** Medium
**Source:** Fact-check audit (Feb 24), code-condense-whitepaper session
**Upstream:** [yamadashy/repomix #561](https://github.com/yamadashy/repomix/issues/561), [#516](https://github.com/yamadashy/repomix/issues/516)

Repomix `--compress` is currently all-or-nothing (`output.compress: boolean`). Granular controls (e.g., `keep_signatures`, `keep_interfaces`, `keep_docstrings`, per-directory compress patterns) are discussed upstream but not yet implemented. When upstream support lands, update `code-condense-whitepaper/repomix-command-line-cheat-sheet.md` with the actual config schema and remove the "Future Granularity" placeholder section.

**Effort:** Low (documentation update when upstream ships)

---

## Deferred (P3-P4)

---

### F6. Hub layout monotony
**Priority:** P4
**Source:** Bugfix plan item #12 (Feb 15)

`index.html` has 10 sections, most with only 1 card. Consider grouping related brands, visual hierarchy, or different card sizes.

**Effort:** High (design + implementation)

---

### F7. CSS variable namespace consolidation — Done
**Priority:** P4
**Source:** Bugfix plan item #13 (Feb 15)

Added ASCII namespace reference table to `theme.css` documenting all four parallel namespaces (portal-base, report-base, competitor-base, holliday portal-layout). Added `--color-*` bridge aliases to `report-base.css` and `competitor-base.css` so cross-namespace utilities can reference a consistent `--color-*` convention without renaming any existing variables. Portal-base needs no bridge (already uses `--color-*` natively). `--color-surface` intentionally scoped to competitor-base only (card surface concept vs. page background in report-base). Zero regression risk — purely additive.

**[DONE]**

---

## Reference

### Completed Item Summary

See [CHANGELOG.md](CHANGELOG.md) for full details.

| Session | Items Completed |
|---------|----------------|
| Feb 13 — Readability Audit | C1-C3, H1-H4, M1-M6, L1-L4 (16 items) |
| Feb 13 — Translations | T2, T3, T4 (3 items) |
| Feb 14 — DRY Review | D1-D13 (13 items) |
| Feb 15 — Design Review S1 | #1-#10 (10 items) |
| Feb 15 — Design Review S2 | F1-F4 (4 items) |
| Feb 16 — OTEL Improvement Phase 2 | F8-F12 (5 items) |
| Feb 18 — Accessibility Audit | A1-A10 (10 items) |
| Mar 9 — CSS Refactor & Theme System | A12, A13, H10, H12, H13, H14, W4 (7 items) |
| Mar 9 — Backlog Implementer | A11, W2, W3, F5 (4 items) |
| Mar 9 — Backlog Implementer (2) | H11-P3-A, H11-P3-B (2 items) |
| Mar 9 — Backlog Implementer (3) | H11-P4, T1 (2 items) |
| Mar 9 — Backlog Implementer (4) | T5 (1 item) |
| Mar 9 — Backlog Implementer (5) | F7 (1 item) |
| **Total** | **80 completed, 0 open** |

### Scorecard (Phase 2 — Feb 16)

All 12 directories at grade **A**. Baseline → Phase 1 → Phase 2 progression:

| Directory | Baseline | Phase 1 | Phase 2 | Dark Mode | Mobile | Tables | A11y |
|-----------|----------|---------|---------|-----------|--------|--------|------|
| `balloon-collective/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `capital_city/` | A | B | **A** | Pass | Pass | Pass | Pass |
| `edgar_nadyne/` | D | C | **A** | Pass | Pass | Pass | Pass |
| `holliday_lighting/` | C | C | **A** | Pass | Pass | Pass | Pass |
| `integrity-studio-ai/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `leora_research/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `ngo-market/` | D | D | **A** | Pass | Pass | Pass | Pass |
| `PerformanceTest/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `skelton-woody/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `sound-sight-tarot/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `trp-austin/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `zoukmx/` | D | B | **A** | Pass | Pass | Pass | Pass |

### DRY Testing Checklist

- [x] All portal index pages render correctly
- [x] All report pages maintain brand theming
- [x] Competitor analysis tables display correctly
- [x] Dark mode switches properly on all pages
- [x] Responsive breakpoints work at 768px and 480px
- [x] Print styles maintain formatting
- [x] Leora referral form and dashboard still function
- [x] No visual regressions in badge styling
