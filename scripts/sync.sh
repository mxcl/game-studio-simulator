#!/usr/bin/env bash
set -euo pipefail

AWS_PAGER=""
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "${ROOT_DIR}/.envrc" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.envrc"
  set +a
fi

if [[ -z "${WAITLIST_ENDPOINT:-}" ]]; then
  echo "WAITLIST_ENDPOINT is not set." >&2
  exit 1
fi

cat > "${ROOT_DIR}/www/runtime-config.js" <<EOF_JS
window.GSS_RUNTIME_CONFIG = Object.freeze({
  waitlistEndpoint: "${WAITLIST_ENDPOINT}",
});
EOF_JS

# Prevent Finder metadata from ever being uploaded.
SYNC_EXCLUDES=(
  --exclude ".DS_Store"
  --exclude "*/.DS_Store"
)

aws s3 sync "${ROOT_DIR}/www" "${AWS_S3_BUCKET}" --delete \
  --cache-control "public,max-age=60" \
  --exclude "*" --include "*.html" --include "runtime-config.js" \
  "${SYNC_EXCLUDES[@]}"
aws s3 sync "${ROOT_DIR}/www" "${AWS_S3_BUCKET}" --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" --exclude "runtime-config.js" "${SYNC_EXCLUDES[@]}"
aws s3 sync "${ROOT_DIR}/assets" "${AWS_S3_BUCKET}/snd" \
  --exclude "*" --include "*.mp3" "${SYNC_EXCLUDES[@]}"
aws cloudfront create-invalidation \
  --distribution-id "${AWS_CLOUDFRONT_DISTRIBUTION_ID}" \
  --paths "/*"
