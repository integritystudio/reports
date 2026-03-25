# Neural Networks Learning Roadmap: Curated Resource Guide
### For a Mildly Technical New Hire with Teaching Background at an AI-Native OTEL/LLM Startup

---

## How to Use This Guide

**For new hires with a teaching background**, this guide is organized into 5 phases spanning your first month + Month 2. Choose your path:

- **Fast track (strong Python):** Start Phase 2 Week 1. Complete Phases 1-4 in 2 weeks. Phase 5 is ongoing depth.
- **Standard track (some Python):** Follow Day 1 → Week 1-3 sequence. Allow 3-4 weeks for solid fundamentals.
- **Careful track (no recent coding):** Spend 2-3 days on Python refresher before Week 1. Use Phase 2 resources in slower cadence.

**For role-specific paths:**
- **Observability/Monitoring role:** Prioritize Phase 3 (OTEL) after Phase 1-2 foundations.
- **LLM Safety/Reliability role:** Prioritize Phase 4 (Explainability & Hallucinations) after Phase 1-2 foundations.
- **General engineering onboarding:** Follow the recommended sequence linearly.

**Self-Assessment:** Before starting Phase 2, check: Can you write a Python function that trains a simple model and prints its loss? If yes, proceed. If no, review [Python basics](https://docs.python.org/3/tutorial/index.html) for 4-6 hours first.

---

## Executive Summary

1. The best entry point for a pedagogy-minded new hire is the combination of 3Blue1Brown's visual series (intuition-first) plus Jay Alammar's illustrated guides (architecture-specific) — together they cover fundamentals without requiring math prerequisites.
2. Karpathy's "Zero to Hero" is the single most recommended resource for building real depth, but requires coding commitment and is best treated as a Week 1-2 project, not a Day 1 skim.
3. The OTEL ecosystem has produced strong, practical LLM observability content in 2024 — the OpenTelemetry blog and Grafana's guide are directly aligned to this team's stack.
4. LLM explainability is a fast-moving area; Lilian Weng's blog (Lil'Log) is the most reliable single source for research-grounded, readable deep dives on hallucination and interpretability.
5. Fast.ai is the strongest option for Month 2 depth — its "top-down" teaching philosophy maps well to someone with an educator background.

---

## Phase 1: Quick Start (Day 1 Reading)

