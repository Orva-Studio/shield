#!/usr/bin/env bash
set -euo pipefail

# Get staged .ts/.tsx files (excluding deleted files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d -- '*.ts' '*.tsx' 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

ISSUES=""
EXIT_CODE=0

# --- oxlint ---
OXLINT_OUT=$(bunx oxlint $STAGED_FILES 2>&1 || true)
# oxlint prints "Found N warnings/errors" when there are issues
if echo "$OXLINT_OUT" | grep -qE 'Found [0-9]+ (warning|error)'; then
  ISSUES+="## oxlint"$'\n'"$OXLINT_OUT"$'\n\n'
  EXIT_CODE=1
fi

# --- jscpd (duplicate code) ---
# Create a temp file list for jscpd
TMPFILE=$(mktemp)
echo "$STAGED_FILES" | tr ' ' '\n' > "$TMPFILE"
JSCPD_OUT=$(bunx jscpd --files-list "$TMPFILE" --reporters console --silent 2>&1 || true)
rm -f "$TMPFILE"
if echo "$JSCPD_OUT" | grep -qiE 'found [0-9]+ clone|duplicate'; then
  ISSUES+="## jscpd (duplicate code)"$'\n'"$JSCPD_OUT"$'\n\n'
  EXIT_CODE=1
fi

# --- knip (unused exports/dependencies) ---
# knip runs project-wide; filter output to changed files only
KNIP_OUT=$(bunx knip --no-progress 2>&1 || true)
FILTERED_KNIP=""
for f in $STAGED_FILES; do
  MATCH=$(echo "$KNIP_OUT" | grep -F "$f" || true)
  if [ -n "$MATCH" ]; then
    FILTERED_KNIP+="$MATCH"$'\n'
  fi
done
if [ -n "$FILTERED_KNIP" ]; then
  ISSUES+="## knip (unused exports/deps)"$'\n'"$FILTERED_KNIP"$'\n\n'
  EXIT_CODE=1
fi

TOTAL_ISSUES=0
if [ -n "$ISSUES" ]; then
  # Count issue lines (non-empty, non-header lines)
  TOTAL_ISSUES=$(echo "$ISSUES" | grep -cvE '^\s*$|^##' || true)
fi

if [ $EXIT_CODE -ne 0 ]; then
  echo "=== Pre-commit quality check failed ==="
  echo "Found $TOTAL_ISSUES issue(s)."
  echo ""
  echo "$ISSUES" | head -80
  echo "Fix these issues before committing."
else
  echo "=== Pre-commit quality check passed ==="
  echo "No issues found. 0 issues detected, 0 fixed."
fi

exit $EXIT_CODE
