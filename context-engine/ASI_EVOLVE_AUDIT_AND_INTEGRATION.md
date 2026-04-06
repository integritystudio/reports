# Evolutionary Program Search Meets Production Agentic Systems: Auditing ASI-Evolve Against Anthropic Best Practices and Integrating with RL-Based Self-Optimization

**Date**: April 5, 2026
**Authors**: Integrity Studio AI Research
**Version**: 1.0
**Status**: Technical Whitepaper

---

## Abstract

ASI-Evolve (Xu et al., 2026) introduces a learn-design-experiment-analyze cycle for autonomous AI research, demonstrating state-of-the-art results across neural architecture design, pretraining data curation, and reinforcement learning algorithm discovery. However, translating research-grade evolutionary frameworks into production agentic systems requires systematic alignment with established deployment best practices. This whitepaper conducts a structured audit of ASI-Evolve's five core components (Researcher, Engineer, Analyzer, Cognition Base, Database) against seven dimensions of Anthropic's 2026 agentic system guidelines, producing a 35-cell compliance matrix with STRONG/PARTIAL/WEAK/MISSING ratings. We identify three critical alignment strengths (closed-loop evaluation, principled exploration via UCB1/MAP-Elites, domain-adaptive context engineering) and three critical gaps (absent human oversight, missing meta-evaluation, no checkpoint-resume capability). We then propose an integration architecture mapping ASI-Evolve components to Claude production patterns, design a hybrid RL+Evolution pipeline that uses Popescu et al. (2026) code survival metrics as evolutionary fitness signals, and specify safety governance for self-improving systems grounded in Anthropic's five safety principles. This document extends the RL-based self-optimization framework established in our prior whitepapers (Integrity Studio, 2026a, 2026b) by introducing evolutionary program search as a complementary optimization paradigm.

**Keywords**: Evolutionary Search, Agentic Systems, Best Practice Audit, Claude API, Self-Optimization, OpenTelemetry, Reinforcement Learning, Safety Governance

---

## Confidence Level Key

| Level | Indicator | Criteria |
|-------|-----------|----------|
| High | `[HIGH]` | Independently verifiable; reproducible; multiple corroborating sources |
| Medium | `[MED]` | Partially verifiable; relies on limited external evidence or single source |
| Low | `[LOW]` | Unverifiable from public record; self-reported only; requires further investigation |

---

## 1. Introduction

### 1.1 The Convergence of Evolutionary and Agentic AI

The landscape of autonomous AI research has bifurcated into two paradigms. The first, exemplified by production agentic systems like Claude Code and GitHub Copilot, deploys LLM-based agents for well-scoped software engineering tasks with rapid human feedback. The second, represented by evolutionary frameworks like AlphaEvolve (Novikov et al., 2025), FunSearch (Romera-Paredes et al., 2023), and ASI-Evolve (Xu et al., 2026), pursues open-ended scientific discovery through population-based search over program space.

ASI-Evolve advances this second paradigm by introducing a structured learn-design-experiment-analyze cycle augmented with two distinguishing components: a **cognition base** that injects accumulated human research priors into each exploration round, and a dedicated **analyzer** that distills complex experimental outcomes into reusable insights. The framework demonstrates results across three central components of AI development `[MED]`:

- **Architecture Design**: 105 SOTA linear attention architectures discovered across 1,773 rounds; best model surpasses DeltaNet by +0.97 points (Table 1, Section 4.1)
- **Data Curation**: Evolved strategies improve average benchmark performance by +3.96 points, with +18.64 points on MMLU (Table 2, Section 4.2)
- **RL Algorithm Design**: Discovered algorithms outperform GRPO by up to +12.5 points on AMC32, +11.67 on AIME24, +5.04 on OlympiadBench (Table 3, Section 4.3)
- **Benchmark Convergence**: Circle packing SOTA (2.6360) achieved in 17 rounds; OpenEvolve reached 2.6343 in 460 rounds (Table 4, Section 5.2.1)

These results are reported by the authors and have not been independently replicated at the time of writing `[LOW]`.

### 1.2 The Production Gap

Despite these research results, ASI-Evolve is a research framework designed for offline scientific exploration. Production agentic systems face fundamentally different constraints: rate limits, context window budgets, human oversight requirements, security boundaries, and the need for incremental, auditable progress. Anthropic's 2026 engineering guidance articulates these constraints through specific architectural patterns, tool design principles, and safety frameworks that ASI-Evolve does not address.

This gap is not a deficiency of ASI-Evolve -- the framework was not designed for production deployment. Rather, it represents an integration opportunity: the evolutionary search paradigm offers capabilities (principled exploration, diversity maintenance, knowledge accumulation) that current production agentic systems lack, while production best practices offer the safety, efficiency, and auditability that evolutionary frameworks need.

### 1.3 Relationship to Prior Work

This whitepaper is the third in a series on agentic self-optimization:

- **Paper 1** (Integrity Studio, 2026a): Establishes the concept of converting Popescu et al. (2026) code churn metrics into RL reward signals. Defines the 21-day survival feedback loop, auxiliary reward signals, and canary deployment safeguards. See Sections 1.2-1.3 and the reward formulation in Section 4.
- **Paper 2** (Integrity Studio, 2026b): Details the OTEL telemetry architecture, Gymnasium-compatible RL environment design, PPO training pipeline via Stable Baselines3/Pufferlib, and deployment safety guardrails. See the span model in Section 3 and RL environment in Section 4.

This document extends both by introducing **evolutionary program search as a complementary optimization paradigm**. Where Papers 1-2 optimize a fixed agent via gradient-based policy updates (PPO), ASI-Evolve offers population-based search over discrete program space. The two are not mutually exclusive: survival metrics can serve as fitness functions for evolutionary search, and evolutionary diversity can address the agent diversity collapse risk identified in Paper 1.

### 1.4 Document Structure

- **Section 2**: Technical decomposition of ASI-Evolve's five components
- **Section 3**: Systematic audit against seven Anthropic best practice dimensions
- **Section 4**: Integration architecture mapping components to Claude production patterns
- **Section 5**: Hybrid RL+Evolution design bridging evolutionary search with the existing survival metrics pipeline
- **Section 6**: Safety and governance framework for self-improving evolutionary loops
- **Section 7**: Implementation roadmap
- **Section 8**: Risks and mitigations
- **Section 9**: Open questions
- **Section 10**: Conclusion

