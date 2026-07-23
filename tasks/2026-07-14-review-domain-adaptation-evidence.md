---
title: Review recent evidence for domain-adapted small language models
date: 2026-07-14
priority: high
status: open
area: research
---

## Goal

Decide how strongly the notebook can support the claim that an adapted,
privately deployed small or medium language model can match a frontier model
for a bounded enterprise workflow. The immediate work is evidence review, not
implementation guidance: prompting and RAG-only customization are out of
scope, while supervised fine-tuning, LoRA/QLoRA, continued pretraining,
distillation, preference optimization, and reinforcement learning are in
scope.

The target model range is roughly 3B–30B parameters, with particular interest
in models that can be served on consumer or modest on-premises hardware, such
as Qwen3-4B. Prefer empirical work from 2025–2026 that compares against a
larger or frontier model and reports workflow quality, latency, throughput, or
cost.

## Current analysis

The evidence available as of July 2026 supports a qualified conclusion:
**task-specific parity is real, but broad domain-level parity is not.** A
well-adapted 3B–14B model can match or beat a frontier model on a narrow,
stable, measurable workflow. The same model may fail badly on a neighboring
task in the same domain, and current frontier models retain large advantages
on broad reasoning, unfamiliar distributions, and some long-document tasks.

The conditions that recur in successful studies are:

- The task and output format are narrowly specified and stable.
- Training examples closely resemble real production traffic.
- Correctness is measurable automatically or by domain experts.
- Training includes hard negatives, boundary cases, or filtered synthetic
  examples rather than only easy positive demonstrations.
- The base model already has enough capability for the task; adaptation
  specializes existing capability rather than creating it from nothing.
- Evaluation is performed on a genuinely held-out production, chronological,
  or tenant split rather than on the training-data construction pipeline.

### Strong positive evidence

