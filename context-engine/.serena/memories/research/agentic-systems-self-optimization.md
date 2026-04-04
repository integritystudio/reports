---
name: Self-Optimizing Agentic Systems Research
description: Complete architecture + whitepaper for converting code quality feedback into RL-based continuous agent improvement
type: project
---

## Documents Created (April 3, 2026)

### 1. Architecture Document
**File**: `/Users/alyshialedlie/reports/context-engine/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md`
**Length**: ~4,500 words
**Status**: Complete specification

**Key Sections**:
- Problem statement: Agent code exhibits 2-3x higher churn, 40-60% lower 21d survival vs human
- Churn data model: Popescu et al. metrics (survival_rate, churn_rate, deletion_rate, merge signals)
- OTEL telemetry: Span hierarchy for code-generation → code-review → code-survival checkpoints
- Gymnasium environment: `CodeQualityEnv` with delayed rewards (21d outcomes)
- Multi-agent PPO: Stable Baselines3, separate policies per skill, shared value function
- Feedback pipeline: Git webhook → async survival measurement → OTEL feature store → RL training
- Canary deployment: 3-phase rollout with auto-rollback triggers
- Implementation roadmap: 4 phases (instrumentation → RL env → training → deployment)

### 2. Technical Whitepaper
**File**: `/Users/alyshialedlie/reports/context-engine/SELF_OPTIMIZING_AGENTS_WHITEPAPER.md`
**Length**: ~6,500 words
**Status**: Publication-ready

**Key Sections**:
- Abstract: RL approach to convert 21d code quality metrics into agent optimization signals
- Introduction: Root cause (agents lack post-deployment feedback), solution (closed-loop RL)
- Popescu et al. foundation: Study design, key findings, why 21d window works
- OTEL instrumentation: Git-based survival measurement, feature store export
- Gymnasium design: Observation space (task + history + repo profile), action space (code + parameters), reward function
- PPO training: Algorithm selection, multi-skill policies, handling 21d latency via auxiliary rewards + importance weighting
- Canary deployment: 3 phases (shadow, 10%, gradual), rollback triggers
- Implementation roadmap: 4 phases over 8 weeks
- Risks: Reward hacking, distribution shift, latency, data quality, diversity collapse
- Success metrics: Survival 75% → 85%, churn 18% → 10%, merge rate 72% → 92%
- Open questions: 5 research directions for future work

## Connection to Popescu et al. (2604.00917)

**Core insight**: Popescu's empirical observation of agent code churn becomes the **ground truth reward signal** for RL training.

**Metrics used**:
- `survival_rate[21d]`: Primary reward component (R_survival = 100 * S)
- `churn_rate[21d]`: Penalty term (R_churn = -50 * C)
- `merge_time_hours`: Auxiliary reward (fast merges → clear code)
- `review_comments`: Proxy for code clarity
- `change_size`: Regularization term

**Why 21 days**: Popescu showed this is inflection point where agent/human divergence stabilizes and is not noise.

## Technical Stack

- **Instrumentation**: OpenTelemetry + Git webhooks + scheduled cron jobs
- **Feature Store**: Parquet files (survives_21d, churn_21d, agent_name, skill, etc.)
- **RL Framework**: Stable Baselines3 (PPO) + Pufferlib (multi-agent)
- **Environment**: Gymnasium-compatible `CodeQualityEnv`
- **Deployment**: Canary rollout with automated rollback

## Key Design Decisions

1. **21-day window** for rewards (not 3d or 7d) because stability matters long-term
2. **Auxiliary immediate rewards** (merge time, review count) to reduce 21d training latency
3. **Importance-weighted delayed updates** to handle policy drift while waiting for 21d outcomes
4. **Multi-skill policies with shared value function** for transfer learning and knowledge sharing
5. **Canary deployment** with automated rollback triggers for production safety

## Success Target

- Reduce agent code churn from 15-18% → ≤10% (target: human baseline ~5%)
- Improve 21d survival from 75-78% → ≥85%
- Close agent-human quality gap by 50% within 6-12 months
- Maintain ≥92% merge rate (code still passes review)