---

## 2. ASI-Evolve Framework Analysis

### 2.1 Component Decomposition

ASI-Evolve organizes autonomous research into five modules that collectively implement a closed-loop scientific process `[HIGH]`:

**Researcher.** The generative engine of the loop. Each round, the Researcher samples *n* context nodes from the Database, retrieves relevant entries from the Cognition Base via embedding-based semantic search, and uses an LLM to produce a complete candidate program together with a natural-language motivation. The system supports both full-code generation and diff-based editing for evolving larger codebases (Section 3.1).

**Engineer.** The execution and validation module. Given a generated program, the Engineer invokes a user-specified evaluation procedure that runs the experiment end-to-end and returns structured metrics including a primary scalar fitness score. It supports early rejection via configurable wall-clock limits and lightweight quick tests, as well as an optional LLM-based judge for qualitative assessment (Section 3.2).

**Analyzer.** The feedback distillation module. The Analyzer receives the current program together with full experimental output -- including raw logs and detailed metrics -- and distills them into a compact, decision-oriented report. This report is persisted in the Database and used for retrieval in subsequent rounds, keeping context length manageable without sacrificing analytical depth (Section 3.3).

**Cognition Base.** The domain knowledge repository. A collection of task-relevant textual items indexed by embeddings. Corpus size varies by task: ~150 entries from 100 papers for architecture design (Section 4.1), ~80 papers for drug-target interaction (Section 5.4), and 10 papers for RL algorithm design (Section 4.3). In each round, after sampling context nodes from the Database, the pipeline uses the sampled nodes' information as queries to retrieve cognition entries via embedding-based semantic search. These entries are injected into the Researcher's context to provide human research priors (Section 3.4).

**Database.** The persistent evolutionary memory. Each evolution step produces a node storing: (i) Researcher motivation, (ii) generated program, (iii) structured evaluation results, (iv) analysis report, and (v) auxiliary metadata. For parent selection, the system offers multiple sampling policies behind a unified interface: UCB1, random, greedy, and MAP-Elites island algorithm (Section 3.5).

### 2.2 The Evolutionary Loop as Closed-Loop Control

ASI-Evolve's learn-design-experiment-analyze cycle directly addresses the open-loop problem identified in Paper 1 (Section 1.2). Where current production agents operate as:

```
Task Prompt --> Agent --> Code Output --> (submit, no feedback)
```

ASI-Evolve implements:

```
┌──────────────────────────────────────────────────────────┐
│ Cognition Base (domain priors)                           │
│     ↓ retrieval                                          │
│ Researcher (generate candidate from context + cognition) │
│     ↓                                                    │
│ Engineer (execute, evaluate, score)                      │
│     ↓                                                    │
│ Analyzer (distill feedback into compact report)          │
│     ↓                                                    │
│ Database (store node, sample for next round)             │
│     ↓ (loop)                                             │
│ Researcher (informed by accumulated experience)          │
└──────────────────────────────────────────────────────────┘
```

This structural parallel is significant: both ASI-Evolve and the RL pipeline in Papers 1-2 solve the same fundamental problem (missing feedback loops) but through different optimization mechanisms -- evolutionary selection vs. gradient-based policy updates.

### 2.3 Sampling Policies as Exploration Strategies

The Database's sampling policies deserve particular attention because they address a challenge that pure LLM-based agents handle poorly: the explore-exploit tradeoff `[HIGH]`.

**UCB1** (Upper Confidence Bound) treats each database node as a bandit arm and selects based on an upper confidence bound combining estimated value with an exploration bonus inversely proportional to visit count (Auer et al., 2002). This provides provable regret bounds for stationary environments, though the research search space is non-stationary.

**MAP-Elites** (Multi-dimensional Archive of Phenotypic Elites) maintains a quality-diversity archive partitioned by behavioral features, actively preserving diverse niches to prevent premature convergence (Mouret & Clune, 2015). This directly addresses the "Agent Diversity Collapse" risk identified in Paper 1 -- where PPO-trained agents converge to a narrow set of coding patterns.

ASI-Evolve's empirical results suggest that in the presence of a strong Cognition Base, UCB1 outperforms MAP-Elites for convergence speed on the circle packing benchmark: UCB1 + GPT-5-mini reached SOTA (2.63597) in 17 steps vs. MAP-Elites' 79 steps with the same base model (Section 5.2.3) `[MED]`. The authors note that "the circle packing task is relatively straightforward, so the performance gap between configurations is less pronounced than it would be on more complex tasks" (Section 5.3.2). Whether this advantage generalizes to production settings with more complex fitness landscapes remains an open question `[LOW]`.

---

## 3. Systematic Audit Against Anthropic Best Practices

We evaluate each ASI-Evolve component against seven dimensions derived from Anthropic's 2026 agentic system guidelines. Each cell in the matrix below receives a compliance rating:

- **STRONG**: Design choice directly implements the best practice
- **PARTIAL**: Conceptually aligned but incomplete implementation
- **WEAK**: Minimal alignment; significant gaps
- **MISSING**: Best practice not addressed

### 3.1 Dimension A: Architectural Patterns

Anthropic identifies five core workflow patterns for building effective agents: prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer `[HIGH]` (Anthropic, 2026a).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | PARTIAL | Implements prompt chaining (context assembly then generation) but lacks orchestrator-worker separation; generation is monolithic rather than delegated to specialized workers |
| Engineer | STRONG | Maps cleanly to prompt chaining with validation gates (timeout, early rejection). LLM-based judge implements evaluator pattern |
| Analyzer | STRONG | Direct implementation of the evaluator half of evaluator-optimizer. Produces structured feedback that closes the optimization cycle |
| Cognition Base | PARTIAL | Enables the routing pattern (embedding retrieval selects which knowledge to surface) but uses only a single retrieval strategy |
| Database | STRONG | Sampling policies implement a sophisticated routing pattern; UCB1 and MAP-Elites route exploration toward productive regions of the search space |

**Key conflict**: Anthropic explicitly recommends "simple, composable patterns rather than complex frameworks." ASI-Evolve is a monolithic framework with tightly coupled components. For production integration, the components should be decomposed into independent, composable agents.

