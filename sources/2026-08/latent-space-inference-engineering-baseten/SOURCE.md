# Source record

- **Item**: `Latent Space Podcast - Aug 03 2026` (no file extension — preserved exactly as dropped)
- **Title**: "The Inference Engineering Masterclass" — Philip Kiely & Ali Taha, Baseten
- **Origin**: external — the Latent Space podcast, ASR transcript of a ~2h conversation
- **URL**: not captured with the item; the episode is Latent Space, 3 August 2026
- **Published**: 2026-08-03, per the item's own first line
- **Captured**: 2026-08-17 (file mtime; the episode date is in the title)
- **Ingested**: 2026-08-17
- **Provenance**: **captured external material**, processed as `origin: agent` notes despite
  arriving in `inbox/mine/` — see below. No prose republished. Notes start as `status: draft`.

## Provenance: the folder hint was overridden

The item was dropped in `inbox/mine/`, which per `inbox/README.md` means "I wrote this" and would
make it an `origin: human` note bylined Wolfgang Gross with its wording preserved.

It is not the owner's writing. It is a transcript of a podcast episode — the item's own first four
lines are the show name, the episode date, the episode title with two named guests, and the show's
promotional blurb, and the body is a two-person interview conducted by a host who is neither of
them. Following the folder hint would have published Latent Space's episode under the owner's name.

So the hint was overridden, exactly as it was for the Aleph Alpha article on 2026-08-10 and
Heimann's book on 2026-08-14. The rule those two established, and which this is the third
application of: **evidence inside the item beats the folder, and the override only ever runs *away*
from `origin: human`, never toward it.** An agent may decline to claim the owner's byline; it may
never claim it for him. Nothing in the file argues against the reading — no frontmatter, no
commentary, no owner's voice anywhere in it — so this is very probably a drop into the wrong folder
and there is nothing to undo. It is flagged in `tasks/2026-08-17-third-misfile-into-inbox-mine.md`
because three in eight days is a pattern about the contract rather than three accidents.

## What was archived

The file verbatim, byte for byte, including its lack of an extension. No transformation of any kind
was applied — unlike the Greenblatt capture, there was no second rendering to reconcile and no
speaker map to extract, because this transcript has none.

## Defects in the capture

Recorded because several of them constrain what could be taken from the source.

**No speaker labels at all.** The transcript is an undifferentiated stream of turns. There are two
guests plus at least one host, and in several stretches three voices alternate. Attribution on the
wiki pages was reconstructed from content — Kiely is the book's author and speaks in systems and
business framing, Taha speaks in kernels and GPU internals — plus the handful of places where one
addresses the other by name ("Maybe, Ali, you should take it from here"). **This is inference, not
transcription**, and it is declared as such on `inference-engineering-baseten`. Several exchanges
were deliberately left unattributed on the wiki because the passage did not settle it.

**Term and name damage**, corrected silently on the wiki where unambiguous:

| In the transcript | Read as |
|---|---|
| Base 10, Basen, Space 10, base 10's | Baseten |
| influence, influence engineering | inference, inference engineering |
| spec deck, spec tech, SPECTAC | spec dec (speculative decoding) |
| NVFP4 / NVFV4 / NVFE4 / MP | NVFP4 |
| KL Diversions | KL divergence |
| logic distribution | logit distribution |
| sports attention | sparse attention |
| CRTLM, TRTL, RTLM | TensorRT-LLM |
| Nixle | NIXL |
| Qtile, QTSL | CuTe / CuTe DSL |
| auto-aggressive, ultra-aggressive, autoaggressive | autoregressive |
| 4 ATP, 4 ATP video | 480p |
| Rubens, Rubin, Ruben | Ruben (the NVIDIA generation) |
| Kimmy, Kimi K | Kimi |
| Kwan, QuenImage, 1.2 / 1.2.2 / 1.2.7 | Qwen / Wan (see below) |
| Tridao | Tri Dao |
| Vivo | (unresolved — "asking what happens when you type Google into the browser") |
| Engram (in "524 on Engram") | n-gram speculative decoding |
| Harry / Haley (same person, same anecdote) | one engineer, name unresolved |
| Strix | (unresolved, addressed as a person in the room) |

**Referents that could not be resolved at all**, and were omitted from the wiki rather than guessed:
"deflash, despark" as newer speculative-decoding techniques; a hardware company rendered "talus";
"Edge and Maddox" in the wafer-scale comparison; a person called "Cero" whose podcast Kiely
mentions; "the still paper" on KV compaction; "TurboQuantum" (used once, "TurboQuant" thereafter,
and read as TurboQuant).

