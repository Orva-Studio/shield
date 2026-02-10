#!/usr/bin/env bash

# Standalone pre-commit hook: runs oxlint, jscpd, and knip on staged .ts/.tsx files

# Collect staged .ts/.tsx files (excluding deletions)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d -- '*.ts' '*.tsx')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

OXLINT_ISSUES=0
JSCPD_ISSUES=0
KNIP_ISSUES=0
HAS_ERRORS=0

# Helper: strip ANSI escape codes
function stripAnsi() {
  sed 's/\x1b\[[0-9;]*m//g'
}

# --- oxlint ---
echo "Running oxlint..."
OXLINT_OUTPUT=$(echo "$STAGED_FILES" | xargs bunx oxlint 2>&1) || true
OXLINT_CLEAN=$(echo "$OXLINT_OUTPUT" | stripAnsi)
OXLINT_FOUND=$(echo "$OXLINT_CLEAN" | grep -oE 'Found [0-9]+ (warning|error)' | grep -oE '[0-9]+' | head -1) || true
if [ -n "$OXLINT_FOUND" ] && [ "$OXLINT_FOUND" -gt 0 ]; then
  echo "$OXLINT_OUTPUT"
  OXLINT_ISSUES=$OXLINT_FOUND
  HAS_ERRORS=1
fi

# --- jscpd ---
echo "Running jscpd..."
JSCPD_OUTPUT=$(bunx jscpd --pattern '**/*.{ts,tsx}' --reporters consoleFull --silent $STAGED_FILES 2>&1) || true
JSCPD_CLEAN=$(echo "$JSCPD_OUTPUT" | stripAnsi)
JSCPD_FOUND=$(echo "$JSCPD_CLEAN" | grep -oE 'Found [0-9]+ exact clone' | grep -oE '[0-9]+' | head -1) || true
if [ -n "$JSCPD_FOUND" ] && [ "$JSCPD_FOUND" -gt 0 ]; then
  echo "$JSCPD_OUTPUT"
  JSCPD_ISSUES=$JSCPD_FOUND
  HAS_ERRORS=1
fi

# --- knip (project-wide, filtered to staged files) ---
echo "Running knip..."
KNIP_OUTPUT=$(bunx knip --no-progress 2>&1) || true
KNIP_FILTERED=""
while IFS= read -r FILE; do
  FILE_MATCHES=$(echo "$KNIP_OUTPUT" | grep -F "$FILE") || true
  if [ -n "$FILE_MATCHES" ]; then
    KNIP_FILTERED+="$FILE_MATCHES"$'\n'
  fi
done <<< "$STAGED_FILES"

KNIP_TRIMMED=$(echo "$KNIP_FILTERED" | sed '/^[[:space:]]*$/d')
if [ -n "$KNIP_TRIMMED" ]; then
  echo "$KNIP_TRIMMED"
  KNIP_ISSUES=$(echo "$KNIP_TRIMMED" | wc -l | tr -d ' ')
  HAS_ERRORS=1
fi

# --- Summary ---
echo ""
echo "Pre-commit summary: oxlint=$OXLINT_ISSUES jscpd=$JSCPD_ISSUES knip=$KNIP_ISSUES"

if [ "$HAS_ERRORS" -eq 1 ]; then
  echo "Commit blocked — fix the issues above and retry."
  exit 1
fi

echo "All checks passed."
exit 0