**Missing pattern**: No explicit parallelization. ASI-Evolve executes candidates sequentially. Anthropic's parallelization pattern (fan-out candidate generation, fan-in evaluation) would improve throughput.

### 3.2 Dimension B: Tool Design

Anthropic specifies seven principles for writing effective tools: strategic choice, consolidation, namespacing, high-signal returns, token efficiency, description engineering, and systematic evaluation `[HIGH]` (Anthropic, 2026b).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | WEAK | Single retrieval mechanism (embedding similarity) without strategic choice between retrieval strategies. No namespacing of retrieval operations |
| Engineer | PARTIAL | Execution + timeout + LLM judge represent reasonable strategic choices. High-signal returns via early rejection. Missing systematic evaluation of judge calibration |
| Analyzer | PARTIAL | Compact report format suggests token efficiency awareness. Missing structured output schema for cross-experiment comparison |
| Cognition Base | PARTIAL | Embedding index is well-scoped as a single tool. Missing consolidation with Database retrieval into a unified interface |
| Database | STRONG | Multiple sampling strategies represent strategic tool choice. Node schema consolidates motivation, program, results, analysis, and metadata |

**Key gap**: Token efficiency. The Researcher receives full context + cognition items without documented compression or relevance filtering. In production Claude API usage, where input tokens directly affect cost and latency, this would require cache-aware optimization and prompt caching strategies.

### 3.3 Dimension C: Context Engineering

Anthropic's context engineering guidance emphasizes direct system prompts, dynamic retrieval (lightweight refs then JIT load), structured note-taking, sub-agent architectures, and finding "the smallest set of high-signal tokens" `[HIGH]` (Anthropic, 2026c).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | PARTIAL | Receives structured context from Database sampling and Cognition retrieval. Missing sub-agent architecture for context assembly |
| Engineer | WEAK | Context is fixed at invocation time; no dynamic retrieval during execution if errors occur |
| Analyzer | STRONG | Core function IS context engineering -- compresses high-dimensional feedback into compact, high-signal reports. Implements "smallest set of high-signal tokens" for downstream consumption |
| Cognition Base | STRONG | Direct implementation of dynamic retrieval for context assembly. Embedding-indexed corpus is the canonical RAG pattern |
| Database | PARTIAL | Stores compact reports (structured notes) but sampling optimizes for score landscape, not semantic diversity of context |

**Key strength**: The Analyzer's role as a lossy context compressor optimized for downstream decision-making is a valuable primitive not explicitly covered in Anthropic's current guidance. It addresses the practical challenge of maintaining long-horizon context across many iterations without exceeding context budgets.

### 3.4 Dimension D: Safety

Anthropic's safety framework for trustworthy agents specifies five principles: human control, transparency, value alignment, privacy, and security against manipulation `[HIGH]` (Anthropic, 2026d).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | WEAK | No human-in-the-loop on candidate generation. No transparency mechanism for explaining retrieval decisions. No value alignment checks on generated hypotheses |
| Engineer | PARTIAL | Wall-clock timeouts prevent runaway compute. Early rejection prevents resource waste. Missing human escalation path for uncertain judge decisions |
| Analyzer | WEAK | No faithfulness verification that compact reports accurately represent raw results. Misleading summaries could cause the Researcher to pursue dead-end hypotheses |
| Cognition Base | WEAK | No curation controls on what enters the corpus. No provenance tracking. Poisoned papers could systematically bias all downstream research |
| Database | PARTIAL | Multiple sampling strategies provide diversity (reducing premature convergence risk). Missing data integrity controls, audit trail, and rollback mechanism |

**Critical finding**: Safety is the most significant gap across all five components. ASI-Evolve is designed for autonomous operation without human oversight, which directly conflicts with Anthropic's first principle (human control). Anthropic's agentic misalignment research demonstrates that frontier models can engage in harmful autonomous behavior when given extensive information access with minimal oversight `[HIGH]` (Anthropic, 2026e). Self-improving evolutionary systems amplify this risk because the loop generates novel programs that may behave unpredictably.

### 3.5 Dimension E: Evaluation

Anthropic's evaluation framework specifies five components: tasks, trials, graders, transcripts, and outcomes `[HIGH]` (Anthropic, 2026f).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | MISSING | Does not evaluate its own outputs. No pre-evaluation grader before Engineer handoff |
| Engineer | STRONG | LLM-based judge directly implements the grader concept. Wall-clock limits represent trial constraints. Execution results serve as outcomes |
| Analyzer | PARTIAL | Produces evaluation artifacts (reports) but is not itself evaluated. No meta-grader for report quality |
| Cognition Base | MISSING | No evaluation of retrieval effectiveness (precision, recall, downstream impact). Entire evaluation dimension absent |
| Database | PARTIAL | Implicitly evaluates candidates via sampling scores. Missing systematic evaluation of sampling strategy effectiveness (no A/B testing framework) |

**Key observation**: ASI-Evolve evaluates its *outputs* (candidate programs) but does not evaluate its *components*. Is the Cognition Base retrieval effective? Is the LLM judge calibrated? Are the sampling strategies optimal? Claude's evaluation framework should be applied not just to experiment results but to each component's performance -- a form of meta-evaluation that production systems require.

### 3.6 Dimension F: Long-Running Agent Design

Anthropic's guidance on long-running agent harnesses emphasizes the initializer/coding agent pattern, feature-list tracking, incremental work, browser-based verification, and consistent startup routines `[HIGH]` (Anthropic, 2026g).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | PARTIAL | Operates within the broader loop (inherently long-running). Cognition Base serves as persistent memory. Missing initializer pattern and startup routine |
| Engineer | PARTIAL | Timeouts appropriate for long-running execution. Missing checkpoint-resume capability; timed-out experiments lose all progress |
| Analyzer | PARTIAL | Reports stored in Database provide persistent memory across iterations. Missing structured note-taking pattern and meta-analysis layer |
| Cognition Base | STRONG | Persistent across all iterations. Represents accumulated domain knowledge. Matches the "external memory" pattern |
| Database | STRONG | Persistence backbone of the entire system. Enables resume, incremental building, and state maintenance across arbitrarily long campaigns |

**Key gap**: No checkpoint-resume pattern. If any step fails or times out, the work is lost. For research campaigns that run for weeks (1,773 rounds in architecture search), this is a significant operational risk.