**Passages that collapse mid-sentence.** Several turns terminate into unrelated text — the Ruben
speculation ("Obviously, we're continuing some We'll see you next time. Or memory bandwidth"), the
Andrew Lo stat-arb analogy, and part of the closing continual-learning argument ("That's not
changing." ×4). Nothing on the wiki reconstructs any of them.

**Ambiguous model naming.** The Wan video models are rendered as bare version numbers ("1.2",
"1.2.2", "1.2.7") and once as "Kwan". The wiki refers to "Wan" with the version omitted where the
number was not stable. Model names in the source's own present — GLM-5.2, Kimi K2.5/K3, Minimax M3,
DeepSeek V4, Gemma, Mercury, Diffusion Gemma, Grok Imagine, Kling, Veo, Nano Banana — are treated
as real releases rather than ASR artefacts, unlike the unverifiable frontier names on the Greenblatt
capture. Nothing on the wiki depends on the mapping.

**One claim is unverifiable and load-bearing.** The Baseten quantisation research — quantisation
errors cancelling, predictable in advance, 20% more of GLM-5.2 quantised at better quality — is
attributed in the transcript to an intern named Joshua and a paper "originally 72 pages, now 39".
Neither the paper nor the tweet thread they try to pull up on-camera is in the capture. The wiki
states it as reported and flags it as the claim most wanting independent verification.

## Why this arrived, and what it opened

Unprompted capture. It is the notebook's first source about **the layer between a released
checkpoint and a served endpoint** — everything before it treated inference as something you buy or
something you run, and tokens-per-second as a property of the model. It is also the first source
here from a vendor of infrastructure rather than a lab, a buyer, or a researcher, and the first to
cover modalities other than text.

## Wiki pages touched

New (all `status: draft`, all `origin: agent`):

- `content/notes/inference-engineering-baseten.mdx` — the source note: the request path, the four
  optimisations and what each is worth, the quantisation-errors-cancel claim and the KL-divergence
  method, the mode-collapse diagnosis, what supporting a new model actually costs, composing models
  out of frozen parts, hardware and the ASIC disagreement, and local-versus-datacenter inference.
- `content/notes/diffusion-versus-autoregressive-generation.mdx` — the paradigm split by modality,
  the video token arithmetic, the open/closed gap being per-modality with a feedback loop behind it,
  and the argument that text diffusion is marketed as the wrong product.
- `content/notes/training-and-inference-are-merging.mdx` — rollouts bottlenecking RL,
  quantisation-aware distillation, the GLM-5.2-writing-its-own-kernels loop, and continual learning
  as a KV-cache problem rather than a weights problem.

Updated:

- `content/notes/model-speciation-and-touching-the-weights.mdx` — composition at the serving layer
  as a third option between context windows and fine-tuning (frozen encoder + frozen backbone +
  trained projector; layer transplants), and the correction that Karpathy's six-to-eight-month
  open/closed gap was a claim about text.
- `content/notes/recursive-self-improvement-greenblatt.mdx` — the kernel loop as the first instance
  in the notebook of the recursion closing outside a lab and outside a demo, with the uncontrolled
  confounder attached.
- `content/notes/learning-from-deployment.mdx` — what changes and what does not if continual
  learning routes through the cache rather than through gradients.
- `content/notes/auto-research.mdx` — an instance running at an ordinary company, and a metric
  (a profiling trace) that is the goal rather than a proxy for it.
- `content/notes/benchmarking-your-own-agent-spend.mdx` — the token price is not a property of the
  model either: 2–4× on identical hardware, and rent-the-box beating per-token past some volume.
- `content/notes/dashbench-measuring-a-code-review-agent.mdx` — what "run it more than once" is
  actually averaging over, given non-deterministic temperature 0 and cluster-dependent kernel races.

Pages linked to but **not edited**, because they are `origin: human` or `origin: mixed` and the
2026-08-14 precedent is that agent ingests do not touch the owner's prose:
`serving-slms-on-a-desktop-gpu`, `llm-customization-and-fine-tuning-notes`, `command-over-tokens`.
The local-versus-datacenter framing and the TurboQuant example both bear directly on the desktop
page and are recorded on the new pages instead, with links back.

## Things deliberately left out

- **The opening banter** about the "Waterloo intern" handle (~1.5 minutes), except where the running
  joke reappears as the worked example in the continual-learning argument, which is why the wiki
  mentions Waterloo at all.
- **Book promotion.** The episode repeatedly references Kiely's *Inference Engineering* book and its
  section numbers (5.2.2 Medusa, 5.2.3 Eagle, 5.2.4 n-gram). The techniques are used; the book's
  marketing and the closing exchange about it are not content.
- **The images shown on camera.** Several passages describe diagrams the guests pull up — a
  parallelism chart, the sparse-attention visualisation, a Ruben spec sheet, the quantisation
  thread. None are in the capture and none were reconstructed. **No images copied**: the item
  arrived as a single text file with no assets.
- **The $13B Series F**, mentioned in the show blurb, which is context for why the guests were
  invited rather than a claim the notebook has any use for.
