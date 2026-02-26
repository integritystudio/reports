# Backlog — Code Condense Whitepaper

GenAI quality review identified factual errors and hallucinations across 8 markdown documents. Session: 2026-02-25.

---

## P1 — Critical Errors (Publish Blockers)

#### M1: Fix RFC 8478/8878 mismatch in README.md
**Priority**: P1 | **Source**: genai-quality-monitor review — otel_telemetry_data_compression.md
The README describes `http-content-compression.md` as "RFC 8478 — Zstandard compression format specification, frame format, FSE and Huffman entropy encoding." However, RFC 8478 covers IANA media type registration for `application/zstd` (October 2018), not the binary format spec. The frame format/FSE/Huffman content belongs to RFC 8878 (the actual Zstandard format spec). Fix the file description or clarify the RFC numbering. -- `README.md:27`

#### M2: Remove fabricated OTLP Specification 1.9.0
**Priority**: P1 | **Source**: genai-quality-monitor review — otel_telemetry_data_compression.md
Line 112 claims "OTLP Specification 1.9.0" but OTLP spec does not use this version format. Replace with a direct URL to the current spec without a fabricated version number. -- `otel_telemetry_data_compression.md:112`

#### M3: Correct snappy-as-gRPC codec claim
**Priority**: P1 | **Source**: genai-quality-monitor review — otel_telemetry_data_compression.md
Lines 115 and 126 list `snappy` as a gRPC exporter compression option. Snappy is not a standard gRPC compression codec. Remove snappy from gRPC config examples; it applies only to Prometheus Remote Write v1. -- `otel_telemetry_data_compression.md:115,126`

#### M4: Audit and remove 2026-dated blog citations
**Priority**: P1 | **Source**: genai-quality-monitor review — otel_telemetry_data_compression.md
Lines 557 and 562 cite blog posts from 2026 ("Reducing Log Volume with the OTel Log Deduplication Processor" and "OneUptime blog post 2026-02-06") that may be fabricated. Remove or replace with verifiable sources before publishing. -- `otel_telemetry_data_compression.md:557,562`

#### M5: Verify repomix CLI flag argument syntax
**Priority**: P3 | **Source**: genai-quality-monitor review — repomix-command-line-cheat-sheet.md
All three flags (`--no-files`, `--token-count-tree [threshold]`, `--split-output <size>`) confirmed real via `npx repomix --help`. Verify cheat sheet descriptions match actual help text — e.g., `--token-count-tree` accepts an optional threshold (not `[N]`), `--split-output` accepts sizes like `500kb`, `2mb`, `2.5mb`. Update cheat sheet wording to match CLI help exactly. -- `repomix-command-line-cheat-sheet.md:17,24,31`

#### M6: Verify or remove ZIP method 98 PPM claim
**Priority**: P1 | **Source**: genai-quality-monitor review — prediction-by-partial-matching.md
Line 20 claims "method 98 in the ZIP file format specification" for PPM compression. ZIP method 98 is not in the PKZIP Application Note or IANA ZIP registry. Verify against official sources (Info-ZIP, 7-Zip docs) and remove if unverifiable. -- `prediction-by-partial-matching.md:20`

---

## P2 — High Hallucination Risk (Fix Before Publishing)

#### M7: Verify false-precision benchmarks in sql_kv_data_compression.md
**Priority**: P2 | **Source**: genai-quality-monitor review — sql_kv_data_compression.md
Line 36 claims "37.32% faster end-to-end" for LZ4 TOAST — false precision suggests cherry-picked result. Replace with range or cite specific test conditions. Similar issues: lines 50 (95% compression), 101 (800:1 ratio), 182-183 (RocksDB 2025 claim), 229 (40x latency improvement), 215-217 (LogicMonitor figures). -- `sql_kv_data_compression.md:36,50,101,182,215,229`

#### M8: Add citation for Character.AI compression claim
**Priority**: P2 | **Source**: genai-quality-monitor review — sql_kv_data_compression.md
Line 107 claims "Character.AI 15-20x average compression, some columns up to 50x" with no source. Either add a source URL or remove the claim. -- `sql_kv_data_compression.md:107`

#### M9: Verify GitHub issue numbers
**Priority**: P2 | **Source**: genai-quality-monitor review (multiple documents)
Verify the following GitHub issue numbers before publishing (common LLM hallucination pattern):
- otel_telemetry_data_compression.md: #13785, #9707, #4587
- repomix-command-line-cheat-sheet.md: #561, #516
Check each at GitHub and confirm issue exists. -- `otel_telemetry_data_compression.md:217,365,515` / `repomix-command-line-cheat-sheet.md:83`

#### M10: Verify ast-grep version and star counts
**Priority**: P2 | **Source**: genai-quality-monitor review — repomix_to_condense_with_additional_integrations.md
Line 280 cites "ast-grep v0.41.0" (likely fabricated version) and "12.6k stars" (unverifiable, volatile). Add date stamps to all star counts or remove them. Verify v0.41.0 against official ast-grep releases. -- `repomix_to_condense_with_additional_integrations.md:128,280`