### Resource 1
**Title:** But What Is a Neural Network? (Chapter 1, Deep Learning)
**Link:** [https://www.3blue1brown.com/topics/neural-networks](https://www.3blue1brown.com/topics/neural-networks)
**Source:** YouTube Video Series (3Blue1Brown)
**Time:** 19 minutes (Chapter 1 only)
**Key Takeaway:** Uses animated diagrams to show how a network learns to recognize handwritten digits — no equations required.
**Relevance to OTEL:** Establishes the "what is happening inside" intuition that makes the black-box problem and observability need immediately concrete.
**Best For:** New hires, Educators, non-technical stakeholders
**Difficulty:** Beginner

**Pros:**
- Grant Sanderson (3Blue1Brown) is exceptional at building visual intuition before introducing math
- Animations make gradient descent and weight updates physically intuitive
- Widely cited as the single best starting point across ML communities
- Covers a complete use case (digit recognition) so it does not feel abstract
- Free, no account required, captioned

**Cons:**
- Video-only, no hands-on code at this stage
- Chapter 1 alone leaves gaps on backpropagation specifics (later chapters fill this)
- Does not address failure modes, deployment, or OTEL at all
- 2017 vintage — transformer-specific content is in a separate, newer series

---

### Resource 2
**Title:** A Visual and Interactive Guide to the Basics of Neural Networks
**Link:** [https://jalammar.github.io/visual-interactive-guide-basics-neural-networks/](https://jalammar.github.io/visual-interactive-guide-basics-neural-networks/)
**Source:** Blog (Jay Alammar)
**Time:** 20-30 minutes
**Key Takeaway:** Walks from single-weight prediction to multi-variable classification using interactive sliders, making loss and gradient descent hands-on within a browser.
**Relevance to OTEL:** The loss metric visualization directly parallels what gets tracked as a training metric in production observability dashboards.
**Best For:** New hires, Educators
**Difficulty:** Beginner

**Pros:**
- Interactive sliders let readers adjust weights and see error change in real time — a uniquely pedagogical feature
- House-pricing analogy is genuinely accessible
- Progresses from regression to classification without a prerequisite jump
- No code environment needed; runs in browser
- Written explicitly for people without ML experience

**Cons:**
- Does not cover hidden layers — the most important feature of deep networks
- Gradient descent explanation is shallow; described but not mechanistically explained
- No code examples, no PyTorch/TF context
- Does not address overfitting, validation, or real-world caveats

**Phase 1 Comparison Note:** These two resources are highly complementary rather than competitive. 3Blue1Brown builds visual-spatial intuition; Alammar provides interactive experimentation. Together they provide a strong conceptual foundation in under an hour. Neither requires any coding. Neither covers failure modes or observability — those are Phase 2 concerns.

---

## Phase 2: Core Concepts (Week 1)

### Resource 3
**Title:** Neural Networks: Zero to Hero
**Link:** [https://karpathy.ai/zero-to-hero.html](https://karpathy.ai/zero-to-hero.html)
**Source:** Video Course + Code (Andrej Karpathy / YouTube)
**Time:** 8-10 hours total; first two lectures are ~3 hours
**Key Takeaway:** Builds backpropagation by hand in 100 lines of Python before introducing PyTorch — the clearest explanation of what training actually does, at the level of code.
**Relevance to OTEL:** Building the engine manually makes it clear exactly what values (loss, gradient norms, activation distributions) are worth instrumenting during training.
**Best For:** Engineers, Data Scientists, New hires with Python comfort
**Difficulty:** Beginner-to-Intermediate

**Pros:**
- Karpathy is a master explainer — the only resource that builds a full autograd engine from scratch in a way beginners can follow
- Shows exactly why loss, gradient magnitude, and weight distributions matter — directly applicable to what OTEL metrics teams want to track
- Leads to building a GPT from scratch, making transformers less mysterious
- Active GitHub community with supplementary notes
- Frequently updated; covers topics current through 2024

**Cons:**
- Requires solid Python comfort and some calculus recall (even if rusty)
- Time commitment is significant — not a skim resource
- Does not cover deployment, monitoring, or observability tooling
- No explicit OTEL connection; the learner must bridge that gap themselves
- Can feel slow if the learner has prior ML exposure

---

### Resource 4
**Title:** What is Overfitting in Deep Learning (+ 10 Ways to Avoid It)
**Link:** [https://www.v7labs.com/blog/overfitting](https://www.v7labs.com/blog/overfitting)
**Source:** Blog (V7 Labs)
**Time:** 25 minutes
**Key Takeaway:** Practical catalog of how neural networks fail to generalize, with clear diagrams comparing training vs. validation loss curves.
**Relevance to OTEL:** The train/validation loss divergence chart is exactly the anomaly pattern that would trigger a monitoring alert in production — this resource builds the mental model for interpreting those signals.
**Best For:** New hires, Data Scientists
**Difficulty:** Beginner

**Pros:**
- Directly addresses a gap left by introductory visual resources
- Train vs. validation loss plots are the exact charts tracked in ML observability dashboards
- Covers early stopping, dropout, regularization — practical tools, not just theory
- Diagrams are clean and labeled

**Cons:**
- V7 Labs is a product company; some sections subtly promote their platform
- Does not discuss when not to use neural networks at all
- Overfitting framing is mostly about image/vision models; text/LLM context is less prominent

---

### Resource 5
**Title:** Are Deep Neural Networks Dramatically Overfitted? (Lil'Log)
**Link:** [https://lilianweng.github.io/posts/2019-03-14-overfit/](https://lilianweng.github.io/posts/2019-03-14-overfit/)
**Source:** Blog (Lilian Weng / OpenAI)
**Time:** 35 minutes
**Key Takeaway:** Explains the double descent phenomenon — why modern large models can be over-parameterized yet still generalize — with research-grounded nuance.
**Relevance to OTEL:** Directly relevant to monitoring: the post explains why naive loss-curve interpretation can be misleading for large models, which matters when setting alerting thresholds.
**Best For:** Engineers, Data Scientists
**Difficulty:** Intermediate

**Pros:**
- Adds important nuance that beginner resources omit (double descent, bias-variance)
- Author is a senior OpenAI researcher; technically authoritative
- Bridges from intuition to research-level understanding without becoming inaccessible
- Helps calibrate when to worry about a rising training loss

**Cons:**
- 2019 vintage — predates modern LLM-scale training behavior
- More research-survey style than tutorial; no hands-on code
- Requires comfort with basic statistical concepts

**Phase 2 Comparison Note:** Karpathy (Resource 3) is the most important single resource in this phase — nothing else builds the same depth of understanding of what is actually happening during training. Resources 4 and 5 are best read together: V7 Labs for the practical how-to, Lil'Log for the conceptual nuance. Resource 5 is optional for Day 1 readers but becomes important once monitoring thresholds need to be discussed.

---

## Bridge: From Training Concepts to OTEL Metrics (Phase 2 → 3)

After Phase 2, you understand *what is happening* during training. Phase 3 teaches you how to *measure it*. Here's the explicit mapping:

### What You Learned in Phase 2 → What You Measure in Phase 3

| Phase 2 Concept | Phase 3 OTEL Signal | Why It Matters |
|---|---|---|
| **Loss function** (how wrong predictions are) | Metrics: training_loss, validation_loss | Primary signal of model health; divergence = overfitting alert |
| **Gradient magnitude** (how much weights change) | Metrics: gradient_norm, loss_spike_rate | Large gradients = instability; small = stalled learning |
| **Activation distributions** (how neurons respond) | Metrics: mean_activation_per_layer, dead_neuron_ratio | Dead neurons = wasted capacity; large variance = unstable |
| **Learning rate** (controls training speed) | Metrics: learning_rate_step, effective_lr | Too high = divergence; too low = slow convergence |
| **Overfitting signal** (train/val divergence) | Trace + Metric: validation_loss exceeds training_loss + threshold | Triggers alert for regularization/early stopping |

### Concrete Example: Instrumenting Training

When you run Karpathy's code and see "loss = 2.314", that number should be:
1. **Logged** as a scalar metric (Karpathy teaches you to print it; OTEL teaches you to emit it)
2. **Timestamped** so you can plot it over training steps
3. **Aggregated** to compute rolling averages
4. **Alerted on** if it suddenly spikes or plateaus

Phase 3 Resources 6-7 show you HOW (semantic conventions, export format). Resources 8 shows you WHEN to alert (drift thresholds).

### Before Moving to Phase 3, Ask Yourself:
- Can you identify which of Karpathy's printed numbers would become OTEL metrics?
- Could you explain to a colleague why loss divergence (validation > training) is actionable information?
- Do you know what "early stopping" means and why it requires monitoring?

If yes, you're ready for Phase 3. If no, spend an extra 30 minutes re-reading Karpathy Resource 3's loss curve section.

---

## Phase 3: OTEL and Observability (Week 2)

### Resource 6
**Title:** An Introduction to Observability for LLM-Based Applications Using OpenTelemetry
**Link:** [https://opentelemetry.io/blog/2024/llm-observability/](https://opentelemetry.io/blog/2024/llm-observability/)
**Source:** Blog (OpenTelemetry.io / Grafana, June 2024)
**Time:** 30 minutes
**Key Takeaway:** Step-by-step setup of OTEL-based LLM monitoring covering token counts, latency, cost, and rate limits using OpenLIT, Prometheus, and Grafana.
**Relevance to OTEL:** This is the canonical reference — written by the OpenTelemetry project itself, directly applicable to the team's stack.
**Best For:** Engineers, New hires joining OTEL-focused teams
**Difficulty:** Intermediate

**Pros:**
- Written by the OTEL project — authoritative and vendor-neutral
- Covers all three signal types: traces, metrics, events
- Three-line Python integration example is immediately usable
- Addresses cost monitoring and rate limits — startup-relevant concerns
- 2024 publication ensures it reflects current semantic conventions

**Cons:**
- Assumes familiarity with Prometheus and Grafana concepts
- Does not explain the neural network internals being observed — purely the instrumentation layer
- No discussion of model drift or training-time monitoring; focused on inference

---

### Resource 7
**Title:** OpenTelemetry for Generative AI
**Link:** [https://opentelemetry.io/blog/2024/otel-generative-ai/](https://opentelemetry.io/blog/2024/otel-generative-ai/)
**Source:** Blog (OpenTelemetry.io / Microsoft, December 2024)
**Time:** 20 minutes
**Key Takeaway:** Introduces the semantic conventions standard for GenAI observability in OTEL, with a working Python example for OpenAI API tracing.
**Relevance to OTEL:** Directly defines the evolving standard the team would implement — semantic conventions for LLM traces, metrics, and events.
**Best For:** Engineers, New hires on OTEL-native teams
**Difficulty:** Beginner-to-Intermediate

**Pros:**
- Defines the actual standard being adopted by the industry in 2024-2025
- Working Docker + Python example lowers the barrier to trying it locally
- Visual Jaeger trace screenshots make abstract tracing concrete
- Covers multi-platform (OpenAI, Azure) vendor attribute conventions

**Cons:**
- Very focused on instrumentation plumbing, not model behavior analysis
- The standard is still evolving — some conventions are marked experimental
- Does not address training monitoring, only inference observability

---

### Resource 8
**Title:** How to Detect Model Drift in MLOps Monitoring
**Link:** [https://towardsdatascience.com/how-to-detect-model-drift-in-mlops-monitoring-7a039c22eaf9/](https://towardsdatascience.com/how-to-detect-model-drift-in-mlops-monitoring-7a039c22eaf9/)
**Source:** Blog (Towards Data Science)
**Time:** 25 minutes
**Key Takeaway:** Explains data drift, concept drift, and model performance drift with statistical tests (KL divergence, PSI) and practical detection strategies.
**Relevance to OTEL:** Identifies the specific signals and statistical thresholds worth building OTEL alerts around in production deployments.
**Best For:** Engineers, Data Scientists
**Difficulty:** Intermediate

**Pros:**
- Practical framing — covers both what to measure and what to do when drift is detected
- Statistical tests are explained without requiring a statistics background
- Addresses both data drift and concept drift as distinct problems
- Relevant to LLM observability where input distribution shifts matter

**Cons:**
- Written for traditional ML pipelines, not LLM-specific workflows
- Does not integrate OTEL tooling — focuses on monitoring strategy, not implementation
- Some statistical concepts (KL divergence) are introduced without sufficient intuition-building

**Phase 3 Comparison Note:** Resources 6 and 7 are both from opentelemetry.io and are complementary — Resource 6 is the practical walkthrough, Resource 7 is the standards reference. Read both. Resource 8 stands apart because it covers drift — which neither OTEL resource addresses. The gap in this phase is a single resource that bridges neural network behavior, drift detection, AND OTEL instrumentation together; that synthesis currently does not exist as a single beginner-friendly article and would be useful to write internally.

---

## Phase 4: LLM and Explainability (Week 3)

### Resource 9
**Title:** The Illustrated Transformer
**Link:** [https://jalammar.github.io/illustrated-transformer/](https://jalammar.github.io/illustrated-transformer/)
**Source:** Blog (Jay Alammar)
**Time:** 45-60 minutes
**Key Takeaway:** Walks through the full transformer architecture — encoder, decoder, multi-head attention, positional encoding — using diagrams for every step.
**Relevance to OTEL:** Understanding what attention weights represent is a prerequisite for understanding attention-based explainability tools (BertViz, attention attribution), which are key to LLM interpretability observability.
**Best For:** Engineers, New hires, Data Scientists
**Difficulty:** Beginner-to-Intermediate

**Pros:**
- Widely regarded as the definitive visual introduction to transformers
- Progressive complexity: starts with black-box view, drills to matrix math only when ready
- Used in university courses globally as assigned reading
- Naturally transitions to explainability because it demystifies what attention "sees"
- Directly applicable to understanding what LLM observability dashboards are measuring

**Cons:**
- Does not cover why transformers hallucinate or fail
- Q/K/V matrix math can still feel dense without linear algebra background
- No code examples or runnable notebooks in the main article
- Does not cover modern LLM-specific modifications (grouped query attention, RoPE, etc.)

---

### Resource 10
**Title:** Extrinsic Hallucinations in LLMs
**Link:** [https://lilianweng.github.io/posts/2024-07-07-hallucination/](https://lilianweng.github.io/posts/2024-07-07-hallucination/)
**Source:** Blog (Lilian Weng / OpenAI, July 2024)
**Time:** 40-50 minutes
**Key Takeaway:** Research-grounded explanation of why LLMs hallucinate with specific focus on detection methods (FActScore, SelfCheckGPT, SAFE) and mitigation strategies (RAG, chain-of-verification).
**Relevance to OTEL:** Hallucination detection frameworks described here (consistency checking across samples, uncertainty estimation) are precisely the kinds of signals worth building into LLM observability pipelines.
**Best For:** Engineers, Data Scientists, Technical leads
**Difficulty:** Intermediate

**Pros:**
- Written by an OpenAI researcher in July 2024 — current and authoritative
- Covers both root causes and practical detection/mitigation
- Detection methods described (SelfCheckGPT, SAFE) are directly implementable
- Calibration framing bridges from "why it happens" to "how to measure it"
- More accessible than an arXiv paper while being more rigorous than a blog post

**Cons:**
- Not a true beginner resource — benefits significantly from prior transformer knowledge
- Dense citation structure; can feel like a literature survey at times
- Does not provide code examples for the detection methods
- Some detection methods (influence functions) are computationally impractical for small teams

---

### Resource 11
**Title:** Explainability and Interpretability in Modern LLMs
**Link:** [https://www.rohan-paul.com/p/explainability-and-interpretability](https://www.rohan-paul.com/p/explainability-and-interpretability)
**Source:** Blog (Substack, 2024)
**Time:** 30 minutes
**Key Takeaway:** Catalog of LLM interpretability techniques — saliency maps, SHAP, LIME, attention visualization — with tool recommendations (Captum, BertViz) and Python code examples.
**Relevance to OTEL:** Directly maps to the explainability layer of LLM observability; these tools generate the artifacts that make model behavior interpretable in dashboards.
**Best For:** Engineers, Data Scientists
**Difficulty:** Intermediate

**Pros:**
- Covers both feature-attribution (SHAP, LIME) and attention-based (BertViz) approaches
- Includes Python code snippets using Captum and HuggingFace
- 2024 content — reflects current tooling ecosystem
- Practical tool recommendations rather than pure theory
- Explicitly distinguishes interpretability (model mechanics) from explainability (external tools)

**Cons:**
- Code examples are illustrative rather than runnable end-to-end
- Does not connect these tools to OTEL instrumentation
- SHAP/LIME introductions are brief; deeper understanding requires follow-up reading
- Substack format can be inconsistent in depth

**Phase 4 Comparison Note:** Resources 9, 10, and 11 form a deliberate sequence: Illustrated Transformer (how it works) -> Hallucinations (how it fails) -> Explainability (how to see inside it). This sequence directly mirrors the startup's product concerns. Resource 10 is the highest-value single article in this phase because hallucination is both a common end-user concern and a measurement problem. Resource 11 is where the explainability-to-OTEL bridge becomes most concrete.

---

## Phase 5: Advanced Context (Month 2)

### Resource 12
**Title:** Practical Deep Learning for Coders
**Link:** [https://course.fast.ai/](https://course.fast.ai/)
**Source:** Course (fast.ai, Jeremy Howard)
**Time:** 20-30 hours total; modular by lesson
**Key Takeaway:** Top-down course that starts with working models before explaining the math — a rare pedagogical inversion that aligns with how experienced educators learn best.
**Relevance to OTEL:** Production deployment chapters cover inference latency, model optimization, and serving considerations directly relevant to cost and reliability monitoring.
**Best For:** Educators, Engineers, Data Scientists
**Difficulty:** Beginner-to-Intermediate

**Pros:**
- Top-down methodology is pedagogically well-matched to someone with a teaching background
- Notebook-first approach on Kaggle/Colab; no local setup barrier
- Covers production deployment, not just model training
- Free, actively maintained, large community
- Explicitly designed to require only basic Python, no deep math

**Cons:**
- Course uses fastai library, not pure PyTorch — adds an abstraction layer that can obscure what is happening
- OTEL/observability is not covered at all
- LLM-specific content is in Part 2, which is significantly more advanced
- Time commitment is large for a busy first-month hire

---

### Resource 13
**Title:** Fine-Tuning LLMs: LoRA, Quantization, and Distillation Simplified
**Link:** [https://dev.to/iamfaham/fine-tuning-llms-lora-quantization-and-distillation-simplified-12nf](https://dev.to/iamfaham/fine-tuning-llms-lora-quantization-and-distillation-simplified-12nf)
**Source:** Blog (DEV Community, 2024)
**Time:** 20 minutes
**Key Takeaway:** Plain-language explanation of how LoRA reduces fine-tuning memory requirements by 75%, making it relevant for teams considering model customization on limited compute.
**Relevance to OTEL:** Understanding quantization trade-offs (latency vs. quality vs. cost) is directly actionable when defining SLOs and alerting thresholds for LLM inference observability.
**Best For:** Engineers, New hires
**Difficulty:** Beginner-to-Intermediate

**Pros:**
- Explains the memory math concretely (7B parameters, ~14GB vs. ~3.5GB with 4-bit quantization)
- Covers the three techniques most relevant to small startup teams
- Free, accessible without advanced ML background
- 2024 content — tool recommendations are current

**Cons:**
- Introductory only; skips implementation details
- Does not cover failure modes of quantized models (quality degradation patterns)
- No OTEL/monitoring connection made explicitly

---

### Resource 14
**Title:** AI Agent Observability - Evolving Standards and Best Practices
**Link:** [https://opentelemetry.io/blog/2025/ai-agent-observability/](https://opentelemetry.io/blog/2025/ai-agent-observability/)
**Source:** Blog (OpenTelemetry.io, 2025)
**Time:** 20 minutes
**Key Takeaway:** Describes emerging OTEL standards for observing autonomous AI agent workflows — the next frontier beyond single-model LLM monitoring.
**Relevance to OTEL:** Directly on-mission for a startup tracking OTEL-based measurement of LLM systems; represents where the ecosystem is heading.
**Best For:** Engineers, Technical leads
**Difficulty:** Intermediate-to-Advanced

**Pros:**
- 2025 publication — most current resource in this list
- Written by the OTEL project; will become the standard
- Addresses the multi-step, multi-model observability problem that single-model guides miss

**Cons:**
- Standards are still evolving; implementation details may change
- Requires prior OTEL familiarity to get full value
- No code examples or tutorials yet

---

## Cross-Phase Resource Comparison Matrix

| Resource | Phase | Time | Difficulty | OTEL Relevance | Code Examples | Beginner Safe |
|---|---|---|---|---|---|---|
| 3Blue1Brown Neural Networks | 1 | 19 min | Beginner | Low (indirect) | No | Yes |
| Jay Alammar Visual NN Guide | 1 | 25 min | Beginner | Low (indirect) | No | Yes |
| Karpathy Zero to Hero | 2 | 8-10 hrs | Beginner/Int | Medium | Yes (Python) | With Python skills |
| V7 Labs Overfitting Guide | 2 | 25 min | Beginner | Medium | No | Yes |
| Lil'Log Overfitting Post | 2 | 35 min | Intermediate | Medium | No | Partially |
| OTEL LLM Observability Intro | 3 | 30 min | Intermediate | High (direct) | Yes (Python) | With OTEL basics |
| OTEL GenAI Semantic Conventions | 3 | 20 min | Int | High (direct) | Yes (Python) | With OTEL basics |
| TDS Model Drift Detection | 3 | 25 min | Intermediate | High | No | Partially |
| Illustrated Transformer | 4 | 50 min | Beginner/Int | Medium | No | Yes |
| Lil'Log Hallucinations | 4 | 45 min | Intermediate | High | No | With NN background |
| Rohan Paul Explainability | 4 | 30 min | Intermediate | High | Yes (Python) | With NN background |
| fast.ai Practical DL | 5 | 20-30 hrs | Beginner/Int | Low | Yes (fastai) | Yes |
| LoRA/Quantization Guide | 5 | 20 min | Beginner/Int | Medium | No | Yes |
| OTEL AI Agent Observability | 5 | 20 min | Int/Adv | High (direct) | No | No |

---

## Identified Gaps and Open Questions

- No single resource bridges neural network training behavior directly to OTEL instrumentation in one article. This is a genuine content gap the team could fill with internal documentation.
- LLM-specific training observability (monitoring fine-tuning runs, not just inference) is underrepresented in public content. The Neptune.ai guides ([monitoring guide](https://neptune.ai/blog/monitoring-machine-learning-experiments-guide), [performance metrics guide](https://neptune.ai/blog/performance-metrics-in-machine-learning-complete-guide)) partially fill this but are not OTEL-native.
- "When not to use neural networks" lacks a strong, accessible, free resource — the best candidate (Medium / Ygor Serpa) is paywalled. This decision-framework gap is worth noting in onboarding materials.
- The OTEL semantic conventions for GenAI are still stabilizing in 2025 — resources in Phase 3-5 should be re-evaluated in 6 months.

---

## Recommended Reading Sequence (Condensed)

**Day 1 (1 hour):** 3Blue1Brown Chapter 1 + Jay Alammar Visual Guide
**Week 1 (5-8 hours):** Karpathy Zero to Hero Lectures 1-2 + V7 Labs Overfitting
**Week 2 (2-3 hours):** OTEL LLM Observability Intro + OTEL GenAI Conventions + TDS Drift Detection
**Week 3 (2-3 hours):** Illustrated Transformer + Lil'Log Hallucinations + Rohan Paul Explainability
**Month 2 (ongoing):** fast.ai course (lessons 1-5) + LoRA/Quantization + OTEL AI Agents post

### Time Commitment Summary

- **First Week:** ~14-17 hours of structured learning (Day 1 + Week 1-3)
- **Month 2:** ~5-8 hours/week for fast.ai (optional; can extend into Month 3)
- **Total First Month:** ~14-17 hours focused learning
- **Ongoing:** Phase 5 resources are asynchronous; integrate into normal work rhythm

**Pacing Note:** If your first month includes other onboarding (infrastructure setup, codebase tour, etc.), spread Weeks 1-3 learning across 4-5 calendar weeks rather than back-to-back.

---

## Reference Section: Key Terms & Acronyms

### Core ML/AI:
- **AI**: Artificial Intelligence — machines that perform tasks requiring human-like reasoning
- **ML**: Machine Learning — systems that learn patterns from data
- **DL**: Deep Learning — neural networks with multiple layers
- **NN**: Neural Network — computational system inspired by biological neurons

### Neural Network Types:
- **CNN**: Convolutional Neural Network — processes images and spatial data
- **RNN**: Recurrent Neural Network — processes sequences (text, time-series)
- **LSTM**: Long Short-Term Memory — advanced RNN that remembers long-term dependencies
- **GRU**: Gated Recurrent Unit — simplified LSTM variant
- **Transformer**: Attention-based architecture powering modern LLMs
- **MLP**: Multilayer Perceptron — basic fully-connected neural network

### Language Models:
- **LLM**: Large Language Model — transformer-based model with billions+ parameters
- **GPT**: Generative Pre-trained Transformer — OpenAI's model architecture
- **BERT**: Bidirectional Encoder Representations from Transformers — Google's encoder model
- **NLP**: Natural Language Processing — AI for understanding/generating text
- **Embeddings**: Numerical vector representations of words/concepts

### Training & Optimization:
- **Backpropagation**: Algorithm for computing gradients (how networks learn)
- **Gradient Descent**: Optimization method for minimizing loss
- **Loss Function**: Measure of how wrong predictions are
- **Accuracy**: Percentage of correct predictions
- **Overfitting**: Model memorizes training data instead of learning general patterns
- **Underfitting**: Model too simple to capture patterns
- **Regularization**: Techniques to prevent overfitting
- **Learning Rate**: Controls how much weights change per update

### Observability & Monitoring:
- **OTEL**: OpenTelemetry — open standard for collecting observability data
- **Traces**: Detailed records of how a request flows through systems
- **Metrics**: Quantitative measurements (latency, error rate, accuracy)
- **Logs**: Detailed records of system events
- **Model Drift**: When model performance degrades over time
- **Inference**: Running a trained model on new data
- **Latency**: How long predictions take
- **Throughput**: How many predictions per unit time

### Explainability & Safety:
- **Hallucination**: When LLMs generate false or nonsensical information
- **Attention Mechanism**: How transformers focus on relevant parts of input
- **Saliency Maps**: Visual explanation of which inputs matter most
- **Feature Attribution**: Measuring importance of each input feature
- **Interpretability**: How well humans can understand model decisions
- **Black Box**: Model whose inner workings are hard to interpret
- **Uncertainty**: Confidence level of a prediction
- **Fairness**: Whether model treats different groups equally

### Production & Deployment:
- **Quantization**: Reducing model size/precision for faster inference
- **Fine-tuning**: Adapting pre-trained model to specific task
- **Prompt Engineering**: Designing input text to get desired outputs
- **Temperature**: Randomness parameter in generation (higher = more creative)
- **Top-k/Top-p**: Sampling methods for text generation
- **Token**: Individual unit of text (roughly word-sized)
- **Context Window**: How much previous text the model can "see"
- **Inference Cost**: Computational cost to run predictions

### Startup Context:
- **Observability**: Ability to measure and understand system behavior in production
- **Explainability**: Making model decisions understandable to humans
- **Measurement**: Collecting metrics to track performance and reliability
- **Production Readiness**: All the steps needed before deploying models
- **Alignment**: Ensuring AI behavior matches human intentions
- **Safety**: Preventing harmful outputs and behaviors

---

## Sources

- [3Blue1Brown Neural Networks](https://www.3blue1brown.com/topics/neural-networks)
- [Jay Alammar Visual Guide to Neural Networks](https://jalammar.github.io/visual-interactive-guide-basics-neural-networks/)
- [Jay Alammar The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [V7 Labs: What is Overfitting in Deep Learning](https://www.v7labs.com/blog/overfitting)
- [Lil'Log: Are Deep Neural Networks Dramatically Overfitted?](https://lilianweng.github.io/posts/2019-03-14-overfit/)
- [Lil'Log: Extrinsic Hallucinations in LLMs](https://lilianweng.github.io/posts/2024-07-07-hallucination/)
- [OpenTelemetry: Introduction to LLM Observability](https://opentelemetry.io/blog/2024/llm-observability/)
- [OpenTelemetry: OpenTelemetry for Generative AI](https://opentelemetry.io/blog/2024/otel-generative-ai/)
- [OpenTelemetry: AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)
- [Towards Data Science: How to Detect Model Drift in MLOps Monitoring](https://towardsdatascience.com/how-to-detect-model-drift-in-mlops-monitoring-7a039c22eaf9/)
- [Rohan Paul: Explainability and Interpretability in Modern LLMs](https://www.rohan-paul.com/p/explainability-and-interpretability)
- [DEV Community: Fine-Tuning LLMs](https://dev.to/iamfaham/fine-tuning-llms-lora-quantization-and-distillation-simplified-12nf)
- [fast.ai: Practical Deep Learning for Coders](https://course.fast.ai/)
