# Teaching Neural Networks & LLMs: An Educators' Curriculum
### For Teachers, Trainers, and Facilitators

---

## How to Use This Guide

**You're teaching others about AI and LLMs.** This guide provides:
- Pedagogically-structured curriculum (not just resources)
- Discussion prompts and student misconceptions to address
- Teaching strategies tested with non-technical audiences
- Pacing guidance for different classroom settings
- Assessment ideas and reflection exercises

This curriculum centers on **pedagogical principles, not content coverage**. The goal is student understanding and ability to think critically about AI, not memorization.

---

## Philosophy

**Core principles:**
1. **Intuition before abstraction.** Build visual/conceptual understanding before formalism.
2. **Why before how.** Students care about "why do neural networks hallucinate?" before "how do transformers work?"
3. **Misconceptions first.** Address wrong mental models explicitly; don't let them fester.
4. **Talk-backs over quizzes.** Student ability to explain is better metric than regurgitation.
5. **Connect to student experience.** Every abstract concept gets one concrete analogy.

---

## Phase Sequence Recommendation (Reverse for Educators)

**Unlike other cohorts, educators benefit from teaching the capstone first.** Why?

- Phase 4 Capstone (explaining to non-technical audiences) is the **learnable skill** you're teaching them
- Phases 1-3 build the foundation that makes good explanations possible
- Students understand "where this lands" before diving into details

**Recommended class structure:**
1. **Day 1:** Phase 4 Capstone (orientation; "this is where we're headed")
2. **Week 1:** Phase 1 (building blocks)
3. **Week 2:** Phase 2 (why systems fail)
4. **Week 3:** Phase 3 (detecting failures)
5. **Week 4:** Phase 4 (the full explanation skill)
6. **Ongoing:** Phase 5 (depth, specialization)

---

## Executive Summary