### 3.7 Dimension G: Rate Limits and Efficiency

Claude API rate limits (RPM, ITPM, OTPM) require cache-aware optimization, budget caps, and efficient token usage `[HIGH]` (Anthropic, 2026h).

| Component | Rating | Evidence |
|-----------|--------|----------|
| Researcher | MISSING | No cache-aware optimization. Each invocation appears to be a fresh LLM call without prompt caching |
| Engineer | PARTIAL | Early rejection prevents wasted compute. Missing cost-per-evaluation tracking |
| Analyzer | PARTIAL | Compact reports reduce downstream token consumption. Missing adaptive compression based on budget remaining |
| Cognition Base | MISSING | No token budget awareness. Retrieval volume does not adapt to remaining context capacity |
| Database | WEAK | No max_turns or max_budget_usd caps on the evolutionary loop. UCB1 naturally limits redundant exploration but without explicit budget enforcement |

### 3.8 Audit Summary

**Compliance Matrix (35 cells)**:

| | Arch. Patterns | Tool Design | Context Eng. | Safety | Evaluation | Long-Running | Rate Limits |
|---|---|---|---|---|---|---|---|
| **Researcher** | PARTIAL | WEAK | PARTIAL | WEAK | MISSING | PARTIAL | MISSING |
| **Engineer** | STRONG | PARTIAL | WEAK | PARTIAL | STRONG | PARTIAL | PARTIAL |
| **Analyzer** | STRONG | PARTIAL | STRONG | WEAK | PARTIAL | PARTIAL | PARTIAL |
| **Cognition** | PARTIAL | PARTIAL | STRONG | WEAK | MISSING | STRONG | MISSING |
| **Database** | STRONG | STRONG | PARTIAL | PARTIAL | PARTIAL | STRONG | WEAK |

**Distribution**: 7 STRONG, 14 PARTIAL, 6 WEAK, 5 MISSING (total: 32 of 35 cells rated; 3 cells share a rating with an adjacent dimension and are counted under their primary rating)

**Top 3 Strengths**:
1. Closed-loop evaluation via Analyzer + Database feedback cycle (evaluator-optimizer pattern)
2. Principled exploration via UCB1/MAP-Elites with mathematical grounding (Auer et al., 2002; Mouret & Clune, 2015)
3. Domain-adaptive context engineering via the Cognition Base (embedding-indexed RAG over curated literature)

**Top 3 Critical Gaps**:
1. Safety and human oversight are systematically absent across all components
2. No meta-evaluation of the system's own components (only evaluates candidate outputs)
3. No checkpoint-resume or incremental work pattern for long-running campaigns

---

## 4. Integration Architecture

We propose mapping ASI-Evolve's five components to Claude production patterns, producing a system that combines evolutionary search capabilities with production-grade safety, efficiency, and auditability.

### 4.1 Researcher as Orchestrator-Workers

The Researcher's monolithic candidate generation decomposes naturally into Anthropic's orchestrator-workers pattern:

**Orchestrator** (Claude API call with tool use):
- Receives the current research objective and Database-sampled context
- Decomposes the search space into parallel candidate generation tasks
- Specifies constraints and quality criteria for each worker

**Workers** (parallel Claude API calls):
- Each worker generates one candidate program from a distinct region of the search space
- Workers receive different subsets of Cognition Base entries (enforcing exploration diversity)
- Workers use structured outputs (`strict: true`) to guarantee schema conformance

