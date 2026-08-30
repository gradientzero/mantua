---
title: "Note on the Prague Training-Harness Talk — \"2027 Will Be the Year of Specialized Language Models\""
talk_title: "Stop Renting Models You Can't Control"
author: Wolfgang
date: 2026-08-30
status: draft / thinking note
venue: Prague, end of September 2026
origin: mixed
---

# Note on the Prague Training-Harness Talk

**Working title of the talk:** *Stop Renting Models You Can't Control — train your own, with one repository*
**Author:** Wolfgang · **Date:** 30 August 2026 · **Status:** draft thinking note

---

## 1. What this note is

A structured version of a spoken ramble about the Prague talk, plus the evidence check I owed the central prediction. It is a planning artifact, not a script.

Settled: the topic (training-as-code harness for domain models), the shape (business case → live implementation), the slot (50 minutes, §3), and the opening claim (the pipeline-bottleneck prediction, §4.2). Still open: the bridge between the two halves (§5), the demo task, and the secondary numbers that need primary sources (§8).

---

## 2. The talk in one paragraph

Most enterprises rent model behaviour they cannot inspect, pin, or roll back. If specialized small models are going to carry a meaningful share of production workloads, then the binding constraint is not the training algorithm — it is the *engineering discipline around the training run*. The proposal: put the entire training pipeline in one code repository, make runs hermetic and reproducible, trigger them from CI on pull request, and keep every eval result in Git. The payoff is that a new engineer — or a fresh agent session — can read the last eval, understand the last decision, and start the next run without tribal knowledge.

The direct inspiration is Aleph Alpha's **Model Training as Code** post describing their Savanna model factory (published ~May 2026): the pipeline lives in imperative code, end-to-end runs are hermetic and one-click launchable, and the post explicitly names *auto-research* — an agent reading, modifying and running the pipeline itself — as the reason the discipline matters going forward. That last point is the strongest hook for a 2026 audience and should not be buried at the end.

---

## 3. Run of show — 50 minutes

Slot is **50 minutes**: ~20 minutes business case, ~30 minutes implementation. (The "15-minute talk" in the recording was a transcription artifact.)

| Block | Minutes | Content |
|---|---|---|
| Cold open — the claim | 0–3 | The prediction (§4.2, version C). State it, timestamp it, promise to defend it. |
| Why specialization is plausible | 3–9 | NVIDIA/Belcák position, the data-flywheel argument, planner/worker pattern (§4.3). |
| Why it might not happen | 9–14 | BloombergGPT, generalist absorption, the collaboration gap (§4.4). Presented by you, not by the audience. |
| The decision rule | 14–18 | Six conditions (§4.5). The takeaway slide people photograph. |
| The bridge | 18–20 | Condition 6 → "if you touch the weights you own the burden of proof" (§5). |
| Repo tour | 20–30 | Structure, pinning, config-as-code, eval suite. Four claims in §6. |
| Live PR → CI run → eval diff | 30–42 | Including the blocked-merge case. This is the centrepiece; protect the time. |
| Auto-research close | 42–47 | Agent reads the last eval, opens the next PR. §6 closing beat. |
| Q&A | 47–50 | §7 objection table. |

At 50 minutes the counter-evidence block is affordable, which changes the talk for the better — a 15-minute version would have forced you to assert the thesis rather than argue it. Keep the demo at 12 minutes minimum; if anything overruns, cut from the 3–9 block, not from the PR walkthrough.

---

## 4. Part 1 — The business case

### 4.1 The opening prediction (as dictated)

> **2027 will be the year of specialized language models.**

Strong, memorable, and — as currently phrased — **not defensible and not falsifiable**. I would not open with it in this form. Two problems:

1. **It is unfalsifiable.** There is no measurement that would settle it in January 2028. "The year of X" is a slogan, and technical audiences discount slogans immediately — which costs you exactly the credibility you need for the second half.
2. **The evidence, on my check, is genuinely mixed.** The honest state of the argument is in §4.2 and §4.3. Overstating it in minute one means the first hostile question kills the frame before the code appears.

### 4.2 The prediction to actually open with — decided

> **The bottleneck for specialized models has moved from the model to the pipeline. In 2027, the teams that win with small models will be the ones who can retrain on demand — not the ones who picked the best base checkpoint.**

Falsifiable, timestamped, and it is the claim you have standing to make: not as a market analyst, but as the person with a working harness. Predictions are cheap; a reproducible repo is not. It also earns the second half of the talk directly, which the original slogan did not (§5).

