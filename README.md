# Mantua

A **model factory**: the whole LLM training pipeline (pre-training → post-training → evaluation)
implemented as ordinary, version-controlled, imperative code — an approach called
**Model Training as Code (MTaC)**. It's a from-scratch take on the ideas in Aleph Alpha's
["Model Training as Code"](https://aleph-alpha.com/en/blog/model-training-as-code/) post
(their system is *Savanna*). The name is the [Italian fortress](https://de.wikipedia.org/wiki/Mantua)
contested during Napoleon's Italian campaign.

See [CLAUDE.md](CLAUDE.md) for the design principles and architectural invariants.

## Quickstart

```bash
uv sync                 # create .venv and install the core stack (CPU torch)
uv run mantua train     # run the tiny end-to-end pipeline; prints a run report
uv run pytest           # end-to-end + caching tests
uv run ruff check .     # lint
```

The default `mantua train` run is deliberately tiny (a ~2-layer GPT-2 on a few KB of bundled
text) so the full pipeline — tokenizer → pre-train → SFT → RL(DPO) → eval, twice — completes on
CPU in well under a minute. That's the point: PR-CI trains a model end-to-end for confidence.

## Usage

This section covers the tool's usage surfaces in depth — the CLI, writing recipes, composing
pipelines, sweeps, inspecting the registry, and testing/CI. Every example below was actually
executed against this repository (using an isolated `MANTUA_HOME` where relevant) rather than
hand-written.

### Running the pipeline (CLI)

The `mantua` command (defined in `src/mantua/cli.py`) is the single entrypoint for launching a
run:

```
mantua [--home DIR] train
```

`train` is currently the only subcommand. It builds the downscaled recipe from
`mantua.configs.tiny()` and hands it to the `train` Prefect flow in `mantua.pipeline`, then prints
a run report.

#### `MANTUA_HOME` / `PREFECT_HOME` and server-less runs

Before anything else runs, `main()` calls `configure_local(args.home)` from `src/mantua/_local.py`.
This call **must** happen before Prefect is imported (Prefect reads its configuration at import
time), which is why `cli.py` imports `configure_local` at module scope but defers
`from .pipeline import train` to inside `main()`, after `configure_local` has run.

`configure_local` resolves one root directory — `--home DIR` if given, else `$MANTUA_HOME`, else
`./.mantua` — and derives everything else from it:

- `MANTUA_HOME` is set to that resolved root. This is where the artefact registry lives: the
  content-addressed `blobs/` directory (`mantua/registry/blobstore.py`) and the `lineage.db`
  SQLite graph of runs/artefacts/edges/stage-cache (`mantua/registry/lineage.py`).
- `PREFECT_HOME` is set (via `setdefault`, so an explicit env var wins) to `<root>/prefect`. This is
  where Prefect keeps its own SQLite database (`prefect.db`) for flow/task run tracking.
- `PREFECT_SERVER_ALLOW_EPHEMERAL_MODE=true` and a generous
  `PREFECT_SERVER_EPHEMERAL_STARTUP_TIMEOUT_SECONDS=120` are also set (again via `setdefault`).

The ephemeral-mode setting is what makes runs **server-less**: Prefect spins up its API server
in-process on first use and tears it down afterward. There is no `prefect server start` step, no
separate process to manage, and no networked service to stand up — "hermetic, one-click" per the
project's design principles. Both directories are created upfront because Prefect will not create
`PREFECT_HOME` itself before opening its database there.

Because `MANTUA_HOME` defaults to `./.mantua` (a path relative to the current directory), any
run that doesn't pass `--home` and doesn't set `$MANTUA_HOME` will read/write the repo's local
`./.mantua` registry. Passing `--home <tmpdir>` (or setting `$MANTUA_HOME`) is how you get an
isolated, disposable registry for a one-off or test run.

#### Example: default run

```
$ MANTUA_HOME=$(mktemp -d) uv run mantua train

=== Mantua run report ===
pretrain checkpoint : 1e4b4b5275f907904f97db7d9672712e
SFT checkpoint 3b1d926cdfcb…  perplexity= 128.534  format_adherence=1.00  (n=2)
RL  checkpoint 339367d2459e…  perplexity= 139.147  format_adherence=1.00  (n=2)
=========================
```

#### Example: explicit `--home`

```
$ TMPHOME=$(mktemp -d) && uv run mantua --home "$TMPHOME" train

=== Mantua run report ===
pretrain checkpoint : 1e4b4b5275f907904f97db7d9672712e
SFT checkpoint 3b1d926cdfcb…  perplexity= 128.534  format_adherence=1.00  (n=2)
RL  checkpoint 339367d2459e…  perplexity= 139.147  format_adherence=1.00  (n=2)
=========================
```

Inspecting `$TMPHOME` afterward confirms what `configure_local` promised:

```
$ ls "$TMPHOME"
blobs  lineage.db  prefect

$ ls "$TMPHOME/prefect"
prefect.db  prefect.db-shm  prefect.db-wal
```

`blobs/` and `lineage.db` are the artefact registry; `prefect/prefect.db*` is Prefect's own
ephemeral-server state. No `prefect server start` was run, and no state leaked outside the
directory passed via `--home`.

#### Reading the run report

`_print_report` in `cli.py` formats the `TrainResult` returned by the `train` flow:

- **`pretrain checkpoint`** — the full content-addressed artefact id (the blobstore hash) of the
  checkpoint produced by the pre-training stage. Every other stage in the run descends from this
  artefact in the lineage graph.
- **`SFT checkpoint <id>…`** / **`RL  checkpoint <id>…`** — the first 12 characters of the
  checkpoint artefact id produced by the SFT stage and the RL/DPO stage respectively (both branch
  from the same pretrain checkpoint; see `post_train` in `mantua/pipeline.py`).
- **`perplexity`** — the evaluation stage's perplexity metric for that checkpoint on the eval set;
  lower is better. It is expected (and seen above) that SFT and RL perplexity differ since they're
  different checkpoints evaluated independently.
- **`format_adherence`** — fraction of eval samples whose output matched the expected output
  format (e.g. well-formed structure), from 0.0 to 1.00.
- **`(n=…)`** — number of eval samples the metrics above were computed over (small here because
  `tiny()` downscales everything for a fast CI-friendly run).

Each run is reproducible: the printed ids are content hashes, so re-running the same commit against
a fresh `--home` reproduces identical checkpoint ids (barring any non-determinism in the underlying
training code), and the full lineage — which config and inputs produced each id — is recorded in
that home's `lineage.db`.

### Writing and modifying a recipe

A **recipe** is nothing more than a `TrainConfig` value. `TrainConfig` composes the two halves of
the pipeline:

```
TrainConfig
├── pretrain:    PreTrainConfig   (data, tokenizer, model, steps, batch_size, lr, seed)
└── post_train:  PostTrainConfig
    ├── sft:  SFTConfig   (data, steps, batch_size, lr, seed)
    ├── rl:   RLConfig    (data, steps, batch_size, lr, beta, seed)
    └── eval: EvalConfig  (data, max_samples)
```

Every one of these is a Pydantic `BaseModel` subclassing a shared `_Frozen` base
(`src/mantua/config.py`) with `model_config = ConfigDict(frozen=True)`. Frozen means the models
are immutable after construction — attempting `some_config.steps = 999` raises a
`pydantic.ValidationError` instead of silently mutating shared state. This is not just defensive
style: `stage_cache_key()` (`src/mantua/caching.py`) hashes a stage's config to decide whether a
cached result can be reused, so a config that could change out from under a running or cached
stage would silently corrupt the cache. Frozen models make every config value stable for the
lifetime of the object, which is exactly what a deterministic hash needs.

`src/mantua/configs.py` defines `tiny()`, the downscaled recipe that CI runs end-to-end on CPU: a
2-layer/2-head/32-embd GPT-2, 30 pretrain steps, 20 SFT steps, 10 RL (DPO) steps, reading its four
data files (`corpus.txt`, `sft.jsonl`, `preferences.jsonl`, `eval.jsonl`) from `./data/`.

#### Deriving a modified recipe

Because configs are ordinary immutable Pydantic values, you don't edit `tiny()` in place — you
call `.model_copy(update={...})` to get a new, independent config with just the fields you want
changed, leaving the original untouched. Nested changes go through the parent field the same way,
since each level is its own frozen model.

The snippet below starts from `tiny()`, derives a variant with fewer pretrain steps and a higher
pretrain learning rate, confirms the original is unaffected (and provably immutable), and runs the
derived config through `mantua.pipeline.train`.

`mantua.pipeline` imports Prefect at module load time, and `train()` is a Prefect `@flow` (a plain
synchronous call, not a coroutine — there's no `await` here). Before importing it you must call
`mantua._local.configure_local(...)` — the same call `mantua.cli` and `tests/conftest.py` make —
to pin *both* the artefact registry and Prefect's own state under an isolated `MANTUA_HOME`.
Just exporting the `MANTUA_HOME` environment variable and skipping this call is not enough: the
registry does read `$MANTUA_HOME` directly, but Prefect does not, and without `configure_local()`
setting `PREFECT_HOME` for you, a bare interactive run ends up writing tens of megabytes of
Prefect state into your real, global `~/.prefect` instead of the throwaway directory:

```bash
MANTUA_HOME=$(mktemp -d) uv run python -c "
from mantua._local import configure_local
import os
configure_local(os.environ['MANTUA_HOME'])  # must run before importing mantua.pipeline

from mantua.configs import tiny
from mantua.pipeline import train

base = tiny()
fast = base.model_copy(
    update={
        'pretrain': base.pretrain.model_copy(
            update={'steps': 10, 'lr': 1e-2}
        )
    }
)

print('base.pretrain.steps =', base.pretrain.steps, ' fast.pretrain.steps =', fast.pretrain.steps)
print('base.pretrain.lr    =', base.pretrain.lr,    ' fast.pretrain.lr    =', fast.pretrain.lr)
print('base is frozen; mutation raises:')
try:
    base.pretrain.steps = 999
except Exception as e:
    print(' ', type(e).__name__, '-', str(e).splitlines()[0])

result = train(fast)
print('TrainResult.pretrain_checkpoint =', result.pretrain_checkpoint)
print('sft_eval.perplexity =', result.post_train.sft_eval.perplexity)
print('rl_eval.perplexity  =', result.post_train.rl_eval.perplexity)
"
```

Real captured output (Prefect's own progress logging to stderr omitted):

```
base.pretrain.steps = 30  fast.pretrain.steps = 10
base.pretrain.lr    = 0.003  fast.pretrain.lr    = 0.01
base is frozen; mutation raises:
  ValidationError - 1 validation error for PreTrainConfig
TrainResult.pretrain_checkpoint = 3a1d6e7dcd7519345092649fe363c932
sft_eval.perplexity = 163.43494853466305
rl_eval.perplexity  = 162.60482957644152
```

`base` keeps its original `steps=30, lr=0.003` — `model_copy` never touches the source object —
and `fast` carries the overridden `steps=10, lr=0.01` through pretrain, SFT, RL, and both
evaluations without any other part of the recipe needing to change. This is the same pattern
`experiments.learning_rate_sweep` (`src/mantua/experiments.py`) uses to build a sweep: a plain
nested loop over `.model_copy(update={...})` calls, collected into a dict of `train()` results —
today's `learning_rate_sweep` calls `train()` synchronously in-loop rather than spawning the sweep
points concurrently, but it still relies on `stage_cache_key` to skip recomputing any stage whose
config and inputs didn't change between sweep points (e.g. pretrain runs once for the whole 2×2
grid since none of the sweep points touch `pretrain`).

### Composing pipelines: stages vs. flows

Mantua's pipeline code is layered into three files, each adding one concern on top of the last:

- **`src/mantua/training.py`** — pure compute. `train_tokenizer`, `pretrain`, `sft`, `dpo`, `evaluate` take
  local paths/tensors in, write results to a local directory, and return. No registry, no caching, no
  Prefect. This is the layer you'd swap out for the real `transformers`/TRL trainers at full scale.
- **`src/mantua/stages.py`** — adds input-identity caching and artefact bookkeeping. `run_stage()` hashes
  `(stage, config, inputs)` via `stage_cache_key`, checks the registry's cache, and only on a miss does it
  call into `training.py`, register the output directory as an immutable `Artefact`, and record lineage
  edges. `prepare_data`, `train_tokenizer`, `pre_train`, `sft`, `rl`, `evaluate` are still plain Python
  functions — they can be called directly with no Prefect import anywhere in the process.
- **`src/mantua/pipeline.py`** — wraps each `stages.py` function as a Prefect `@task` (with
  `cache_policy=NO_CACHE`, since the registry is already the source of truth for caching) and composes
  them into `@flow`s (`pre_train`, `post_train`, `train`). This layer adds orchestration: retries, a run
  UI, durable execution, and concurrency via `.submit()` — the blog's "spawn."

#### Calling stages directly, no Prefect

The plain functions in `stages.py` can be called like any other Python function. This snippet
calls `prepare_data` and `train_tokenizer` from `mantua.stages` directly, twice, to also show the
cache hit:

```python
import os, tempfile
os.environ["MANTUA_HOME"] = tempfile.mkdtemp()  # isolated, before anything imports Prefect

from mantua.config import DataConfig, TokenizerConfig
from mantua import stages

data_cfg = DataConfig(name="corpus", path="data/corpus.txt")
tok_cfg = TokenizerConfig(vocab_size=512, min_frequency=2)

data = stages.prepare_data(data_cfg)          # plain function call, no flow/task
tokenizer = stages.train_tokenizer(tok_cfg, data)

print("data artefact:", data)
print("tokenizer artefact:", tokenizer)
print("compute counts:", dict(stages.COMPUTE_COUNTS))

# Call it again with an identical config: this should be a cache hit, not a recompute.
data2 = stages.prepare_data(data_cfg)
tokenizer2 = stages.train_tokenizer(tok_cfg, data2)
print("second call compute counts (unchanged -> cache hit):", dict(stages.COMPUTE_COUNTS))
print("same artefact id:", tokenizer.id == tokenizer2.id)
```

Real output (run from the repo root with `uv run python`):

```
data artefact: id='8ca202e67e8ad1ba76023b2d98dea5d0' name='prepare_data' kind='dataset' size=2648
tokenizer artefact: id='581d5251435a2f1d46e9c76f9fc5906f' name='train_tokenizer' kind='tokenizer' size=21033
compute counts: {'prepare_data': 1, 'train_tokenizer': 1}
second call compute counts (unchanged -> cache hit): {'prepare_data': 1, 'train_tokenizer': 1}
same artefact id: True
```

Adding `pre_train` to the same script, timing it, and checking `sys.modules` afterward confirms
Prefect never gets imported on this path:

```python
import time

pretrain_cfg = PreTrainConfig(data=data_cfg, tokenizer=tok_cfg)

t0 = time.time()
checkpoint = stages.pre_train(pretrain_cfg, data, tokenizer)
elapsed = time.time() - t0
print("pre_train checkpoint:", checkpoint)
print(f"elapsed: {elapsed:.2f} s")
print("compute counts:", dict(stages.COMPUTE_COUNTS))
print("no Prefect module involved:",
      "prefect" not in [m.split(".")[0] for m in list(__import__("sys").modules)])
```

```
pre_train checkpoint: id='1e4b4b5275f907904f97db7d9672712e' name='pre_train' kind='checkpoint' size=199295
elapsed: 0.32 s
compute counts: {'prepare_data': 1, 'train_tokenizer': 1, 'pre_train': 1}
no Prefect module involved: True
```

(`elapsed` is just illustrative — expect low tenths of a second on CPU, not an exact number.)

#### Calling the Prefect flow: orchestration and concurrency

`mantua.pipeline.train(cfg)` runs the identical stages, but as a Prefect flow — with subflows for
`pre_train` and `post_train`, task-level retries/observability, and `evaluate.submit(...)` used
twice in `post_train` to run the SFT-checkpoint eval concurrently with RL training (the blog's
"spawn"):

```python
import os, tempfile
os.environ["MANTUA_HOME"] = tempfile.mkdtemp()

from mantua._local import configure_local
configure_local()  # must run before Prefect is imported

from mantua.configs import tiny
from mantua.pipeline import train

result = train(tiny())
print("pretrain_checkpoint:", result.pretrain_checkpoint)
print("sft_eval:", result.post_train.sft_eval)
print("rl_eval:", result.post_train.rl_eval)
```

Real output (equivalently, via `MANTUA_HOME=$(mktemp -d) uv run mantua train`):

```
=== Mantua run report ===
pretrain checkpoint : 1e4b4b5275f907904f97db7d9672712e
SFT checkpoint 3b1d926cdfcb…  perplexity= 128.534  format_adherence=1.00  (n=2)
RL  checkpoint 339367d2459e…  perplexity= 139.147  format_adherence=1.00  (n=2)
=========================
```

These checkpoint ids and eval numbers are fully reproducible run to run (fixed seeds, CPU,
downscaled `tiny()` recipe) — this isn't a cherry-picked sample.

Turning Prefect's own logging up to INFO (`PREFECT_LOGGING_LEVEL=INFO`) shows the orchestration
Prefect adds on top — server start/stop, subflow boundaries for `pre_train`/`post_train`, and
per-task completions:

```
10:34:58.662 | INFO    | prefect - Starting temporary server on http://127.0.0.1:8713
10:35:05.328 | INFO    | Flow run 'amphibian-pronghorn' - Beginning flow run 'amphibian-pronghorn' for flow 'train'
10:35:05.428 | INFO    | Flow run 'funny-worm' - Beginning subflow run 'funny-worm' for flow 'pre_train'
10:35:05.474 | INFO    | Task run 'prepare_data-ef6' - Finished in state Completed()
10:35:05.524 | INFO    | Task run 'train_tokenizer-fd3' - Finished in state Completed()
10:35:05.897 | INFO    | Task run 'pre_train_step-155' - Finished in state Completed()
10:35:06.430 | INFO    | Flow run 'funny-worm' - Finished in state Completed()
10:35:06.509 | INFO    | Flow run 'unyielding-ladybug' - Beginning subflow run 'unyielding-ladybug' for flow 'post_train'
10:35:06.547 | INFO    | Task run 'prepare_data-0e2' - Finished in state Completed()
10:35:06.584 | INFO    | Task run 'prepare_data-4cc' - Finished in state Completed()
10:35:06.754 | INFO    | Task run 'sft-479' - Finished in state Completed()
10:35:06.796 | INFO    | Task run 'prepare_data-57e' - Finished in state Completed()
10:35:07.011 | INFO    | Task run 'evaluate-d2d' - Finished in state Completed()
10:35:07.099 | INFO    | Task run 'rl-da0' - Finished in state Completed()
10:35:07.226 | INFO    | Task run 'evaluate-c5b' - Finished in state Completed()
10:35:07.513 | INFO    | Flow run 'unyielding-ladybug' - Finished in state Completed()
10:35:08.348 | INFO    | Flow run 'amphibian-pronghorn' - Finished in state Completed()
10:35:08.355 | INFO    | prefect - Stopping temporary server on http://127.0.0.1:8713
```

(Flow/task-run name suffixes — `amphibian-pronghorn`, `prepare_data-ef6`, etc. — are randomly
generated per run and won't reproduce; the sequencing and log format are what to look for.)

`evaluate-d2d` (the SFT-checkpoint evaluation, dispatched via `evaluate.submit(...)`) finishes
*before* `rl-da0`, the RL training task that started after it — the two are running concurrently
rather than strictly one after another, exactly the "spawn" behavior the blog post describes.
Re-running the same command confirms this isn't a fluke: in an independent second run, the
SFT-eval task (`evaluate-fa5`) again finishes before the RL task (`rl-651`) started after it.

#### When to use which

Reach for the plain `stages.py` functions in fast unit tests and any code path that shouldn't pull
in a Prefect dependency (e.g. asserting cache behavior via `COMPUTE_COUNTS`, as `tests/test_pipeline.py`
does) — they run in milliseconds with zero orchestration overhead. Reach for the Prefect flows in
`pipeline.py` for anything that is an actual run: `mantua train`, CI, nightly regression checks, and
sweeps — anywhere you want retries, concurrency (`evaluate.submit`), and a run UI on top of the same
cached, lineage-tracked stages.

### Sweeps are code

`src/mantua/experiments.py::learning_rate_sweep(base: TrainConfig)` is not a special "sweep engine"
— it's a plain nested `for` loop over `mantua.pipeline.train`. For each of the 2×2 grid points
(`sft_lr` in `{1e-3, 5e-4}` × `rl_lr` in `{5e-4, 1e-4}`) it derives a new `TrainConfig` via
`model_copy(update=...)` (configs are frozen, so this is the only way to vary one field), calls
`train(cfg)`, and gathers the four `TrainResult`s into a `dict` keyed by `(sft_lr, rl_lr)`. There is
no sweep-specific plumbing: it's the same `train` function anyone calls for a single run, invoked
four times with four parameterisations, exactly matching the "sweeps are loops over a parameterised
call" principle in `CLAUDE.md`.

The interesting part isn't the loop, it's what *doesn't* get recomputed. Because `pre_train` and
`sft` only depend on `cfg.pretrain` and `(base_checkpoint, sft_data)` respectively — and the
pretrain config, pretraining data, and pretraining tokenizer are identical across all four grid
points — the cache key for `pre_train` (`hash(stage + config + upstream artefact versions)`, see
`stage_cache_key` in `src/mantua/caching.py`) is identical on all four calls. `sft`'s cache key
varies only with `sft_lr` (two distinct values), so it has exactly two distinct keys. `rl` varies
with `rl_lr` and also depends on the SFT checkpoint, so its key differs on all four points. Net
result across the 2×2 grid: pre-training runs once, SFT runs twice, RL and evaluation run four
times each — not sixteen or eight-times-redundant pretraining.

#### Verifying the cache-hit claim cheaply

Rather than running the full sweep to prove this, the cheapest possible demonstration is calling
`mantua.stages.pre_train` twice with byte-identical config/inputs in an isolated `MANTUA_HOME` and
watching `mantua.stages.COMPUTE_COUNTS["pre_train"]` — the module-level counter that only
increments on a real cache-miss compute:

```python
import os, tempfile
os.environ["MANTUA_HOME"] = tempfile.mkdtemp(prefix="mantua-cache-demo-")

from mantua import stages
from mantua.configs import tiny

cfg = tiny()
data = stages.prepare_data(cfg.pretrain.data)
tokenizer = stages.train_tokenizer(cfg.pretrain.tokenizer, data)

ckpt1 = stages.pre_train(cfg.pretrain, data, tokenizer)
count_after_first = stages.COMPUTE_COUNTS["pre_train"]

ckpt2 = stages.pre_train(cfg.pretrain, data, tokenizer)  # same config, same inputs
count_after_second = stages.COMPUTE_COUNTS["pre_train"]

assert ckpt1.id == ckpt2.id
assert count_after_second == count_after_first
print("after 1st pre_train call -> artefact id:", ckpt1.id, "| pre_train compute count:", count_after_first)
print("after 2nd pre_train call -> artefact id:", ckpt2.id, "| pre_train compute count:", count_after_second)
```

Actual output from running this (isolated `MANTUA_HOME`, real registry, no mocking; note the
snippet above needs the two `print` calls added to actually emit this — the asserts alone are
silent):

```
after 1st pre_train call -> artefact id: 1e4b4b5275f907904f97db7d9672712e | pre_train compute count: 1
after 2nd pre_train call -> artefact id: 1e4b4b5275f907904f97db7d9672712e | pre_train compute count: 1
```

The second call returned the exact same artefact id and did not increment `COMPUTE_COUNTS`,
confirming it was served from `reg.cache_get(key)` in `run_stage` (`src/mantua/stages.py`) rather
than recomputed. `configure_local()` (called by the CLI/tests before importing Prefect) is not
required for this narrow demo — `get_registry()` and `BlobStore`/`Lineage` create `$MANTUA_HOME`'s
subdirectories themselves — so setting `MANTUA_HOME` directly is sufficient here.

#### The real sweep, timed

For completeness, an actual `learning_rate_sweep(tiny())` run (isolated `MANTUA_HOME`, Prefect
ephemeral server, CPU) took roughly 19-20s for the 4 grid points across repeated runs (expect
low-20s variance run to run) and produced 1 distinct pretrain checkpoint artefact id
(`1e4b4b5275f907904f97db7d9672712e`) shared by all four `TrainResult`s. A representative
`stages.COMPUTE_COUNTS` after one run:

```
{'prepare_data': 4, 'train_tokenizer': 1, 'pre_train': 1, 'sft': 2, 'evaluate': 6, 'rl': 4}
```

`pre_train: 1` and `sft: 2` are exactly the collapsed counts predicted above, versus `train` being
called 4 times and `rl`/`evaluate` recomputing on every grid point since their cache keys (RL
learning rate, and downstream checkpoint identity) differ across all four points. `train_tokenizer`
also collapses to 1 for the same reason as `pre_train` — same data, same tokenizer config.

`prepare_data` is the one count that is not reliably 4: repeated runs showed 4 most often but
occasionally 5 or 6. All four grid points request the same four source files, so the floor is 4
distinct computes, and `evaluate` is dispatched via `.submit()` (a background Prefect task) — when
a submitted `evaluate` from one grid point is still draining while the next grid point's `train()`
call starts, two `prepare_data` calls for the same file can race the registry's read-then-write
cache check and both miss, each doing a harmless (idempotent, content-addressed) recompute instead
of one of them getting a cache hit. So don't read `prepare_data`'s count as proof of anything — the
caching story here rests on `pre_train`, `sft`, `rl`, and `evaluate`, which were stable at 1, 2, 4,
and 6 respectively across every run observed.

### Inspecting artefacts and lineage

Mantua's registry (`src/mantua/registry/__init__.py`) has two halves: a content-addressed
`BlobStore` for artefact *contents*, and a SQLite-backed `Lineage` graph
(`src/mantua/registry/lineage.py`) for artefact *metadata and provenance*. `Registry.register()`
writes a stage's output directory into the blob store (keyed by its content hash), then records
that hash as an artefact row and adds `produced`/`consumed` edges linking the run to it and to its
inputs. `Lineage.descendants_of(artefact_id)` answers "what was built from this?" by joining the
`edges` table against itself: find runs that *consumed* the given artefact, then return everything
those same runs *produced*.

The snippet below sets an isolated `MANTUA_HOME`, runs `prepare_data` then `train_tokenizer` from
`mantua.stages`, and inspects the resulting lineage:

```python
import os
import tempfile
from pathlib import Path

# Isolated MANTUA_HOME, set BEFORE anything that imports mantua._local / Prefect.
home = tempfile.mkdtemp(prefix="mantua-home-")
os.environ["MANTUA_HOME"] = home
print("MANTUA_HOME =", home)

from mantua.config import DataConfig, TokenizerConfig
from mantua.stages import prepare_data, train_tokenizer
from mantua.registry import get_registry

data_cfg = DataConfig(name="corpus", path=str(Path("data/corpus.txt").resolve()))
tok_cfg = TokenizerConfig(vocab_size=512, min_frequency=2)

dataset = prepare_data(data_cfg)
tokenizer = train_tokenizer(tok_cfg, dataset)

print("dataset artefact id  :", dataset.id)
print("tokenizer artefact id:", tokenizer.id)

reg = get_registry()
print("descendants_of(dataset.id) ->", reg.lineage.descendants_of(dataset.id))
print("get_artefact(tokenizer.id) ->", reg.lineage.get_artefact(tokenizer.id))
print("get_artefact(dataset.id)   ->", reg.lineage.get_artefact(dataset.id))
```

Real output from running this (`uv run python snippet.py`):

```
MANTUA_HOME = /var/folders/k0/j7vdw5wj2cv42vb0tphl2tjc0000gn/T/mantua-home-bxhvhwil

dataset artefact id  : 8ca202e67e8ad1ba76023b2d98dea5d0
tokenizer artefact id: 581d5251435a2f1d46e9c76f9fc5906f

descendants_of(dataset.id) -> ['581d5251435a2f1d46e9c76f9fc5906f']

get_artefact(tokenizer.id) -> {'id': '581d5251435a2f1d46e9c76f9fc5906f', 'name': 'train_tokenizer', 'kind': 'tokenizer', 'size': 21033}
get_artefact(dataset.id)   -> {'id': '8ca202e67e8ad1ba76023b2d98dea5d0', 'name': 'prepare_data', 'kind': 'dataset', 'size': 2648}
```

`descendants_of(dataset.id)` returns exactly the tokenizer's artefact id: `train_tokenizer`
consumed the dataset artefact and produced the tokenizer artefact in the same run, so the join in
`descendants_of` picks it up as a one-hop descendant. `get_artefact` confirms each id's `kind`
(`dataset` vs `tokenizer`) and `size` (bytes on disk).

#### Where this lives on disk

Listing `$MANTUA_HOME` after the snippet above shows the two physical stores:

```
blobs/581d5251435a2f1d46e9c76f9fc5906f/tokenizer.json
blobs/581d5251435a2f1d46e9c76f9fc5906f/tokenizer_config.json
blobs/8ca202e67e8ad1ba76023b2d98dea5d0/corpus.txt
lineage.db
```

- **`<MANTUA_HOME>/blobs/<content-hash>/`** — one directory per artefact, named by its content
  hash (the `Artefact.id`), holding the actual files that stage produced (e.g. the tokenizer's
  `tokenizer.json`/`tokenizer_config.json`, or the copied `corpus.txt` for the dataset). This is
  what `Registry.materialize(artefact)` resolves to.
- **`<MANTUA_HOME>/lineage.db`** — a SQLite database with the `runs`, `artefacts`, `edges`, and
  `stage_cache` tables: which run produced/consumed which artefact id, and the input-identity
  cache mapping from `stage_cache_key(...)` to artefact id.

`MANTUA_HOME` defaults to `./.mantua` (already listed in `.gitignore`) when the environment
variable is unset, so a normal local `mantua train` populates a registry directory alongside the
repo without it ever being committed.

### Testing, linting, and CI

#### Running the test suite

`uv run pytest` from the repo root runs the whole suite. Every test is routed through an isolated
temp `MANTUA_HOME` by `tests/conftest.py`, so no explicit environment setup is needed on the
command line:

```
$ uv run pytest
....                                                                     [100%]
4 passed in 16.12s
```

With `-v`, the four tests break down as one file each of `test_nightly.py` (1 test) and three in
`test_pipeline.py`:

```
$ uv run pytest -v
tests/test_nightly.py .                                                  [ 25%]
tests/test_pipeline.py ...                                               [100%]
4 passed in 16.18s
```

Note that the default `uv run pytest` invocation runs *all* tests, including the one marked
`nightly` — there is no default deselection in `pyproject.toml` (`markers` only registers the
`nightly` marker name; it doesn't filter it out).

#### Running a single test by node id

```
$ uv run pytest tests/test_pipeline.py::test_caching_short_circuits_recompute -v
tests/test_pipeline.py .                                                 [100%]
1 passed in 2.57s
```

#### Running only the nightly-marked test

```
$ uv run pytest -m nightly -v
tests/test_nightly.py .                                                  [100%]
1 passed, 3 deselected in 14.48s
```

`-m nightly` selects the single regression-threshold test in `tests/test_nightly.py` and deselects
the three tests in `tests/test_pipeline.py`.

#### Linting and formatting

```
$ uv run ruff check .
All checks passed!

$ uv run ruff format --check .
16 files already formatted
```

Both are clean on the current tree.

#### Type checking (not part of the documented gates, but fast)

`uv run pyright` finishes in roughly 8-10 seconds wall-clock, so it was run and its real output is
reported here even though neither workflow invokes it today:

```
$ uv run pyright
src/mantua/training.py:83:33 - error: Cannot assign to attribute "pad_token_id" for class "GPT2Config" ...
src/mantua/training.py:84:33 - error: Cannot assign to attribute "eos_token_id" for class "GPT2Config" ...
src/mantua/training.py:169:46 - error: Argument of type ... cannot be assigned to parameter "pad_id" ...
src/mantua/training.py:233:53 - error: Argument of type ... cannot be assigned to parameter "pad_id" ...
src/mantua/training.py:235:53 - error: Argument of type ... cannot be assigned to parameter "pad_id" ...
src/mantua/training.py:277:25 - error: Cannot access attribute "generate" for class "GPT2LMHeadModel" ...
src/mantua/training.py:285:40 - error: Cannot access attribute "strip" for class "list[str]" ...
7 errors, 0 warnings, 0 informations
```

All seven errors are in `src/mantua/training.py` and stem from `transformers`/`GPT2Config` typing
(tokenizer return types being broader than the narrower types the constructors expect, plus a
`generate`/protocol mismatch on `GPT2LMHeadModel`). These do not affect runtime behavior —
`uv run mantua train` and the full pytest suite both pass — and pyright is not wired into either
GitHub Actions workflow, so this is informational only, not a CI gate.

#### What `.github/workflows/ci.yml` does

Triggers on every push to `main` and on every pull request. One job (`end-to-end`) on
`ubuntu-latest`:

1. Checks out the repo and sets up `uv` with Python 3.12 (with uv's cache enabled).
2. `uv sync` — installs dependencies.
3. `uv run ruff check .` — lint gate.
4. `uv run pytest` — runs the full test suite (which, as shown above, includes the nightly-marked
   test too — CI does not pass `-m` here).
5. `uv run mantua train` — actually runs the tiny end-to-end pipeline (tokenizer → pretrain → SFT →
   RL → eval) on CPU, so a PR/push is only green if the real recipe still trains a model, not just
   if unit tests pass in isolation.

The comment at the top of the file states the intent directly: CI is the entrypoint for training,
and this workflow is the fast (target: minutes), small-scale confidence check that runs on every
change.

#### What `.github/workflows/nightly.yml` does

Triggers on a daily cron schedule (`0 3 * * *`, i.e. 03:00 UTC) and can also be triggered manually
via `workflow_dispatch`. One job (`regression`) on `ubuntu-latest`:

1. Checks out the repo and sets up `uv` with Python 3.12 (cache enabled).
2. `uv sync`.
3. `uv run pytest -m nightly` — runs *only* the test(s) marked `nightly` (currently the single test
   in `tests/test_nightly.py`), skipping the rest of the suite and skipping `ruff` entirely.

Per the file's header comment, this is the larger, slower run whose job is to catch *semantic*
regressions: it asserts a measurable eval-quality threshold on the trained model, so a change that
still runs successfully (and would pass PR CI) but degrades model quality fails here instead of
silently landing on `main`.

## Architecture at a glance

```
train(TrainConfig)
├── pre_train(PreTrainConfig)          -> checkpoint
│   ├── prepare_data      -> dataset artefact
│   ├── train_tokenizer   -> tokenizer artefact   (consumes dataset)
│   └── pre_train         -> checkpoint artefact   (consumes dataset + tokenizer)
└── post_train(PostTrainConfig, base)  -> PostTrainEvaluation
    ├── sft   -> checkpoint   (consumes pretrain checkpoint + sft data)
    ├── evaluate (spawned)    (consumes sft checkpoint + eval data)
    ├── rl    -> checkpoint   (consumes sft checkpoint + rl data)
    └── evaluate (spawned)    (consumes rl checkpoint + eval data)
```

- **`src/mantua/config.py`** — Pydantic configs (typed stage inputs) and evaluation outputs.
- **`src/mantua/registry/`** — content-addressed blob store + SQLite lineage graph + input-identity cache.
- **`src/mantua/training.py`** — the actual (tiny) PyTorch/transformers training + eval.
- **`src/mantua/stages.py`** — each stage: cache-check → compute → register artefact + lineage.
- **`src/mantua/pipeline.py`** — Prefect `@flow`/`@task` composition (orchestration, concurrency, UI).
- **`src/mantua/experiments.py`** — the 2×2 LR sweep, showing caching collapse redundant work.
- **`configs`** — `mantua.configs.tiny()` is the downscaled recipe CI runs.

### Caching by input identity

Each stage computes a cache key from `hash(stage_name + config + upstream artefact versions)`.
If the registry already has an artefact for that key, the stage short-circuits. This is what makes
sweeps tractable: a 2×2 SFT-LR × RL-LR sweep runs pre-training **once** and SFT **twice**, not four
times. See [`experiments.py`](src/mantua/experiments.py).

### What's a faithful skeleton vs. a stub

Real: typed composable stages, content-addressed immutable artefacts, the lineage graph,
input-identity caching, incremental Prefect orchestration, and genuine (if tiny) training —
pre-training and SFT are real causal-LM training loops; RL is a real DPO loss. Deliberately
downscaled/simplified: model size, dataset size, the eval suite, and the RL algorithm (DPO stands
in for the online GRPO/PPO that TRL would provide at full scale — the drop-in point is marked in
[`training.py`](src/mantua/training.py)).
