#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Using project root: $PROJECT_ROOT"

VENV_DIR="$PROJECT_ROOT/.venv"
PY_BIN="${PY_BIN:-python}"

echo "==> Creating virtual environment (Python 3.11 recommended)..."
if command -v py >/dev/null 2>&1; then
  if py -3.11 -V >/dev/null 2>&1; then
    PY_BIN="py -3.11"
  fi
fi

if [ ! -d "$VENV_DIR" ]; then
  eval "$PY_BIN -m venv \"$VENV_DIR\""
fi

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Git Bash on Windows
  # shellcheck disable=SC1090
  source "$VENV_DIR/Scripts/activate"
else
  # Linux/macOS/WSL
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
fi

echo "==> Upgrading pip..."
python -m pip install --upgrade pip

echo "==> Installing requirements..."
pip install -r "$PROJECT_ROOT/requirements.txt"

echo
echo "==> Setup complete."
echo "Virtualenv: $VENV_DIR"
echo "To run the API server:"
echo "  source \"$VENV_DIR/bin/activate\"   # or .\\Scripts\\activate on Windows"
echo "  cd \"$PROJECT_ROOT\""
echo "  python src/server.py"

