#!/bin/bash
# Run all E2E tests sequentially
# Usage:
#   bash e2e/run-all.sh              # default: connect to existing Chrome
#   bash e2e/run-all.sh --connect    # same as above
#   bash e2e/run-all.sh --headless   # use headless Chromium
#
# Prerequisites:
#   1. npm run dev (start the dev server on localhost:3000)
#   2. npm install -g dev-browser && dev-browser install
#   3. Chrome must be running with --remote-debugging-port=9222 (for --connect mode)

set -e

BROWSER_FLAG="${1:---connect}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0

echo "=================================="
echo "  Proposal V3 — E2E Test Suite"
echo "  Browser mode: $BROWSER_FLAG"
echo "=================================="
echo ""

for test_file in "$SCRIPT_DIR"/0*.js; do
  test_name=$(basename "$test_file" .js)
  echo "▶ Running: $test_name"
  echo "──────────────────────────────────"

  if dev-browser "$BROWSER_FLAG" < "$test_file" 2>&1; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "❌ FAILED: $test_name"
  fi

  echo ""
done

echo "=================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "  Screenshots: ~/.dev-browser/tmp/"
echo "=================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