- [Fine-tuning Small Language Models as Efficient Enterprise Search Relevance
  Labelers](https://arxiv.org/abs/2601.03211) fine-tunes Phi-3.5 Mini using
  GPT-4o-generated labels and hard negatives. NDCG improves from 0.815 to
  0.953, slightly above GPT-4o at 0.944; pairwise accuracy is 63.81% versus
  62.58%. The paper reports 873 requests/minute on one A100 and estimated
  token prices about 19 times below GPT-4o. The evaluation is proprietary and
  contains only 923 query-document pairs, while GPT-4o is no longer the
  strongest frontier comparator.

- [Small LLMs for Biomedical Claim
  Verification](https://aclanthology.org/2026.bionlp-1.57/) uses QLoRA on
  Phi-3 Mini 3.8B, Qwen2.5-3B, and Mistral-7B with 1,008 examples. On
  HealthVer, Mistral-7B reaches 65.2 F1 versus 53.2 for GPT-4o and 42.4 for
  GPT-5. Estimated local inference is $0.029 per 1,000 examples versus $1.30
  for GPT-4o. Cross-domain performance drops sharply, and one benchmark
  contains an exploitable structural artifact.

- [FinED-Bench](https://aclanthology.org/2026.findings-acl.1481/) fine-tunes
  Qwen3-14B with 18,212 synthetic, model-checked financial-document fragments.
  F1 rises from 43.15 to 53.85, exceeding GPT-4o at 48.34 on documents
  reported in 2025. The inserted errors were expert verified, but remain
  synthetic; reasoning errors are still difficult and the paper gives no
  operational cost measurements.

- [SLM Finetuning for Natural Language to Domain Specific Code Generation in
  Production](https://arxiv.org/abs/2604.09952) applies LoRA to Mistral-7B
  using 68,000 natural-language/DSL pairs. It reports sequence similarity of
  0.72 versus 0.70 for a GPT-4 RAG system and median latency near 1.3 seconds
  versus 13 seconds. A tenant adaptation using 64 examples produces a large
  tenant-specific improvement. The comparator is an older GPT-4 system and
  sequence similarity is only a proxy for business correctness.

- [MedGemma 1.5](https://arxiv.org/abs/2604.05081) is strong evidence that
  small-model superiority can be extremely task dependent. Its 4B model beats
  Gemini 3 on some narrow multimodal medical tasks: chest-X-ray report
  RadGraph F1 is 27.2 versus 7.4/20.8, and whole-slide histopathology ROUGE-L
  is 49.4 versus 13.9/12.2. On broad MedQA, however, it scores 69.1 versus
  94.3/95.1 for Gemini 3 Flash/Pro. This is also a technical report backed by
  extensive curated and partly proprietary training data, not a cheap
  enterprise fine-tune.

- [Fin-R1](https://arxiv.org/abs/2503.16252) combines SFT and GRPO on
  Qwen2.5-7B using 60,000 financial-reasoning examples distilled from
  DeepSeek-R1. Its 75.2 average exceeds Qwen2.5-32B at 73.8 and approaches
  DeepSeek-R1 671B at 78.2. The later FinED-Bench paper finds that Fin-R1
  performs very poorly on financial-document error detection, demonstrating
  that strong performance does not transfer automatically even within the
  same nominal domain.

### Supporting evidence without a current frontier comparison

- [A Budget Recipe for Finetuning a Long-form Legal Summarization
  Model](https://aclanthology.org/2025.justnlp-main.11/) uses LoRA SFT followed
  by reinforcement learning on Qwen3-4B-Instruct-2507. The base score of 16.15
  rises to 24.55 after SFT and 32.71 internally after RL; the submitted model
  ranks first in L-SUMM. The successful run used about 35 A100 hours, reported
  as roughly $50. There is no frontier baseline and evaluation is mainly
  automated.

- [Distillation and Refinement of Reasoning in Small Language Models for
  Document Re-ranking](https://arxiv.org/abs/2504.03947) trains a
  Llama-3.2-3B reranker with QLoRA, SFT, and RL using a 70B teacher. It reaches
  27.4 nDCG@10 on BRIGHT, beats its teacher, and trails only much larger or
  ensemble systems. Removing generated explanations reduces the score to
  14.4. Additional RL can overfit easier domains.

- [German medical continual
  pretraining](https://aclanthology.org/2026.acl-long.17/) improves
  Qwen2.5-7B from 59.08 to 65.28 on the medical benchmark average and raises
  its pairwise win rate against a 24B base model from 9% to 31%. It closes but
  does not eliminate the gap. This training regime used 64–128 A100s and tens
  of billions of tokens, showing why consumer inference and consumer training
  must be treated separately.

### Adjacent customer-support evidence

[Winning Big with Small
Models](https://aclanthology.org/2025.gem-1.62/) self-trains Llama-3-8B with
hard negative examples for product support. It reports FactScore 0.9461 versus
0.9323 for GPT-4o and fewer hallucinations on a small challenge set. Because
the overall system uses RAG and covers a single product manual, this is useful
but not clean adaptation-only evidence.

### What this means for an enterprise case

The best initial demonstrations are likely to be search relevance and
reranking, classification and routing, structured compliance extraction,
document error detection, natural-language-to-DSL or API generation, claim
verification against supplied evidence, and template-constrained
summarization. These workflows have stable outputs and defensible evaluation
metrics. A generic private financial, legal, or medical assistant is much
harder to justify empirically.

The evaluation should compare the untuned base SLM, adapted SLM, a current
frontier model under the same retrieval/tool conditions, and the existing
human or automated workflow. It should use chronological and tenant-held-out
data; include hard-negative and distribution-shift subsets; measure severe
errors, calibration, abstention, and format validity as well as average task
quality; and report p50/p95 latency, sustained throughput, VRAM, and fully
loaded cost per 1,000 tasks. A predefined non-inferiority threshold is more
useful than a generic arena score—for example, no more than two percentage
points below the frontier system while reducing cost by 80% and meeting a
two-second p95 latency target.

## Human task: complete the reading list

The repository owner should read the following papers in this order and add
short notes beneath each item capturing: confidence in the evaluation,
relevance to the intended enterprise use case, important confounders, and any
claim suitable for citation in a published notebook article.

- [ ] [Enterprise search relevance
  labelers](https://arxiv.org/abs/2601.03211) — clearest combined quality,
  throughput, and cost case.
- [ ] [Biomedical claim
  verification](https://aclanthology.org/2026.bionlp-1.57/) — direct GPT-5
  comparison and an instructive cross-domain failure.
- [ ] [FinED-Bench](https://aclanthology.org/2026.findings-acl.1481/) — current
  Qwen3 enterprise-document example.
- [ ] [Production DSL generation](https://arxiv.org/abs/2604.09952) — closest
  to a deployed enterprise automation workflow.
- [ ] [MedGemma 1.5](https://arxiv.org/abs/2604.05081) — clearest illustration
  of narrow superiority alongside broad-reasoning weakness.
- [ ] [Small Models Struggle to Learn from Strong
  Reasoners](https://aclanthology.org/2025.findings-acl.1301/) — important
  constraint on distillation into models below roughly 3B.
- [ ] [Distillation Scaling Laws](https://arxiv.org/abs/2502.08606) — economic
  and compute guidance for deciding whether a teacher-based approach is
  justified.

## Questions for the human review

1. Which one or two enterprise workflows should become the notebook's primary
   case studies?
2. Is performance relative to GPT-4o sufficient evidence, or should the final
   article require GPT-5/Gemini 3/Claude-era comparisons?
3. What non-inferiority margin, latency target, and cost reduction would make
   an on-premises SLM commercially compelling?
4. Should studies using RAG as part of the evaluated system be excluded
   entirely, or retained when adaptation is the experimental variable?
5. Which results are credible enough to reproduce locally?

## Definition of done

- The human reading checklist is complete and includes a short assessment for
  every paper.
- One or two enterprise workflows have been selected for deeper study.
- The required frontier baselines and operational success thresholds have
  been written down.
- The evidence has been converted into one or more draft notes under
  `content/notes/`, with claims tied to primary sources rather than copied
  uncritically from this task.
