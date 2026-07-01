"""``mantua`` command-line entrypoint."""

from __future__ import annotations

import argparse

from ._local import configure_local


def _print_report(result) -> None:
    pt = result.post_train
    print("\n=== Mantua run report ===")
    print(f"pretrain checkpoint : {result.pretrain_checkpoint}")
    for label, ev in (("SFT", pt.sft_eval), ("RL ", pt.rl_eval)):
        print(
            f"{label} checkpoint {ev.checkpoint[:12]}…  "
            f"perplexity={ev.perplexity:8.3f}  "
            f"format_adherence={ev.format_adherence:.2f}  "
            f"(n={ev.n_samples})"
        )
    print("=========================\n")


def main() -> None:
    parser = argparse.ArgumentParser(prog="mantua", description="Model Training as Code.")
    parser.add_argument("--home", help="artefact store / Prefect state root (default: ./.mantua)")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("train", help="run the tiny end-to-end pipeline")

    args = parser.parse_args()
    configure_local(args.home)  # before importing Prefect

    if args.command == "train":
        from .configs import tiny
        from .pipeline import train

        result = train(tiny())
        _print_report(result)
