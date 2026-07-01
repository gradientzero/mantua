"""Nightly regression gate.

The idea (from the blog): a nightly run asserts a *measurable* eval bar, so a change that still
runs but silently makes the model worse fails here rather than shipping. This skeleton uses a
generous placeholder ceiling; a real recipe would assert improvement over a pinned baseline.
"""

import math

import pytest

from mantua.configs import tiny
from mantua.pipeline import train

# Loose ceiling for the tiny model. Replace with an assert-improvement-over-baseline gate
# once there's a baseline artefact to compare against.
PERPLEXITY_CEILING = 5000.0


@pytest.mark.nightly
def test_eval_meets_threshold():
    result = train(tiny())
    rl_eval = result.post_train.rl_eval
    assert math.isfinite(rl_eval.perplexity)
    assert rl_eval.perplexity < PERPLEXITY_CEILING
    assert rl_eval.format_adherence >= 0.0
