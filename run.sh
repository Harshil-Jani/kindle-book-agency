#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  Book Writer AI Agent Team — CLI Runner
#  Usage:  ./run.sh "your book topic here"
#          ./run.sh --list-agents
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

step() { echo -e "  ${CYAN}▶${RESET} $1"; }
ok()   { echo -e "  ${GREEN}✓${RESET} $1"; }
fail() { echo -e "  ${RED}✗ $1${RESET}"; exit 1; }

echo ""
echo -e "${GREEN}"
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Book Writer AI Agent Team               │"
echo "  │  8 Agents · Parallel Pipeline            │"
echo "  └──────────────────────────────────────────┘"
echo -e "${RESET}"

# ── 1. Python ────────────────────────────────────────────────────────
step "Checking Python..."
PY=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then PY="$cmd"; break; fi
done
[ -z "$PY" ] && fail "Python 3.10+ required. Install from https://python.org"
ok "Python found"

# ── 2. Venv ──────────────────────────────────────────────────────────
if [ ! -d "$VENV" ]; then
  step "Creating virtual environment..."
  $PY -m venv "$VENV"
  ok "Created .venv/"
else
  ok "Virtual environment exists"
fi
source "$VENV/bin/activate"

# ── 3. Deps ──────────────────────────────────────────────────────────
step "Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r "$ROOT/requirements.txt"
ok "Dependencies ready"

# ── 4. API Key ───────────────────────────────────────────────────────
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo ""
  echo -e "  ${RED}ANTHROPIC_API_KEY not set.${RESET}"
  echo -e "  ${YELLOW}Export it:  export ANTHROPIC_API_KEY='sk-ant-...'${RESET}"
  echo -e "  ${YELLOW}Or use this project directly in Claude Code.${RESET}"
  exit 1
fi
ok "ANTHROPIC_API_KEY found"

# ── 5. Run ───────────────────────────────────────────────────────────
echo ""
cd "$ROOT"
exec "$VENV/bin/python" main.py "$@"
