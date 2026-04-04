---
name: Agent Code Churn Study (arXiv 2604.00917)
description: Popescu et al. (2026) comparative analysis of agent-generated vs human code stability, churn, and long-term viability metrics
type: reference
---

## Paper Details
**Title**: "Investigating Autonomous Agent Contributions in the Wild: Activity Patterns and Code Change over Time"
**Authors**: Popescu, Mihai, Gros, Botocan, Pandita, Devanbu, Izadi
**Date**: April 1, 2026 (arXiv:2604.00917v1)
**URL**: https://arxiv.org/html/2604.00917v1

## Key Metrics Model

### Activity Metrics (PR-level)
- Change size (median lines added)
- Merge rate (% PRs merged)
- Merge time (median hours to merge)
- Comments per PR
- Review count

### Code Change Metrics (Post-merge tracking)
- **Survival rate**: % of lines surviving at T+3d, T+7d, T+21d
- **Churn rate**: % of lines modified after merge
- **Deletion rate**: % of lines deleted by subsequent commits
- Measurement windows: 3-day, 1-week, 3-week post-merge

## Agent Cohort (110K+ PRs)
1. OpenAI Codex (identification: branch prefix patterns)
2. Claude Code (authorship signals)
3. GitHub Copilot (watermarks)
4. Google Jules (agent metadata)
5. Devin (tool watermarks)

## Key Findings

### Agent vs Human Divergence
- **Agent code**: Larger changes (Claude: 376 lines median vs human: 60 lines)
- **Survival gap**: Human commits show 40-60% better 3-week survival
- **Churn profile**: Agent code exhibits 2-3x higher churn across intervals
- **Merge speed variance**: Codex (0.5min) vs Devin (8+ hours) — 1000x difference

### Repository Bias
- Agent PRs: 51-76% in 0-star repos (likely test/validation projects)
- Human PRs: More distributed across established projects
- **Implication**: Agent code may not be tested in production-grade contexts

## Why This Matters for Self-Optimizing Systems

The churn model provides **quantifiable feedback signal** for:
1. Detecting agent outputs likely to fail in production
2. Measuring quality degradation over time
3. Training RL models to optimize for long-term code stability (not just immediate merge)
4. Comparing agent architectures (plugin vs monolithic, reasoning depth, etc.)

## How to Convert to OTEL Signals
- Merge rate → span attribute `code.quality.merge_success_rate`
- Survival rate @ 3w → `code.quality.survival_3w`
- Churn rate @ 7d → `code.quality.churn_7d`
- Change size → `code.structure.lines_changed_median`
- Observations: Aggregate over agent/skill/plugin version + time window
