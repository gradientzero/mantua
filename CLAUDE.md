# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
uv sync                                  # create .venv, install core stack (CPU torch)
uv run mantua train                      # tiny end-to-end pipeline; prints a run report
uv run pytest                            # full suite (e2e + caching); ~15s
uv run pytest tests/test_pipeline.py::test_caching_short_circuits_recompute  # single test
uv run pytest -m nightly                 # the regression-gate test only
uv run ruff check .                      # lint (matches CI)
uv run ruff format .                     # format
uv run pyright                           # type-check
```

- The `recipes` extra (`uv sync --extra recipes`) pulls the full training/eval stack (TRL,
  accelerate, datasets, lm-eval). The tiny run does **not** need it; keep it out of the core path.
- Local runs are hermetic and server-less: `mantua.cli` / `tests/conftest.py` call
  `mantua._local.configure_local()` **before** importing Prefect to pin all state under
  `$MANTUA_HOME` (default `./.mantua`) and use Prefect's ephemeral server (no `prefect server start`).
- Tests share one registry via a temp `$MANTUA_HOME`, so a test needing a guaranteed cache miss
  must vary its config (e.g. bump `seed`) rather than assume a cold cache.

## Where things live

- `src/mantua/config.py` — frozen Pydantic stage configs + evaluation outputs (typed I/O).
- `src/mantua/registry/` — `blobstore.py` (content-addressed store), `lineage.py` (SQLite graph +
  stage-cache index), `__init__.py` (`Registry`, `Artefact`, `get_registry()`).
- `src/mantua/caching.py` — `stage_cache_key()`: the input-identity hash.
- `src/mantua/training.py` — the actual tiny PyTorch/transformers training + eval (no registry/Prefect).
- `src/mantua/stages.py` — `run_stage()` (cache→compute→register+lineage) and the six stages.
- `src/mantua/pipeline.py` — Prefect `@flow`/`@task` composition (`train`, `pre_train`, `post_train`).
- `src/mantua/configs.py` — `tiny()`, the downscaled recipe CI runs.
- `src/mantua/experiments.py` — the 2×2 LR sweep (sweeps-as-code; caching collapses redundant work).

**Layering rule:** `training.py` is pure compute over local dirs (no registry, no Prefect).
`stages.py` adds caching + artefacts/lineage. `pipeline.py` adds orchestration. Keep those seams —
it's what lets stages be unit-tested without Prefect and lets storage/execution backends swap out.

## Status

Scaffolded and green: `uv run pytest`, `uv run ruff check .`, and `uv run mantua train` all pass.
The pipeline is real but downscaled — see the **Tech stack** note on DPO standing in for online RL.

## Tech stack

Decided for a **reference / single-box** target: the system must run end-to-end on one machine (CPU or a single GPU) with tiny models and data subsets, with PR-CI completing in minutes. Grow to multi-GPU / cluster later without a rewrite.

| Layer | Choice | Role |
|---|---|---|
| Language / typing | Python 3.12+, Pydantic | Typed stage configs & outputs (the "typed inputs/outputs" principle) |
| Workflow engine | Prefect | `@flow`/`@task` are pipeline stages; provides caching, retries, durable execution, spawn/gather, UI |
| Artefact registry | Custom & thin: content-addressed blob store (local FS via `fsspec`, S3-swappable) + SQLite metadata/lineage | Immutable versioned artefacts + the lineage graph |
| Training | transformers + TRL + accelerate + datasets | SFT, DPO/GRPO, pre-training loop |
| Eval | Small custom suite for CI; lm-eval-harness optional for real evals | Fast PR-CI evals + nightly regression checks |
| Tooling | uv, ruff, pyright, pytest | Env/deps, lint+format, type-checking, tests |
| CI | GitHub Actions | Downscaled end-to-end run per PR; larger nightly run |

**Prefect vs. the registry — division of responsibility.** Prefect's task caching and its "artifacts" feature are *not* a full lineage graph, so responsibilities are split deliberately:

- **Prefect owns execution** — what runs, ordering, concurrency (`.submit()` + async), retries, durable resume, and short-circuiting via `cache_key_fn`.
- **The registry owns identity & lineage** — every artefact (data, tokeniser, checkpoint, eval result) is content-addressed and immutable; each run writes lineage edges (artefact → run → artefact) into SQLite.

Stage caching is wired through Prefect's `cache_key_fn`, and the cache key MUST be derived purely from the hashed input config plus upstream artefact versions — this is the concrete implementation of the "caching by input identity" invariant. Keep storage behind `fsspec` and execution behind Prefect so scaling to multi-GPU/cluster is a config change, not a rewrite.

## What Mantua is

Mantua is a **model factory**: an implementation of the entire LLM training pipeline (pre-training → post-training → evaluation) as ordinary, version-controlled, imperative code. This approach is called **Model Training as Code (MTaC)**.

It is a from-scratch implementation of the ideas in Aleph Alpha's "Model Training as Code" blog post (their internal system is codenamed *Savanna*; see https://aleph-alpha.com/en/blog/model-training-as-code/). The name *Mantua* refers to the Italian fortress fought over during Napoleon's Italian campaign (https://de.wikipedia.org/wiki/Mantua) — a factory/fortress that gets contested and iterated on.

The goal is to turn model training from a manual, Slack-and-filesystem-coordinated process into a collaborative software project where an end-to-end run is **hermetic and launchable with one click**.

## Core design principles

These are the non-negotiable properties the system exists to provide. When designing any component, check it against these:

1. **Composability** — Every pipeline stage is a function with typed inputs and typed outputs. Stages compose into an end-to-end pipeline. Editing the pipeline means editing a function; sweeps and repeated work are expressed as loops over a parameterized call to that function. The canonical shape:
   ```
   async post_train(config: PostTrainConfig) -> PostTrainEvaluation:
       sft_checkpoint = await sft(config.sft)
       sft_eval       = spawn evaluate(config.eval, sft_checkpoint)
       rl_checkpoint  = await rl(config.rl, sft_checkpoint)
       rl_eval        = spawn evaluate(config.eval, rl_checkpoint)
       return PostTrainEvaluation(await sft_eval, await rl_eval)
   ```
2. **Consensus** — `main` is the team's collective best understanding of how to train the model. The code contains the *full* training recipe: there is no out-of-band setup to reconstruct and no flag to forget when launching a run. Triggering CI on `main` trains the current best model.
3. **Provenance** — Decision lineage lives in code comments and commit history (`git blame`). Artefact lineage (which data/tokeniser/checkpoint produced which model) lives in a registry, not in Slack. Past runs are reproducible by checking out the commit that produced them.

## Architectural invariants

Hold these as hard constraints when implementing:

- **Hermetic runs.** A run depends only on (a) the pinned code commit and (b) versioned, immutable artefacts. No mutable global state, no manual filesystem munging, no "remember to set this flag."
- **Immutable, versioned artefacts.** Data, models, and tokenisers are immutable and versioned in a registry. A run references artefacts by version; the same reference always yields the same bytes. Cleanup policies operate on the registry.
- **Artefact lineage graph.** Every run links its referenced artefacts, logs, metrics, evaluation results, and resulting checkpoints. "Which models were trained on dataset X" is answered by traversing this graph.
- **Caching by input identity.** The workflow engine recognises when a stage has identical inputs to a prior stage and reads from cache instead of recomputing. This is what makes multi-axis sweeps tractable (e.g. a 2×2 SFT-LR × RL-LR sweep runs SFT twice, not four times). Stage identity must be a pure function of its inputs.
- **Stages emit intermediate checkpoints.** Long pre-training / RL jobs emit and evaluate checkpoints incrementally so a run can be resumed and observed mid-flight, and resumption is low-risk because there is no setup to reconstruct.

## How runs are meant to work (target model)

- **CI is the entrypoint for training.** Trigger a run by pushing to a branch or launching from the UI. PR CI runs a small-scale end-to-end training run fast (target: minutes) for confidence; a larger nightly end-to-end run asserts a measurable eval improvement to catch semantic regressions.
- **Experiments = branches.** Trying a new dataset, hyperparameter, pipeline step, environment, or sharding topology means editing the relevant config/function on a branch and running CI. If evals improve, merge to `main`.
- **Sweeps = code.** Because the pipeline is a function, a sweep is a nested loop that calls it with different parameterizations and `gather`s the results into a report. Rely on input-identity caching to avoid combinatorial blow-up.

## Working conventions

- **Trunk-based development.** Land changes on `main` as soon as they can in small increments. Avoid long-lived branches — accumulating changes off-trunk re-introduces the integration debt MTaC exists to eliminate.
- **Capability-based ownership is the eventual target.** MTaC enables teams to own a model *behaviour* (e.g. multilinguality) end-to-end — its SFT data, RL environments, and eval suites — rather than owning a temporal stage. Prefer designs that let one person/team run the *whole* pipeline, not just their slice.
- **Pipeline changes are code reviews.** Treat a change to the recipe like any other code change: typed, tested (downscaled/subset runs), reviewed, merged.