Teaching students about neural networks and LLMs requires you to:
- Confront their misconceptions head-on (they've heard LLMs can "reason")
- Build intuition through analogy and visualization (not formulas)
- Emphasize the "why" before the "how"
- Teach critical thinking about AI hype and limitations
- Practice translating technical concepts to non-technical audiences

This curriculum gives you the frameworks to do all of these well.

---

## Phase 1: Building Intuition

**Pedagogical goal:** Students can explain how networks learn using analogies; no math required.

**Time:** 1-2 hours per class session; 1-2 sessions total

**Student misconception to address upfront:**
- "Neural networks are conscious / think like humans"
  - **Reality:** They're mathematical functions that adjust to minimize error
  - **Teaching approach:** "They learn patterns, not meaning. Like learning the rule 'if I see a, then b usually follows' — that's pattern matching, not understanding."

### Resource 1 — Teaching Strategy
**Resource:** 3Blue1Brown Chapter 1
**Length:** 19 minutes (good as homework or in-class)
**How to teach it:**

**Before watching:**
- Ask students: "How do you think a computer learns to recognize handwritten digits?"
- Let them brainstorm (usually: "memorize all of them" or "rules the programmer gives")
- Frame: "What if the computer learned the rules itself from examples?"

**While watching:**
- Pause at the visualization of the loss surface. Ask: "What does this landscape represent?"
- Draw a simple neural network on the board; label the weights. Ask: "What changes during training?"

**After watching:**
- Discussion prompt: "Why can't the network just memorize all the training digits?"
- Have students draw their own network diagram and label: input, weights, output

**Common student question:**
- "Why random weights at the start?"
  - Good answer: "Random ensures the network doesn't learn the same pattern every time. And random + feedback = learning."

### Resource 2 — Teaching Strategy
**Resource:** Jay Alammar's Interactive Guide
**Length:** 20-30 minutes
**How to teach it:**

**In class or as assignment:**
- Have students interact with the sliders themselves
- Assign: "Change each weight and predict what happens to the error bar"
- Then test your prediction (interactive verification)

**Discussion after:**
- "What did you notice when you increased one weight a lot?"
- "Why would some configurations work better than others?"
- "What's the tradeoff between having many weights vs. few weights?"

### Phase 1 Teaching Methods

**Analogies students understand:**
- **Learning = adjusting dials on a machine.** Each weight is a dial. The network finds the dial settings that minimize error.
- **Gradient descent = finding downhill.** Imagine you're in fog on a hill. You can't see where the bottom is. You feel the slope beneath your feet and step downhill. Repeat. That's gradient descent.
- **Neural network = weather predictor learning patterns.** "If I see these atmospheric conditions, rain usually follows." The network learns hundreds of these correlations.

**Activities:**
- Have students sketch a neural network without watching the video. Discuss the differences.
- Bring in a simple physical example: a marble rolling down a surface (representing gradient descent)
- Role-play: one student is the network, others are examples. The "network" adjusts (learning) based on feedback (loss)

### Phase 1 Student Talk-Back (Assessment)

Ask students: "Explain to someone who's never heard of neural networks how they learn. No equations. One analogy."

**Grade on:**
- Clarity (no jargon)
- Accuracy (captures the core loop: examples → error → adjustment)
- Completeness (all three components present)

---

## Phase 2: Why Systems Fail

**Pedagogical goal:** Students can identify overfitting; understand why models fail in production.

**Time:** 3-4 hours (can span 2 sessions)

**Student misconception to address:**
- "If a model works on our test set, it'll work in production"
  - **Reality:** Test set ≠ production distribution
  - **Teaching approach:** "It's like studying old exams and expecting every future exam to be identical. What if the teacher changes the focus?"

### Resource 3 — Teaching Strategy
**Resource:** Karpathy Zero to Hero (Lectures 1-2)
**Note:** Show, don't do. No coding assignments.

**How to teach it:**
1. Show the video in class (90 min)
2. Pause at loss curve visualizations
3. Ask: "What does a good loss curve look like? A bad one?"
4. Ask: "When would you stop training?"

**Key moments to highlight:**
- The moment loss stops improving (plateau)
- The moment validation loss diverges from training loss (overfitting)
- The moment gradient becomes zero (no more learning possible)

---

### Resource 4 — Teaching Strategy
**Resource:** What is Overfitting?
**Length:** 25 minutes

**In-class activity:**
1. Show the train/val loss plots (2 minutes)
2. Ask students: "What's happening in scenario A? Scenario B?" (5 min)
3. Discuss: "Why is scenario B bad? What would you do next?" (5 min)

**Common misconception:**
- "Overfitting means the model isn't good"
  - **Reality:** Overfitting means the model learned the training set too well but can't generalize
  - **Teaching fix:** "It's not that the model is bad at the task; it's that the model is too specific to the training set."

### Phase 2 Teaching Methods

**Real-world example:**
- "You study for a test using 10 practice exams. On those 10, you score 98%. But on the real exam (different questions), you score 70%. Why? You memorized answers, not understood concepts. That's overfitting."

**Classroom activity:**
- Bring two datasets: one for training, one for testing
- Have students "train" (manually, no coding): memorize the training set perfectly
- Then test on new data: fail spectacularly
- Debrief: "What just happened? Why did memorization not help?"

### Phase 2 Student Talk-Back (Assessment)

**Scenario:** "Your team built a model that gets 94% accuracy on your test data. You deploy it. Real-world accuracy is 71%. Why? What would you have done differently?"

**Grade on:**
- Identifies distribution mismatch or overfitting
- Proposes validation strategy for the future
- Reflects on test set representativeness

---

## Phase 3: Detecting Failures (Observability)

**Pedagogical goal:** Students understand monitoring as essential, not optional; can design observability systems.

**Time:** 4-5 hours (span 2-3 sessions)

**Student misconception to address:**
- "Monitoring is IT operations, not our problem"
  - **Reality:** Model-specific monitoring (accuracy drift, confidence calibration) is a science problem, not an ops problem
  - **Teaching approach:** "If you can't measure it, you can't know when it breaks."

### Resources 6-8 — Teaching Strategy

**Session 1: Observability Concepts (30 min)**
- Read Resource 6 (LLM observability fundamentals)
- Draw a dashboard on the board: what metrics would you want?
- Brainstorm: "If your model is failing silently, what measurements would catch it first?"

**Session 2: Standards & Practices (25 min)**
- Skim Resource 7 (semantic conventions; this is reference material)
- Focus: "Why do standards matter? Why not just measure whatever?"

**Session 3: Drift Detection (35 min)**
- Read Resource 8 (drift detection)
- Activity: "Describe three ways a model could drift. What would you measure for each?"

### Phase 3 Teaching Methods

**Dashboard design activity:**
- Break students into small groups
- Assign each group a scenario (e.g., "customer support chatbot")
- Task: "Design three dashboards: operational (for ops team), quality (for ML team), drift (for product). What metrics go on each?"
- Groups present; class discusses

**Myth-busting:**
- "Accuracy is the only metric that matters"
  - Counter: "Accuracy can stay the same while model drifts (more false positives, fewer false negatives balanced out). You need multiple signals."

### Phase 3 Student Talk-Back (Assessment)

**Task:** "Design monitoring for an LLM-based chatbot. What 5 metrics would you track? For each, describe: (1) what it measures, (2) what a healthy value looks like, (3) what you'd do if it degrades."

**Grade on:**
- Metrics are specific (not vague)
- Includes at least one model-specific metric (accuracy, drift, confidence)
- Includes at least one operational metric (latency, cost)
- Responses to degradation are realistic

---

## Phase 4 Capstone: Teaching Others to Explain

**Pedagogical goal:** Students can translate technical AI concepts to non-technical audiences.

**This is the culmination.** Everything prior was in service of this.

**Time:** 4-5 hours (recommend full week to practice)

### Before Phase 4: Orientation Activity (1 hour)

**Purpose:** Show students why this matters.

**Activity:**
1. Invite a non-technical colleague (or manager, or peer) to class
2. Have them ask a question: "Why do LLMs hallucinate? Should we be worried?"
3. Have a student attempt to answer (no prep)
4. Debrief: "What was hard? What assumptions did we make?"
5. Frame: "Phase 4 teaches you to answer this well."

### Resource 9-11 — Teaching Strategy

**Session 1: Understand the Architecture (60 min)**
- Show Resource 9 (Illustrated Transformer)
- Goal: students understand attention (not every detail, but the concept)
- Activity: "Annotate this attention visualization. Which words is the model paying attention to? Why?"

**Session 2: Understand Failures (45 min)**
- Read Resource 10 (hallucinations)
- Discuss: "Why can't we just train it better to not hallucinate?"
- Activity: "Brainstorm three ways to detect hallucinations"

**Session 3: The Explanation Skill (60 min)**
- Read Resource 11 (interpretability tools)
- Discuss: "We have tools to explain decisions. Are they good enough?"
- Activity: "Choose one misconception from Phase 4 Capstone (below). Write a 2-min explanation that addresses it."

### Phase 4 Capstone Activities (In Depth)

**Activity 1: Misconception Buster**

**Misconception 1:** "LLMs understand language"
- **Your reframe:** "LLMs predict language. Understanding would mean grasping meaning; prediction means finding statistical patterns."
- **Student task:** Write a 1-min explanation of this distinction for a CEO.

**Misconception 2:** "More training data = no hallucinations"
- **Your reframe:** "Hallucinations aren't a data quality problem; they're architectural. Hallucination happens because the model is optimized to generate plausible text, not factual text."
- **Student task:** Explain to a customer why we can't promise "no hallucinations."

**Misconception 3:** "Attention visualization shows what the model thought"
- **Your reframe:** "Attention shows what words mattered, not why they mattered or how they influenced the decision."
- **Student task:** Show an attention visualization and explain what it does and doesn't tell us.

**Misconception 4:** "Explainability = safety"
- **Your reframe:** "Explaining a bad decision doesn't make it good. Transparency and defense mechanisms (monitoring, guardrails) matter more than explanation."
- **Student task:** Propose a defense strategy for a company deploying LLMs, combining explanation + monitoring + guardrails.

**Activity 2: Role-Play Scenarios**

**Scenario A: The Skeptical Executive**
- Student role-plays explaining hallucinations to a CEO who's read about ChatGPT errors
- Class observes and gives feedback: "What was clear? What was confusing?"

**Scenario B: The Non-Technical Customer**
- Student explains why the LLM gave a wrong answer, what we did about it, and what the customer should do
- Class rates clarity and reassurance level

**Scenario C: The Peer Who Disagrees**
- Student defends a position (e.g., "we should use LLMs here despite hallucination risk")
- Peer argues the opposite
- Class evaluates quality of reasoning

### Phase 4 Student Talk-Back (Assessment — The Capstone)

**Final project:** "Choose a non-technical audience (CEO, customer, journalist, board member). Write or record a 3-minute explanation addressing this question: 'What's an LLM, where does it work, where does it fail, and how do you know?'"

**Grade on:**
- No jargon (or jargon explained)
- Accurate (doesn't overstate capability)
- Complete (answers all four parts)
- Persuasive (audience feels informed, not scared)

**Rubric:**
- **Excellent:** Clear analogies, acknowledges limitations, proposes solutions (monitoring/guardrails)
- **Good:** Clear analogies, mentions limitations, but shallow on solutions
- **Adequate:** Some jargon leakage, mentions hallucinations but doesn't explain why
- **Below target:** Heavy jargon, overstates capability or dismisses risks

---

## Phase 5: Depth & Specialization

**Pedagogical goal:** Students choose a specialization and go deeper based on their interests.

**Time:** 4-8 hours (self-paced, or structured as "deep dives" for advanced students)

**Specialization paths:**

**Path A: Model Builders (Technical)**
- Resource 12 + 13: deployment, fine-tuning, quantization
- Project: "Evaluate three deployment approaches for a use case. Which makes sense and why?"

**Path B: Monitors & Operators**
- Deep dive into Resource 8 + 14: drift detection, observability at scale
- Project: "Design a monitoring system for multi-step AI workflows"

**Path C: Educators**
- Create a lesson for teaching Phase 1-2 to a different audience
- Refine based on feedback

**Path D: Researchers**
- Investigate recent papers on hallucination detection, interpretability
- Synthesize findings into a "state of the field" presentation

---

## Teaching Tips Across All Phases

### Addressing Hype
Students come in with inflated expectations (LLMs are going to code my app, etc.).

**Strategy:**
- Acknowledge: "These are genuinely powerful tools"
- Contextualize: "And they have specific, real failure modes"
- Inoculate: "I'll teach you to think critically about when they're good, when they're not"

### Using Analogies Effectively
- Give multiple analogies for one concept (students anchor to different ones)
- Invite students to create their own analogies (co-create understanding)
- Call out analogy limits: "This is like X, but here's where the analogy breaks"

### Handling "I Don't Know"
- Normalize: "There's active research on these questions. Not knowing is honest."
- Model: "Here's how I'd investigate this if I didn't know the answer"
- Empower: "You could research this and find out"

### Pacing for Different Classroom Formats

**Synchronous classroom (semester):**
- Phase 1: 1-2 weeks
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 2-3 weeks (heavy project focus)
- Phase 5: ongoing (student projects)

**Bootcamp (2-3 weeks intensive):**
- Phase 1: 1 day
- Phase 2: 2 days
- Phase 3: 2 days
- Phase 4: 3-4 days (majority of time; practice emphasis)
- Phase 5: (post-bootcamp self-study)

**Self-paced online:**
- Encourage 3-4 weeks minimum (slow > fast for this material)
- Provide peer discussion forums (essential)
- Student peer-teaching (learners teach each other)

---

## Assessment Ideas (Beyond Tests)

1. **Talk-back assignments:** Can student explain to non-technical peer?
2. **Scenario analysis:** Given a failure, what would you measure/do?
3. **Dashboard design:** Students sketch and annotate monitoring strategy
4. **Peer review:** Students critique each other's explanations
5. **Myth-busting:** Students identify and correct AI hype claims
6. **Capstone project:** Explain AI to a real non-technical audience

---

## Resources for You (The Instructor)

**If you want to teach this and feel rusty:**
- Do Phases 1-4 yourself first
- Engage with the discussion prompts as if you were a student
- Create your own analogies (you'll teach better if you've worked through the concepts)

**If you want student groups to present:**
- Assign 1-2 resources per group + 10-min presentation
- Require: (1) concept explained, (2) one analogy, (3) one misconception addressed

**If you want office hours:**
- Expect questions on: "Why can't we just fix hallucinations?" (Revisit Phase 4)
- Prepare: "How do we know the model is biased?" (Thread through Phase 3 monitoring)

---

## Final Notes on Teaching This Material

**You're not just teaching facts; you're teaching thinking.**

Students should leave this course able to:
- Recognize AI hype
- Ask smart questions about capabilities vs. limitations
- Design systems (monitoring, testing) that assume failure will happen
- Explain technical concepts to anyone

These are the skills that matter. Test for them.

**Good luck.** You're preparing students to think critically in a world where AI is everywhere. That's important work.