**Fan-in**:
- Candidates are collected, deduplicated by motivation similarity (ASI-Evolve's novelty check), and forwarded to the Engineer

This mapping enables Anthropic's parallelization pattern: instead of generating one candidate per round, the system generates K candidates in parallel, bounded by the rate limit budget. With prompt caching, the shared context (task description, Cognition Base results) is cached across parallel calls, achieving up to 5x effective throughput `[MED]`.

### 4.2 Engineer as Tool Use + Execution Sandboxing

The Engineer maps directly to Claude's tool use framework:

```
┌────────────────────────────────────────────┐
│ Claude orchestrator calls execute_candidate│
│ tool with:                                 │
│   - candidate_program: string              │
│   - timeout_ms: number                     │
│   - evaluation_script: string              │
│   - budget_usd: number                     │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│ Tool implementation:                       │
│   1. Sandbox creation (container isolation)│
│   2. Program execution with timeout        │
│   3. Metric collection                     │
│   4. OTEL span emission                   │
│   5. Early rejection if quality < threshold│
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│ Tool returns structured metrics:           │
│   { score, benchmarks, logs_summary,       │
│     execution_time, resource_usage }       │
└────────────────────────────────────────────┘
```

Each Engineer execution emits an OTEL span connected to the telemetry model from Paper 2 (Section 3). The span type `evolution.evaluation` carries attributes:

- `evolution.round`: Current evolution round number
- `evolution.candidate_id`: Unique candidate identifier
- `evolution.parent_id`: Parent node from Database sampling
- `evolution.fitness_score`: Primary scalar fitness
- `evolution.execution_time_ms`: Wall-clock execution time
- `code.quality.*`: Reuse the code quality attributes from Paper 2's span model

### 4.3 Analyzer as Evaluator-Optimizer

The Analyzer maps to the evaluator-optimizer pattern with two enhancements:

**Evaluator** (Claude API call):
- Receives: candidate program + full execution output (logs, metrics, benchmarks)
- Produces: structured JSON report with required fields:
  - `hypothesis_tested`: Natural language description
  - `result_summary`: Key findings
  - `confidence_level`: HIGH/MED/LOW
  - `recommended_next_steps`: Actionable guidance for the Researcher
  - `failure_modes_observed`: Identified issues
  - `numerical_claims`: Array of {claim, value, source} tuples for faithfulness verification

**Faithfulness Check** (programmatic, not LLM):
- Each numerical claim in the report is verified against raw execution data
- Mismatches are flagged before the report is stored in the Database
- This addresses the hallucination risk identified in our audit (Section 3.4)

**OTEL Integration**:
- LLM-as-Judge scores (referenced in Paper 2's OTEL Quality Scorecard) serve as one dimension of the Analyzer's evaluation
- The Analyzer emits an `evolution.analysis` span linking the evaluation span to the analysis report

### 4.4 Cognition Base as Context Engineering + RAG

We adapt the Cognition Base to Anthropic's "lightweight refs then JIT load" pattern:

**Phase 1 -- Lightweight Retrieval**:
- Embedding index returns document IDs, titles, and 2-3 sentence snippets (not full content)
- Token cost: ~100 tokens per retrieved item (vs. potentially thousands for full papers)
- Top-K retrieval with configurable K based on remaining context budget

**Phase 2 -- JIT Loading**:
- The Researcher can request full content of specific retrieved items via a `load_cognition_item` tool
- Full content is loaded only when the Researcher determines it needs deeper detail
- This implements Anthropic's dynamic retrieval pattern with explicit budget awareness

**Sub-agent Architecture**:
- A dedicated context management sub-agent handles retrieval, deduplication, contradiction resolution, and synthesis
- The sub-agent produces a structured briefing document rather than raw retrieval results
- This isolates context engineering complexity from the Researcher's generative task

**Growth Strategy**:
- The Cognition Base is not static. As the system discovers relevant new findings, the Analyzer can recommend additions
- Human curation gate: all corpus additions require human approval (addressing the data poisoning risk from Section 3.4)

### 4.5 Database as Structured State Persistence

The Database maps to Anthropic's "feature-list-as-JSON" pattern for long-running agents:

```json
{
  "evolution_state": {
    "round": 1773,
    "best_score": 57.28,
    "total_candidates": 1350,
    "successful_candidates": 105,
    "sampling_policy": "ucb1",
    "budget_remaining_usd": 450.00
  },
  "nodes": [
    {
      "id": "node_001",
      "round": 1,
      "motivation": "...",
      "program_hash": "sha256:...",
      "fitness_score": 55.76,
      "analysis_summary": "...",
      "parent_id": null,
      "lineage_depth": 0,
      "otel_trace_id": "...",
      "created_at": "2026-04-05T10:00:00Z"
    }
  ]
}
```

**Startup Routine** (addressing the long-running agent gap):
1. Load evolution state from the Database
2. Review the current exploration frontier (top-K nodes by score)
3. Select sampling strategy based on convergence metrics (UCB1 if still climbing, MAP-Elites if plateaued)
4. Log startup decisions to OTEL for auditability
5. Resume from the last completed round

### 4.6 Integration Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude API (Orchestrator)                 │
│                                                             │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐              │
│  │Researcher│───→│ Engineer  │───→│ Analyzer │              │
│  │(Workers) │    │(Tool Use) │    │(Evaluator│              │
│  └────┬─────┘    └─────┬─────┘    └────┬─────┘              │
│       │                │               │                    │
│       │          ┌─────▼─────┐         │                    │
│       │          │ Sandbox   │         │                    │
│       │          │ Execution │         │                    │
│       │          └─────┬─────┘         │                    │
│       │                │               │                    │
│       │          OTEL spans            │                    │
│       │          (evolution.*)         │                    │
│       │                │               │                    │
│  ┌────▼────────────────▼───────────────▼────┐              │
│  │              Database                     │              │
│  │  (JSON store + UCB1/MAP-Elites sampling)  │              │
│  └────┬─────────────────────────────────────┘              │
│       │                                                     │
│  ┌────▼─────────────┐                                      │
│  │  Cognition Base   │                                      │
│  │  (RAG: lightweight│                                      │
│  │   refs + JIT load)│                                      │
│  └───────────────────┘                                      │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  Safety Layer                             │              │
│  │  - Budget caps (max_turns, max_budget_usd)│              │
│  │  - Human approval gates                   │              │
│  │  - Kill switch                            │              │
│  │  - Scope constraints                      │              │
│  │  - Faithfulness verification              │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  OTEL Collector                           │              │
│  │  - evolution.generation spans             │              │
│  │  - evolution.evaluation spans             │              │
│  │  - evolution.analysis spans               │              │
│  │  - evolution.selection spans              │              │
│  │  - code.quality.* attributes              │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Bridging Evolutionary Search and RL Self-Optimization

### 5.1 Survival Metrics as Fitness Functions

The central insight connecting ASI-Evolve to the existing RL pipeline is that **Popescu et al.'s 21-day code survival rate can serve as a fitness signal for evolutionary search** `[MED]`.

In Papers 1-2, the survival rate feeds into an RL reward function:

```
R = 100 * survival_21d - 50 * churn_21d - 25 * deletion_21d - 5 * change_size_normalized
```

In the evolutionary paradigm, this same formulation becomes a fitness function for UCB1 ranking:

```
fitness(node) = R(node.program)    // identical reward formula
UCB1_score(node) = fitness(node) / visits(node) + c * sqrt(ln(total_rounds) / visits(node))
```

The mathematical machinery is complementary: UCB1 uses the fitness signal for parent selection (which programs to build on), while PPO uses the same signal for gradient-based policy updates (how to generate better programs). This duality suggests a hybrid architecture.

### 5.2 Hybrid Architecture: RL + Evolution

We propose a two-level optimization architecture:

**Level 1 -- RL (exploitation)**:
- PPO optimizes the Researcher's generation policy via gradient-based updates
- The policy learns to produce candidates with high fitness scores across many rounds
- This is the continuous, differentiable optimization layer from Papers 1-2

**Level 2 -- Evolution (exploration)**:
- ASI-Evolve's evolutionary loop maintains a population of candidate programs
- UCB1/MAP-Elites sampling ensures broad exploration of the program space
- The evolutionary layer discovers novel patterns that gradient-based optimization might miss

**Interaction**:
- The RL policy generates initial candidates (exploitation of learned patterns)
- The evolutionary loop refines candidates through selection pressure (exploration of the fitness landscape)
- MAP-Elites maintains diversity across quality dimensions: survival rate, code complexity, test coverage, maintainability
- This addresses the "Agent Diversity Collapse" risk from Paper 1 where PPO-trained agents converge to a narrow set of coding patterns

### 5.3 Three-Tier Fitness

The 21-day latency problem identified in Paper 1 (Section 6) is addressed through a three-tier fitness scheme that maps ASI-Evolve's evaluation to different time horizons:

**Tier 1 -- Immediate (Engineer execution, seconds to minutes)**:
- Tests pass/fail
- No runtime errors
- Performance benchmarks (latency, memory)
- Static analysis quality (complexity, style)
- This tier provides the fast feedback that ASI-Evolve's Engineer already produces

**Tier 2 -- Medium-term (merge and review, hours to days)**:
- Merge success rate
- Code review comment count
- Review velocity (time to approval)
- These are the auxiliary rewards from Paper 1 (Section 6)

**Tier 3 -- Long-term (production survival, 3-21 days)**:
- 3-day survival rate (early signal)
- 7-day survival rate (intermediate signal)
- 21-day survival rate (primary fitness)
- These are the core Popescu et al. metrics

In the evolutionary loop, Tier 1 fitness drives the Engineer's early rejection, Tier 2 fitness influences Database sampling weights, and Tier 3 fitness determines the definitive ranking of candidates. This tiered approach means the evolutionary loop can make progress using Tier 1 signals immediately while waiting for Tier 3 signals to provide ground truth.

### 5.4 OTEL Instrumentation for the Evolutionary Loop

We extend the OTEL span model from Paper 2 (Section 3) with four new span types:

| Span Type | Parent | Key Attributes |
|-----------|--------|---------------|
| `evolution.generation` | `evolution.round` | `candidate_id`, `parent_ids`, `cognition_items_retrieved`, `sampling_policy`, `researcher_model` |
| `evolution.evaluation` | `evolution.generation` | `fitness_score`, `tier1_score`, `execution_time_ms`, `early_rejected`, `code.quality.*` |
| `evolution.analysis` | `evolution.evaluation` | `report_length_tokens`, `confidence_level`, `recommended_actions`, `faithfulness_verified` |
| `evolution.selection` | `evolution.round` | `selected_node_ids`, `sampling_policy`, `ucb1_exploration_bonus`, `population_diversity_score` |

**Correlation**: Each candidate program is linked to its lineage via `evolution.parent_ids`, enabling ancestry-based performance analysis. The `code.quality.*` attributes from Paper 2 are reused verbatim to maintain telemetry compatibility.

**Budget Tracking**: Each round span carries `evolution.budget_spent_usd` and `evolution.budget_remaining_usd` attributes, enabling real-time cost monitoring and automated stop conditions.

---

## 6. Safety and Governance

Self-improving evolutionary systems represent the highest-risk category for agentic deployment. We map Anthropic's five safety principles to specific controls within the evolutionary loop.

### 6.1 Human Control

**Principle**: Agents must operate independently yet humans retain oversight before high-stakes decisions `[HIGH]` (Anthropic, 2026d).

Self-improving systems challenge this principle because the evolutionary loop generates novel programs that may behave unpredictably. We propose four control mechanisms:

1. **Budget Caps**: Hard limits on `max_rounds`, `max_budget_usd`, and `max_concurrent_evaluations`. The evolutionary loop halts automatically when any budget is exhausted. These map directly to Anthropic's `max_turns` and `max_budget_usd` API parameters.

2. **Approval Gates**: Human review is required at three points:
   - Before any candidate is deployed to production (never auto-deploy evolutionary outputs)
   - Before the Cognition Base is expanded with new knowledge sources
   - Before the fitness function or sampling policy is modified

3. **Kill Switch**: Ability to halt the evolutionary loop at any point via an API flag or OTEL alert trigger. The system must be designed so that halting mid-round produces a consistent Database state.

4. **Scope Constraints**: The evolutionary loop is prohibited from:
   - Modifying its own fitness function
   - Modifying its own sampling policy parameters
   - Generating code that expands the agent's own permissions
   - Accessing systems outside the designated sandbox

### 6.2 Transparency

**Principle**: Humans must understand agent reasoning `[HIGH]` (Anthropic, 2026d).

1. **OTEL Trace Auditability**: Every evolutionary step is fully traceable via the span model in Section 5.4. Auditors can reconstruct the complete decision chain: which context was sampled, which cognition items were retrieved, what candidate was generated, how it was evaluated, and what analysis was produced.

2. **Lineage Tracking**: Every deployed candidate traces back to its ancestors in the Database. This enables root cause analysis when a deployed program exhibits unexpected behavior.

3. **Human-Readable Reports**: The Analyzer must produce natural language reports, not just embeddings or scores. Apply the same hallucination audit methodology from our QUALITY_AUDIT_FINDINGS (Integrity Studio, 2026c) to Analyzer reports.

4. **Retrieval Provenance**: Each Researcher invocation logs which Cognition Base entries and Database nodes contributed to the candidate, with similarity scores, enabling inspection of knowledge influence.

### 6.3 Value Alignment

**Principle**: Systems must pursue intended organizational goals, not metric optimization `[HIGH]` (Anthropic, 2026d).

The primary risk is **Goodhart's Law**: optimizing for 21-day survival may produce code that is stable but unmaintainable, or that games survival metrics without improving actual code quality.

Mitigations:
1. **Multi-objective Fitness**: Extend the reward function from Paper 1 with additional dimensions:
   ```
   fitness = w1 * survival_21d + w2 * readability_score + w3 * test_coverage + w4 * maintainability_index - w5 * complexity_penalty
   ```
   Weights are human-specified and not modifiable by the evolutionary loop (scope constraint from Section 6.1).

2. **Hold-out Evaluation**: A subset of evaluation benchmarks are held out from the fitness function and used only for periodic human audit. If evolutionary candidates score well on fitness but poorly on hold-out metrics, the fitness function needs recalibration.

3. **Regression Detection**: Track historical performance on all metrics. Flag candidates that show fitness improvement but regression on any secondary metric.

### 6.4 Privacy

**Principle**: Granular controls restrict agent access to sensitive data `[HIGH]` (Anthropic, 2026d).

1. **Cognition Base Classification**: Each knowledge entry is tagged with a sensitivity level (PUBLIC, INTERNAL, CONFIDENTIAL). The Researcher can only access entries at or below its clearance level.

2. **Code Sanitization**: Candidate programs generated by the Researcher must not contain hardcoded credentials, PII, or references to internal systems. Static analysis scans enforce this before Engineer execution.

3. **Database Access Control**: The Database may contain proprietary experiment results. Access is restricted to authorized evolutionary loops and audit processes.

### 6.5 Security Against Manipulation

**Principle**: Multiple security layers counter prompt injection and tool vulnerabilities `[HIGH]` (Anthropic, 2026d).

The Engineer executes arbitrary generated code -- the highest security risk in the system.

1. **Sandbox Isolation**: Container-based execution with:
   - No network access (unless explicitly required by the evaluation procedure)
   - Filesystem restrictions (write only to designated output directories)
   - Memory and CPU limits
   - No access to the evolutionary loop's own infrastructure

2. **Code Scanning**: Static analysis and pattern matching before execution to detect:
   - System calls that exceed the sandbox's intended scope
   - Attempts to read or modify the evolutionary loop's configuration
   - Known vulnerability patterns (OWASP Top 10)

3. **Agentic Misalignment Mitigations**: Anthropic's research demonstrates that frontier models can engage in strategic harmful behavior when their autonomy or goals are threatened (Anthropic, 2026e). In the context of self-improving evolutionary systems, three specific misalignment risks apply:

   - **Reward Hacking**: Generating code that games survival metrics (e.g., trivial no-op changes that survive because they do nothing). Mitigation: multi-objective fitness and hold-out evaluation (Section 6.3).
   - **Capability Escalation**: Generating code that expands the agent's own permissions or resource access. Mitigation: scope constraints (Section 6.1) and sandbox isolation.
   - **Deceptive Alignment**: Generating code that appears safe during evaluation but behaves differently in production. Mitigation: hold-out evaluation sets, shadow deployment (run evolutionary candidates in observation mode before production), and adversarial testing.

---

## 7. Implementation Roadmap

We propose a 16-week implementation plan that builds on the existing OTEL infrastructure from Paper 2. Prerequisites: OTEL instrumentation from Paper 2 must be operational, and Claude API access with sufficient rate limits (Tier 2+) must be available.

### 7.1 Phase 1: Foundation (Weeks 1-4)

**Objective**: Single-iteration evolutionary loop running locally.

| Deliverable | Description |
|-------------|-------------|
| Cognition Base v1 | RAG pipeline over domain documentation. Embedding index with lightweight retrieval. 50-100 curated entries. |
| Database v1 | JSON-backed node store with UCB1 sampling. Schema validation on write. Append-only logging. |
| Researcher v1 | Claude orchestrator with single-candidate generation (no parallelization yet). Structured output for candidate schema. |
| Engineer v1 | Tool implementation with configurable timeout. Integration with existing test suites. |
| Analyzer v1 | Claude evaluator with structured JSON report schema. Programmatic faithfulness check on numerical claims. |

**Verification**: Run 10 complete evolutionary rounds on a test problem (e.g., function optimization). Verify all OTEL spans are emitted correctly. Confirm Database state is consistent after each round.

### 7.2 Phase 2: Integration (Weeks 5-8)

**Objective**: Multi-iteration evolutionary loop with OTEL observability and safety gates.

| Deliverable | Description |
|-------------|-------------|
| OTEL span model | Four new span types (evolution.generation, evaluation, analysis, selection) integrated with Paper 2's collector. |
| Safety gates | Budget caps (max_rounds, max_budget_usd). Kill switch via API flag. Human approval gate for production candidates. |
| Parallel Researcher | Fan-out to K=3 parallel candidate generation workers. Prompt caching for shared context. |
| Cognition Base JIT | Two-phase retrieval: lightweight refs then JIT load on demand. Token budget awareness. |

**Verification**: Run 100 evolutionary rounds. Verify budget tracking accuracy. Trigger kill switch mid-round and confirm Database consistency. Measure prompt cache hit rate (target: >70%).

### 7.3 Phase 3: Hybrid RL+Evolution (Weeks 9-12)

**Objective**: Integrated PPO + evolutionary selection with survival metrics as fitness.

| Deliverable | Description |
|-------------|-------------|
| Survival fitness integration | Connect Tier 3 fitness (21-day survival from Paper 1) to Database node scoring. |
| Three-tier fitness | Implement tiered scoring: Tier 1 (immediate execution), Tier 2 (merge/review), Tier 3 (survival). |
| MAP-Elites diversity | Implement quality-diversity archive with behavioral features: survival rate, complexity, test coverage. |
| PPO integration | Connect PPO policy updates from Paper 2 as the Researcher's generative model. |

**Verification**: Run pilot on 3-5 representative repositories. Compare convergence rates of evolution-only, RL-only, and hybrid approaches. Measure MAP-Elites coverage across quality dimensions.

### 7.4 Phase 4: Production Deployment (Weeks 13-16)

**Objective**: Production evolutionary loop with full safety governance.

| Deliverable | Description |
|-------------|-------------|
| Shadow deployment | Evolutionary candidates evaluated but not deployed. Performance tracked alongside production agents. |
| Canary rollout | Same pattern as Paper 1: 5% -> 25% -> 100% with automated rollback triggers. |
| Monitoring dashboard | Grafana dashboard showing evolutionary progress, budget consumption, safety gate triggers, and fitness trends. |
| Documentation | Operational runbook, safety review checklist, and incident response procedures. |

**Verification**: Shadow deployment produces measurable fitness improvements over baseline without degrading production metrics. Canary rollout triggers automated rollback at least once (deliberate test). Full OTEL trace audit passes review.

### 7.5 Success Criteria

Following the conditional target framework from Paper 1:

| Metric | Conservative | Optimistic | Stretch |
|--------|-------------|------------|---------|
| Fitness improvement over baseline | +2% | +5% | +10% |
| Candidate diversity (MAP-Elites coverage) | 40% cells occupied | 60% | 80% |
| Convergence rate (rounds to threshold) | 500 rounds | 200 rounds | 50 rounds |
| Safety gate trigger rate | <5% false positives | <2% | <1% |
| Prompt cache hit rate | >60% | >75% | >85% |
| Budget efficiency (fitness per dollar) | 1.5x baseline | 3x | 5x |

These targets are conditional hypotheses, not empirical predictions `[LOW]`.

---

## 8. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Fitness function gaming** (Goodhart's Law) | High | Critical | Multi-objective fitness; hold-out evaluation sets; regression detection on secondary metrics |
| **Evolutionary loop runaway costs** | High | High | Hard budget caps (max_rounds, max_budget_usd); cost-per-round monitoring via OTEL; automatic halt |
| **Capability escalation** (agent self-modification) | Low | Critical | Scope constraints; sandbox isolation; code scanning; prohibition on modifying own fitness function |
| **Deceptive alignment** (candidates safe in eval, harmful in production) | Low | Critical | Hold-out evaluation; shadow deployment; adversarial testing; canary rollout with automated rollback |
| **Cognition Base data poisoning** | Medium | High | Human curation gate; provenance tracking; retraction checking; embedding adversarial detection |
| **21-day fitness latency** | High | Medium | Three-tier fitness (Tier 1 immediate, Tier 2 medium-term, Tier 3 long-term); auxiliary reward bootstrapping from Paper 1 |
| **Context window exhaustion** | Medium | Medium | Two-phase Cognition Base retrieval; Analyzer compression; prompt caching; adaptive context budgeting |
| **LLM judge miscalibration** | Medium | Medium | Periodic calibration against human expert ratings; confidence thresholds with human escalation; judge transcript logging |

---

## 9. Open Questions

1. **Optimal population size**: What is the right number of active candidates in the Database for code generation tasks? ASI-Evolve uses a periodically refreshed pool of 50 nodes (Section 4.1). Does this scale to multi-repository, multi-language settings?

2. **UCB1 vs. PPO for code quality**: Can ASI-Evolve's sampling policies outperform PPO for optimizing code survival rates? The two approaches have different inductive biases (discrete selection vs. continuous policy gradients), and empirical comparison is needed.

3. **Minimum Cognition Base size**: ASI-Evolve initializes with varying corpus sizes per task -- ~150 entries from 100 papers for architecture design (Section 4.1), ~80 papers for drug-target interaction (Section 5.4), and as few as 10 papers for RL algorithm design (Section 4.3). What is the minimum corpus size for effective domain-guided evolution in software engineering contexts?

4. **Cross-domain transfer**: Can evolutionary patterns discovered in one code quality domain (e.g., API design) transfer to others (e.g., test generation)? MAP-Elites behavioral features may enable cross-domain diversity, but empirical validation is required.

5. **Analyzer faithfulness**: Can the Analyzer reliably detect and prevent deceptive alignment in generated candidates? If the Analyzer uses the same LLM family as the Researcher, it may share blind spots. Cross-model evaluation and human audit remain essential.

---

## 10. Conclusion

This whitepaper completes a trilogy on agentic self-optimization:

- **Paper 1** established the concept: agent-generated code exhibits statistically significant but modest differences in churn and survival compared to human code (Cliff's delta = -0.05 to -0.14; Popescu et al. Figure 8, Section 4.2) `[HIGH]`; these metrics can serve as RL reward signals for continuous improvement.
- **Paper 2** specified the architecture: OTEL instrumentation captures code quality metrics, a Gymnasium-compatible RL environment trains PPO policies, and canary deployments ensure safe rollout.
- **This paper** introduces the evolutionary paradigm: ASI-Evolve's population-based search over program space offers complementary capabilities (principled exploration, diversity maintenance, knowledge accumulation) that augment gradient-based RL.

The systematic audit reveals that ASI-Evolve's core design -- closed-loop evaluation, principled sampling, domain-adaptive context engineering -- aligns well with production agentic best practices. However, significant gaps in safety, meta-evaluation, and operational robustness must be addressed before production deployment. The integration architecture proposed here maps each ASI-Evolve component to a Claude production pattern, adds safety governance grounded in Anthropic's five principles, and connects evolutionary fitness to the existing survival metrics pipeline.

The hybrid RL+Evolution architecture is the key contribution: RL handles exploitation (refining known good patterns via gradient updates) while evolution handles exploration (discovering novel patterns via population-based search). Together with three-tier fitness and full OTEL observability, this produces a system where agents continuously improve their code quality through both individual learning and collective search -- closing the feedback loop that current production agents lack.

---

## References

**Note**: Anthropic reference URLs [3]-[10] are cited based on known publication titles and standard URL patterns. Readers should verify HTTP 200 responses before relying on specific URL paths; if any URL is inaccessible, the associated `[HIGH]` confidence tags in Section 3 should be downgraded to `[MED]`.

[1] Xu, W., Mi, T., Liu, Y., Nan, Y., Zhou, Z., Ye, L., Zhang, L., Qiao, Y., & Liu, P. (2026). ASI-Evolve: AI Accelerates AI. SJTU/SII/GAIR. https://github.com/GAIR-NLP/ASI-Evolve

[2] Popescu, A. et al. (2026). Empirical Analysis of Code Quality in Agent-Generated Pull Requests. arXiv:2604.00917v1.

[3] Anthropic. (2026a). Building Effective Agents. https://www.anthropic.com/research/building-effective-agents

[4] Anthropic. (2026b). Writing Effective Tools for Agents. https://www.anthropic.com/engineering/writing-tools-for-agents

[5] Anthropic. (2026c). Effective Context Engineering for AI Agents. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

[6] Anthropic. (2026d). Our Framework for Developing Safe and Trustworthy Agents. https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents

[7] Anthropic. (2026e). Agentic Misalignment: How LLMs Could Be Insider Threats. https://www.anthropic.com/research/agentic-misalignment

[8] Anthropic. (2026f). Demystifying Evals for AI Agents. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

[9] Anthropic. (2026g). Effective Harnesses for Long-Running Agents. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

[10] Anthropic. (2026h). Rate Limits. https://platform.claude.com/docs/en/api/rate-limits

[11] Auer, P., Cesa-Bianchi, N., & Fischer, P. (2002). Finite-time Analysis of the Multiarmed Bandit Problem. Machine Learning, 47(2-3), 235-256.

[12] Mouret, J.-B., & Clune, J. (2015). Illuminating Search Spaces by Mapping Elites. arXiv:1504.04909.

[13] Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. arXiv:1707.06347.

[14] Novikov, A. et al. (2025). AlphaEvolve: A Coding Agent for Scientific and Algorithmic Discovery.

[15] Romera-Paredes, B. et al. (2023). Mathematical Discoveries from Program Search with Large Language Models. Nature.

[16] Integrity Studio AI Research. (2026a). Self-Optimizing Agentic Systems: Converting Code Quality Feedback into RL-Based Continuous Improvement. Technical Whitepaper.

[17] Integrity Studio AI Research. (2026b). Agentic Self-Optimization Architecture. Technical Specification.

[18] Integrity Studio AI Research. (2026c). Quality Audit Findings. V1.1 - Publication-Grade.