---

## P3 — Quality Improvements (Before External Publication)

#### M11: Clarify "30+ languages" claim in README.md
**Priority**: P3 | **Source**: genai-quality-monitor review — README.md
Line 26 states zstd has "language bindings across 30+ languages" but underlying document only links to zstd homepage's "Other Languages" page without enumeration. Either count them from the zstd homepage or change to "language bindings reference via zstd homepage." -- `README.md:26`

#### M12: Qualify ~90% tokens reduction as estimate
**Priority**: P3 | **Source**: genai-quality-monitor review — README.md
Line 35 (Key Findings table) states "~90% tokens" for AI chat pipeline but source doc supports 75–85%. Change to "~85% tokens" or label as "estimated (combining `--compress`, comment removal, empty-line removal)." -- `README.md:35`

#### M13: Complete Section 4c in otel_telemetry_data_compression.md
**Priority**: P3 | **Source**: genai-quality-monitor review — otel_telemetry_data_compression.md
Section 4c header "Storage-Level Compression" (line 221) exists but body is missing; content deferred to Section 5. Add transition or merge sections. -- `otel_telemetry_data_compression.md:221`

#### M14: Rename http-content-compression.md for clarity
**Priority**: P3 | **Source**: genai-quality-monitor review — http-content-compression.md
Filename implies broad HTTP compression guide but file is verbatim RFC 8478 (zstd binary format spec only, no gzip/brotli coverage). Rename to `rfc8478-zstd-format-spec.md` or add HTTP-level framing content. -- `http-content-compression.md`

#### M15: Add preamble to http-content-compression.md
**Priority**: P3 | **Source**: genai-quality-monitor review — http-content-compression.md
RFC transcripts drop readers directly into frame header bit fields with no context. Insert 2-3 paragraph preamble explaining RFC scope, audience, and relationship to broader whitepaper. -- `http-content-compression.md:1`

#### M16: Clean Markdown rendering artifacts in http-content-compression.md
**Priority**: P3 | **Source**: genai-quality-monitor review — http-content-compression.md
RFC page-break headers (`Collet & Kucherawy  Informational  [Page N]`) and escaped identifiers (`Frame\_Header\_Descriptor`) add visual noise. Preprocess to remove RFC formatting artifacts. -- `http-content-compression.md` (throughout)

#### M17: Split PPM "Blending & Escape Symbols" bullet
**Priority**: P3 | **Source**: genai-quality-monitor review — prediction-by-partial-matching.md
Line 8 combines two distinct concepts. Split into separate mechanism bullets for clarity. -- `prediction-by-partial-matching.md:8`

#### M18: Remove or condense BWT section in repomix_to_condense.md
**Priority**: P3 | **Source**: genai-quality-monitor review — repomix_to_condense_with_additional_integrations.md
Section 3e (BWT preprocessing) adds no actionable value and reads as filler. Either cut or move to footnote. -- `repomix_to_condense_with_additional_integrations.md:3e`

---

## P4 — Nice-to-Have Polish

#### M19: Add caveat note to README.md
**Priority**: P4 | **Source**: genai-quality-monitor review — README.md
Key Findings presents all ranges as factual. Add one-line note that numbers are estimates from reference sources (not original empirical tests). -- `README.md:31`

#### M20: Fix ClickHouse NOAA benchmark table inconsistency
**Priority**: P4 | **Source**: genai-quality-monitor review — sql_kv_data_compression.md
Lines 94-95 show uncompressed size as 35.34 GiB and 36.05 GiB (unexplained discrepancy). Verify against source blog and correct. -- `sql_kv_data_compression.md:94-95`

#### M21: Add "symbols" definition to PPM document
**Priority**: P4 | **Source**: genai-quality-monitor review — prediction-by-partial-matching.md
Core Mechanism section should clarify that symbols are typically bytes or characters. One-sentence clarification improves accessibility. -- `prediction-by-partial-matching.md:6-9`

#### M22: Reduce redundancy in repomix cheat sheet
**Priority**: P4 | **Source**: genai-quality-monitor review — repomix-command-line-cheat-sheet.md
"Compression Configuration" (line 67) and "Full Configuration Template" (line 96) overlap. Merge or label as "minimal" vs "full template." -- `repomix-command-line-cheat-sheet.md:67,96`

#### M23: Qualify Python-specific placeholder in cheat sheet
**Priority**: P4 | **Source**: genai-quality-monitor review — repomix-command-line-cheat-sheet.md
Line 63 mentions `pass` placeholder as if universal. Qualify as Python-specific (TypeScript uses `// ...`). -- `repomix-command-line-cheat-sheet.md:63`

---

**Summary**: 23 backlog items across quality tiers. P1 (6 items) blocks publication; fix before external sharing. P2 (5 items) high hallucination risk; verify before publishing. P3 (11 items) polish for professional appearance. P4 (1 item) nice-to-have.

Total files affected: 8 markdown documents. Most critical: `otel_telemetry_data_compression.md` (4 P1 issues), `sql_kv_data_compression.md` (2 P1 + 3 P2 issues).
