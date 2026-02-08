"""Configuration for the Book Writer AI Agent Team."""

import os

# Model configuration — opus-4-6 by default, user can change from UI
DEFAULT_MODEL = "claude-opus-4-6"
FAST_MODEL = "claude-haiku-4-5-20251001"

AVAILABLE_MODELS = {
    "claude-opus-4-6": "Opus 4.6 — Most capable, best quality (default)",
    "claude-sonnet-4-5-20250929": "Sonnet 4.5 — Fast and capable",
    "claude-haiku-4-5-20251001": "Haiku 4.5 — Fastest, most affordable",
}

# API Key — can be set via env var or entered in UI
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")

# Max tokens per agent response
MAX_TOKENS = 4096
EXTENDED_MAX_TOKENS = 16384  # For ghostwriter (long-form content)
