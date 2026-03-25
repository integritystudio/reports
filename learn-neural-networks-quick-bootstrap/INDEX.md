# Neural Networks & LLMs Learning Paths — Index

**Choose your path based on your background and learning goals.**

---

## Quick Selector

| If you are... | Read this | Time | Focus |
|---|---|---|---|
| **Product leader / Business stakeholder** | [`lesson-plan-nontechnical.md`](#nontechnical) | 2-3 weeks, 3-5 hrs/week | Business impact, risk decisions, customer communication |
| **Data analyst / QA / DevOps / Ops engineer** | [`lesson-plan-technical-noncoders.md`](#technical-noncoders) | 2-3 weeks, 2-3 hrs/week | Systems thinking, observability, dashboards, metrics |
| **Career changer (no CS background)** | [`lesson-plan-career-changers.md`](#career-changers) | 5-6 weeks, 1-2 hrs/week | Scaffolded, high-support, slow paced, community |
| **Teacher / Trainer / Educator** | [`lesson-plan-educators.md`](#educators) | Varies (reference) | Pedagogy, teaching strategies, discussion prompts |
| **Original: Mildly technical new hire** | [`lesson-plan.md`](lesson-plan.md) | 4 weeks, 4-5 hrs/week | Core curriculum; assumes some Python comfort |

---

## Document Analysis

### 1. lesson-plan-nontechnical.md {#nontechnical}

**Audience:** Product managers, sales leaders, executives, business stakeholders

**Document Stats:**
- **Word count:** 4,816 words
- **Estimated reading time:** 2-3 weeks (3-5 hours/week)
- **Sections:** 55 subsections across 5 phases + capstone
- **Structure:** 5 phases + Phase 4 Capstone + Common Pitfalls reference

**Content Analysis:**

This is the **most comprehensive non-coder path** — balancing accessibility with depth. It trades technical precision for business applicability and decision-making clarity.

**Pedagogical approach:**
- Leads with **business risk framing** ("what breaks and why it matters to customers")
- Heavy use of **analogies and metaphors** (pattern-matching engine, predicting next word, hallucination as pattern-matching failure)
- Emphasizes **limitations and tradeoffs** rather than capability
- Teaches **critical thinking about AI hype** ("bigger models hallucinate *more* confidently, not less")

**Unique features:**
- **Fast/Medium/Expert tracks** (1 week vs. 2 weeks vs. 3-4 weeks)
- **Phase 4 Capstone prioritized** (non-technical communication is the capstone skill)
- **Misconceptions explicitly addressed** for each phase
- **Role-based communication guidance** (how to talk to Product/Success/Sales/Engineering)
- **Common pitfalls section** rephrased as business-level risks ("Dead Models", "Observability Gaps")

**Best for:**
- Making go/no-go decisions on AI projects
- Communicating with customers about model limitations
- Understanding failure modes without diving into technical details
- Building ML literacy at the executive level

**Strengths:**
- Clear, jargon-light explanations
- Business-focused examples
- Misconception-busting section
- Phase 4 capstone on translating to non-technical audiences
- Honest about limitations ("you can't fully explain LLM decisions")

**Pacing:**
- Fast: 1 week (Phases 1, 4, 3-concepts only)
- Standard: 2 weeks (all phases with light Phase 5)
- Deep: 3-4 weeks (all phases, extra Phase 4 practice)

---

### 2. lesson-plan-technical-noncoders.md {#technical-noncoders}

**Audience:** Data analysts, QA engineers, DevOps/SRE, operations teams, technical staff without coding

**Document Stats:**
- **Word count:** 3,538 words
- **Estimated reading time:** 2-3 weeks (2-3 hours/week)
- **Sections:** 51 subsections across 5 phases
- **Structure:** 5 phases with systems-level framing

**Content Analysis:**

This path is **operations-focused** — it treats ML systems like any other distributed system (monitoring, alerting, SLOs, observability). Trades business framing for technical depth at the systems level.

**Pedagogical approach:**
- **Systems-thinking lens** (dashboards, metrics, traces, spans, drift detection)
- **Draws parallels to familiar systems** ("like monitoring p99 latency for an API")
- **Emphasizes observability as architecture** (not bolt-on)
- **Statistical/quantitative** (KL divergence, PSI, drift detection methods)
- **Hands-on dashboard interpretation** (read the dashboard, identify the problem)

**Unique features:**
- **Phase 3 (Observability) is the primary focus** — 5-6 hours of content
- **Dashboard design activities** ("You have 3 hours; design a monitoring stack")
- **"Try This" exercises are operational** (read a dashboard, interpret metrics, design tests)
- **Common pitfalls framed as signals** (loss spikes, silent accuracy degradation, confidence miscalibration, production-training mismatch)
- **Operational decision trees** (if drift detected, what do you do?)

**Best for:**
- Designing and implementing monitoring for ML systems
- Setting SLOs for model-based systems
- Diagnosing production issues with ML
- Building test suites for AI systems
- Becoming the bridge between ML teams and operations

**Strengths:**
- Deep observability knowledge
- Real-world operational patterns
- Dashboard design methodology
- Drift detection strategies
- SLO definition for models

**Pacing:**
- Fast: 3-5 days (Phases 1, 3, 4)
- Standard: 2-3 weeks (all phases, Phase 3 deep)
- Expert: 3-4 weeks (all phases, Phase 3 & 5 deep, design capstone projects)

---

### 3. lesson-plan-career-changers.md {#career-changers}

**Audience:** Career changers switching into AI/ML/tech roles with zero CS background

**Document Stats:**
- **Word count:** 3,325 words
- **Estimated reading time:** 5-6 weeks (1-2 hours/week, intentionally slow)
- **Sections:** 49 subsections across 5 phases
- **Structure:** 5 phases with extensive scaffolding and check-ins

**Content Analysis:**

This is the **most empathetic, slowest-paced path**. It assumes no computer science background, normalizes confusion, and builds community support into the learning model.

**Pedagogical approach:**
- **High-empathy framing** ("Confusion is the signal that learning is happening")
- **Extensive pre-flight checks** ("Is this right for you?", "Should you learn Python?" decision guide)
- **Permission structures** ("It's OK to say 'I don't understand yet'")
- **Explicit pacing** (5-6 weeks intentional, 1-2 hrs/week)
- **Normalization of struggle** ("Career changers take 3-4 reads to internalize. This is normal.")

**Unique features:**
- **"Before You Start" section** with explicit prerequisites check
- **"Real talk" callouts** throughout (normalizing confusion, struggle, imposter syndrome)
- **Reflection exercises** (write answers, even if rough; build your mental model)
- **Support system section** (study buddies, meetups, team conversations)
- **Explicit permission to rewatch videos 3 times**
- **Phase structure is scaffolded** (each phase has explicit learning objectives, clearer than other paths)
- **Career context throughout** (how does this apply to your role transition?)

**Best for:**
- Career switchers starting from zero
- Building confidence alongside competence
- Learning at a sustainable pace
- Integrating learning into normal work rhythm
- Finding community and support

**Strengths:**
- Highest empathy level
- Most scaffolding and support
- Clear "this is normal" messages
- Explicit pacing and time management
- Community-building emphasis
- Permission structures (OK to be slow, confused, etc.)

**Pacing:**
- Slow and steady: 5-6 weeks (recommended, 1-2 hrs/week)
- Moderate: 3-4 weeks (2-3 hrs/week)
- Honest check-in: "Is this exciting or obligation?" (if obligation, revisit)

---

### 4. lesson-plan-educators.md {#educators}

**Audience:** Teachers, trainers, facilitators, curriculum designers

**Document Stats:**
- **Word count:** 2,784 words
- **Estimated reading time:** Varies (reference document; 20-30 min to skim, hours to implement)
- **Sections:** 33 subsections across 5 phases + teaching methods
- **Structure:** 5 phases + pedagogical framework + assessment rubrics

**Content Analysis:**

This is **not a student learning path** — it's a **teaching toolkit**. It's written for instructors who are designing or delivering this curriculum.

**Pedagogical approach:**
- **Constructivist:** Builds student mental models, not memorization
- **Discussion-driven:** Heavy emphasis on misconception busting and talk-backs
- **Active learning:** Role-plays, scenarios, peer critique, design activities
- **Assessment as learning:** Graded on explanation ability, not test scores
- **Reverse sequencing:** Starts with Phase 4 Capstone (orientation) before diving into Phase 1 foundations

**Unique features:**
- **Student misconceptions table per phase** (what they'll think, what's actually true, how to teach it)
- **Teaching strategy sections** (before/while/after for each resource)
- **Classroom activities** (role-play, dashboard design, peer-teaching)
- **Assessment rubrics** with gradients (Excellent/Good/Adequate/Below Target)
- **Multiple pacing options** (semester course, 2-3 week bootcamp, self-paced online)
- **Instructor notes** on common questions and how to address them

**Best for:**
- Instructors designing an AI literacy curriculum
- Trainers running workshops on AI/ML
- Teachers who want discussion-based, misconception-busting pedagogy
- Facilitators designing assessments that emphasize explanation ability
- Curriculum designers working with non-technical audiences

**Strengths:**
- Robust misconception taxonomy
- Ready-to-use classroom activities
- Clear assessment rubrics
- Multiple format options (semester, bootcamp, self-paced)
- Emphasis on student explanation as evidence of learning
- Role-play scenarios for practice

**Implementation complexity:**
- **Skim level:** 20-30 min to understand approach
- **Prep level:** 2-3 hours to prep one phase for teaching
- **Full implementation:** 15-20 hours to teach all 5 phases (varies by format)

---

## Comparison Matrix

| Dimension | Non-Technical | Technical Non-Coders | Career Changers | Educators |
|---|---|---|---|---|
| **Word count** | 4,816 | 3,538 | 3,325 | 2,784 |
| **Reading time** | 2-3 weeks | 2-3 weeks | 5-6 weeks | Varies |
| **Hours/week** | 3-5 | 2-3 | 1-2 | N/A |
| **Tone** | Business-focused | Systems-focused | High-empathy | Pedagogical |
| **Primary goal** | Decision-making | Observability | Confidence-building | Teaching others |
| **Phase emphasis** | Phase 4 capstone | Phase 3 (obs) | All equal | All equal (teach) |
| **Best for** | PMs, executives, leaders | Analysts, QA, DevOps | Career switchers | Teachers, trainers |
| **Strength** | Misconception busting | Dashboard interpretation | Scaffolding + support | Assessment design |

---

## How These Documents Relate

**Original:** `lesson-plan.md`
- Assumes some Python comfort
- 4-week timeline, 4-5 hrs/week
- Includes coding exercises (Karpathy "try this", OTEL instrumentation)
- Target: mildly technical new hires at ML/OTEL startup

**Four variants:** No coding exercises, adapted for different audiences

All four variants:
- Use the same 14 resources (quality is audience-agnostic)
- Preserve LPTHW pedagogical structure (learning objectives, glossaries, Try This, Teach-Back, pitfalls)
- Cover all three learning goals: conceptual understanding + observability + decision-making
- Are **self-contained** (readers don't need to reference the original)

**Differences:**
- Language register (business-focused vs. technical vs. empathetic vs. pedagogical)
- Pacing (1 week vs. 2 weeks vs. 5-6 weeks vs. reference)
- Exercise type (role-play vs. dashboard interpretation vs. reflection vs. classroom activity)
- Emphasis (business impact vs. systems thinking vs. confidence-building vs. teaching)

---

## Recommendations by Use Case

**"I need to onboard a new PM"**
→ Use `lesson-plan-nontechnical.md` (Fast track, 1 week)

**"I'm building a monitoring stack and need to understand LLMs"**
→ Use `lesson-plan-technical-noncoders.md` (2-3 weeks, Phase 3 deep)

**"I'm switching careers into ML and have no CS background"**
→ Use `lesson-plan-career-changers.md` (5-6 weeks, go slow)

**"I'm teaching this to a classroom/workshop"**
→ Use `lesson-plan-educators.md` as a reference; customize activities

**"I have some Python and work at an ML startup"**
→ Use `lesson-plan.md` (original, 4 weeks with coding)

---

## Files Summary

| File | Size | Sections | Reading Time | Best For |
|---|---|---|---|---|
| [`lesson-plan.md`](lesson-plan.md) | ~12KB | 30+ | 4 weeks (4-5 hrs/week) | Mildly technical new hires with Python |
| [`lesson-plan-nontechnical.md`](lesson-plan-nontechnical.md) | ~17KB | 55 | 2-3 weeks (3-5 hrs/week) | Business leaders, decision-makers |
| [`lesson-plan-technical-noncoders.md`](lesson-plan-technical-noncoders.md) | ~12KB | 51 | 2-3 weeks (2-3 hrs/week) | Analysts, QA, DevOps, operations |
| [`lesson-plan-career-changers.md`](lesson-plan-career-changers.md) | ~11KB | 49 | 5-6 weeks (1-2 hrs/week) | Career switchers, high support |
| [`lesson-plan-educators.md`](lesson-plan-educators.md) | ~9.5KB | 33 | Varies | Teachers, trainers, facilitators |

---

## Navigation Tips

**If you're unsure which path:**
1. Read the "Quick Selector" table above
2. Check the "Recommendations by Use Case" section
3. Read the first 2-3 pages of your chosen document
4. If it feels right, dive in; if not, try another

**Each document is self-contained:**
- All 5 phases included
- All resources explained
- No need to cross-reference others

**All share the same 14 resources:**
- You can mix and match documents if needed
- The difference is in how each path explains, emphasizes, and sequences the material

---

## Questions?

- **Which should my team read?** Depends on their role. See the Quick Selector above.
- **Can someone read multiple?** Yes, but not necessary. Each is complete.
- **Do these replace the original lesson-plan.md?** No. Original is for those with Python comfort. New paths are for those without coding background.
- **How were these created?** Based on the original `lesson-plan.md` (updated March 2025 with LPTHW pedagogical elements). Each variant adapted for a specific audience, removing all coding exercises and reframing for accessibility.

---

## Credits

All learning paths based on `learn-neural-networks-quick-bootstrap/lesson-plan.md` with LPTHW pedagogical elements (NN1, completed March 25, 2025).

Created: March 25, 2026