Two supporting sub-claims to deploy *inside* the argument, not as the opener:

- **Architectural:** by end of 2027 the default production agent architecture is heterogeneous — a frontier planner routing to fine-tuned task models — rather than one frontier model doing everything. Checkable against published reference architectures and vendor defaults.
- **Economic:** the majority of language-model *invocations* in enterprise agentic workloads run on sub-10B models, while the majority of *spend* still goes to frontier models. The invocations-vs-spend split is the sharp version and the one the audience feels in their own bills.

Both are useful evidence for the pipeline claim. Neither is strong enough to survive as the headline, because both are forecasts about other people's behaviour.

### 4.3 Evidence *for* specialization

- **Belcák et al., NVIDIA Research — "Small Language Models are the Future of Agentic AI"** (arXiv:2506.02153, v1 2 June 2025, v2 15 Sept 2025). The anchor citation. Argument: agentic systems invoke models to do a small number of narrow tasks repetitively; SLMs are sufficiently capable, operationally better suited, and cheaper for those invocations; where general conversation is needed, heterogeneous systems are the natural answer. They define SLM by deployment reality — runnable on consumer hardware at usable single-user latency, in practice below ~10B parameters — rather than by an arbitrary parameter cut.
- **The data-flywheel argument, which is the one that matters for consulting work.** The same paper points out that instrumenting the tool/model-call interface in a running agent produces exactly the specialized instruction data you need to fine-tune a replacement expert model, filterable by whether the overall workflow succeeded. So the specialization step is a natural consequence of having deployed an agent, not a separate research project. This is the argument to lead with in front of a Mittelstand audience: *you already own the data, you just are not collecting it.*
- **The planner/worker pattern is being reported as standard practice in 2026** — frontier model for planning and ambiguity, fine-tuned small models as workers for parsing, classification, extraction, tool selection (KDnuggets, 6 July 2026, summarizing the NVIDIA position's uptake). Treat trade-press claims of "standard" with suspicion, but the pattern is real and worth naming.
- **Modularity and debuggability.** Five small models with five eval suites fail legibly; one mega-prompt fails opaquely. This is an under-used argument and it plays extremely well with engineers, because it is a *software* argument rather than a cost argument.
- **The tooling has caught up, which is what makes 2027 plausible at all.** GRPO/RLVR went from research to first-class training path: stable `GRPOTrainer` in TRL, Unsloth and Axolotl recipes (2025); managed reinforcement fine-tuning on Amazon Bedrock announced December 2025 for Nova, extended to open-weight models including GPT-OSS-20B and Qwen3-32B in February 2026; GRPO on Red Hat OpenShift AI via Training Hub / Kubeflow documented 26 August 2026; ART for multi-turn, tool-calling agent RL on a vLLM + Unsloth backend. Four years ago this was a research capability; it is now a procurement line item.

### 4.4 Evidence *against* — do not skip this on stage

- **BloombergGPT is the canonical cautionary tale.** 50B parameters, roughly 363B tokens of financial text plus ~345B general tokens, reported cost in the ~$10M range. On publicly comparable financial benchmarks, GPT-4 matched or beat it without any finance-specific training (Li/Yang et al., arXiv:2305.05862, May 2023; widely amplified by Ethan Mollick in 2023–24). The lesson the field drew — *scale beats specialization when the frontier is moving* — is too clean, since Bloomberg's internal, format-specific benchmarks remain the strongest argument for the model, and those were never public. But you must present this yourself before someone in the audience does.
- **Generalist frontier models keep absorbing vertical niches.** Every generation, the set of tasks where a fine-tune beats a frontier zero-shot call gets narrower on the *knowledge* axis, even as it stays stable on the *format/latency/cost* axis. The specialization case is strongest for narrow, schema-constrained, high-volume tasks and weakest for open-ended reasoning.
- **The specialization/collaboration trade-off.** *The Collaboration Gap* (arXiv:2511.02687) makes the point cleanly: the more specialized an agent is, the more often it hits problems outside its competence, so specialization pushes cost into orchestration and hand-off. Fleet management is a real, unpriced cost — routing, fallbacks, version skew across a dozen adapters.
- **The base model keeps moving.** A fine-tune is a depreciating asset against a base checkpoint that gets replaced every few quarters. This is not an argument against fine-tuning; **it is the single best argument for the harness** — the whole point of a one-command reproducible pipeline is that re-basing onto a new checkpoint costs a CI run instead of a project. Make this transition explicit; it is the hinge of the talk.
- **Reported secondary evidence — verify before quoting from stage.** A widely circulated case-study roundup (Medium, March 2026, 287 deployments) cites a 350M model fine-tuned for tool calling reaching ~78% on ToolBench against low-double-digit scores for general chat models; a Llama-3-8B deployment running ~60 task-specific LoRA adapters at ~10× lower cost with an ~8% F1 gain; and a router pattern sending ~95% of traffic to a small model with ~5% escalated. It also reports a failure mode worth naming: a small model at ~96% on structured invoices dropping to ~65% on unstructured policy documents. Directionally consistent with everything above, but these are secondary, vendor-adjacent numbers. **Either find the primary source or present them as anecdote.** A wrong number on a slide in front of engineers costs more than the number is worth.

### 4.5 The decision rule (this is the actual deliverable of Part 1)

The audience does not need a market forecast. They need to know when training is the right call. Ship this as one slide:

**Fine-tune a small model when *all* of these hold:**
1. The task is **narrow and stable** — the spec will not change monthly.
2. The output is **schema-constrained** — JSON, a label set, a fixed extraction shape, a tool call.
3. **Volume is high enough** that per-token economics dominate engineering cost.
4. You have, or can instrument, **domain data the frontier model has never seen** — your formats, your terminology, your edge cases.
5. You have a **trustworthy eval** for the task. Without it you cannot tell improvement from regression, and you should not touch weights.
6. There is a **non-quality driver**: latency, unit cost, on-prem/sovereignty requirement, or auditability.

**Do not fine-tune when:** the task is open-ended, ground truth is scarce or noisy, retrieval solves it more cheaply, or the requirement is still being discovered. Prompting and retrieval remain the correct first answer far more often than vendors admit — say this on stage, it buys credibility for the rest.

Condition 5 is the one to dwell on, because it is the handover to Part 2. *If you touch the weights, you own the burden of proof that the model got better — and "better" has to mean something you can re-run.*

---

## 5. The bridge — why the harness follows from the thesis (currently the weakest joint)

The dictated structure has a gap: the business case argues about *small specialized models*, and the implementation demonstrates *a training harness*. Those are related but not identical, and the audience will feel the seam unless it is named explicitly. One sentence fixes it:

> If you deploy one general model, you have a vendor. If you deploy fifteen specialized models, you have a factory — and a factory you cannot rebuild from source is a liability, not an asset.

The multiplication is the argument. Specialization does not just mean *training*; it means training *repeatedly*, per task, per client, per base-model generation. Manual training is survivable once. It is not survivable fifteen times a year across four clients.

**Caveat to keep yourself honest:** Savanna is a frontier-pretraining factory built by a team that can afford nightly end-to-end regression training runs. Presenting it as a template for a consultancy-scale post-training setup is a category transfer that has to be argued, not assumed. The properties that transfer cheaply — hermetic runs, config-as-code, immutable artifact versioning, automatic lineage — are worth naming as *the transferable subset*; the bespoke registry service, one-click multi-stage orchestration and nightly E2E retraining are explicitly the parts you skip. Saying this out loud makes the talk more credible, not less.

---

## 6. Part 2 — The implementation (the repository)

The demo has to make four claims visible in code, not in prose:

1. **Everything is in the repo.** No external pipeline definition, no console-clicked jobs, no state that lives in someone's shell history. The recipe on `main` is the team's current best-known recipe.
2. **Runs are hermetic.** Data snapshot, tokenizer, base checkpoint, container image, library versions, driver — all pinned. A run from March reproduces in October.
3. **CI triggers training and evals on pull request.** The eval result is a merge gate and a diff on the PR, not a screenshot in Slack.
4. **Every run leaves a Git-readable trace.** Inputs, config, metrics, output checkpoint, linked automatically — so a new session (human or agent) reads the last eval and starts the next run without asking anyone.

**Suggested demo arc (~12 min, minutes 30–42):** open a PR that changes one thing in the data mixture → CI kicks off the run → eval table posts back to the PR → show the regression case where the gate *blocks* the merge. The failure case is the demo. Everyone can show a green pipeline; showing the harness catching a regression is what makes the argument.

**Closing beat — the auto-research angle.** Aleph Alpha's post names it directly: with the whole pipeline in code, an agent can read, modify and run it. Land the talk here. The reason to put training in code in 2026 is not tidiness — it is that the next engineer reading the repo may not be a person, and a pipeline that requires tribal knowledge cannot be operated by something that has no tribe.

---

## 7. Objections to prepare for

| Objection | Short answer |
|---|---|
| "The frontier model will just absorb this task next quarter." | Then re-run the harness against the new base checkpoint. That is the point — this is insurance against exactly that. |
| "We don't have the data." | You have the traffic. Instrument the tool-call interface, filter by workflow success, and you have the dataset in a quarter. |
| "Managed RFT already does this." | It does the training. It does not give you provenance, reproducibility, or a merge gate — and it does not run on-prem. |
| "This is MLOps we already have." | Standard MLOps versions data and code; this versions the *recipe and the eval as one reviewable unit*, and puts a semantic regression test in the merge path. |
| "Fifteen models is fifteen things to maintain." | Correct, and that cost is real (see the collaboration-gap point). The harness is what makes the marginal one cheap. |

---

## 8. Open items before the talk

- [x] ~~Confirm the slot length.~~ 50 minutes, 20/30 split (§3).
- [x] ~~Choose the prediction.~~ Operational / pipeline-bottleneck framing (§4.2).
- [ ] Verify the talk title wording — the dictation reads as *"Stop Renting Models You Can't Control"*; confirm before it goes in the programme.
- [ ] Find primary sources for the §4.4 secondary numbers, or cut them.
- [ ] Verify the reported wind-down of OpenAI's fine-tuning platform (secondary source, June 2026) — if accurate it is a useful data point for the sovereignty argument, but it needs a primary source before it goes on a slide.
- [ ] Decide whether to demo a *green* run or a *blocked* run. (Recommendation: blocked.)
- [ ] Pick the demo task. It should satisfy all six conditions in §4.5, or the talk argues against itself.
- [ ] Decide whether the SLM research project (scoping review) gets referenced as the longer-form companion piece and pointed to from the last slide.

---

## 9. References

**Primary**

1. Belcák, P. et al., *Small Language Models are the Future of Agentic AI*, NVIDIA Research — arXiv:2506.02153 (v1: 2 June 2025; v2: 15 September 2025). https://arxiv.org/abs/2506.02153
2. Aleph Alpha, *Model Training as Code* (Savanna model factory), ~May 2026. https://aleph-alpha.com/en/blog/model-training-as-code/
3. Wu, S. et al., *BloombergGPT: A Large Language Model for Finance* — arXiv:2303.17564 (March 2023). https://arxiv.org/abs/2303.17564
4. Li, X. / Yang, Y. et al., *Are ChatGPT and GPT-4 General-Purpose Solvers for Financial Text Analytics?* — arXiv:2305.05862 (May 2023). https://arxiv.org/abs/2305.05862
5. *The Collaboration Gap* — arXiv:2511.02687. https://arxiv.org/abs/2511.02687
6. Shao, Z. et al., *DeepSeekMath* (introduces GRPO) — arXiv:2402.03300. https://arxiv.org/abs/2402.03300

**Tooling / ecosystem**

7. AWS, *Reinforcement fine-tuning on Amazon Bedrock with OpenAI-compatible APIs* (RFT announced Dec 2025 for Nova; open-weight support Feb 2026). https://aws.amazon.com/blogs/machine-learning/reinforcement-fine-tuning-on-amazon-bedrock-with-openai-compatible-apis-a-technical-walkthrough/
8. Red Hat Developer, *GRPO fine-tuning on Red Hat OpenShift AI with Training Hub*, 26 August 2026. https://developers.redhat.com/articles/2026/08/26/reinforcement-learning-from-verifiable-rewards-with-training-hub-on-red-hat-openshift-ai
9. ART (Agent Reinforcement Trainer) — GRPO for multi-turn, tool-using agents; vLLM + Unsloth backend.
10. Hugging Face TRL `GRPOTrainer`, Unsloth, Axolotl GRPO recipes (2025 onward).

**Secondary / trade press — verify before quoting**

11. KDnuggets, *5 Ways Small Language Models Are Powering Next-Gen Agents*, 6 July 2026.
12. *How Companies Actually Use Small Language Models — What 287 Case Studies Reveal*, Medium, March 2026.
13. *LLM Fine-Tuning Guide for Enterprises*, AIMultiple, June 2026 (source of the OpenAI fine-tuning wind-down claim).

---

*Note compiled 30 August 2026 from a dictated field recording. Sections 3, 4.2, 4.4 and 5 contain pushback on the dictated plan rather than a transcription of it.*
