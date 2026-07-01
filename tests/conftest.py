"""Point Mantua at an isolated, throwaway home before anything imports Prefect/registry."""

import tempfile

from mantua._local import configure_local

configure_local(tempfile.mkdtemp(prefix="mantua-test-"))
