#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-4173}"
TMP_BASE="$(mktemp "${TMPDIR:-/tmp}/gss-preview.XXXXXX")"
TMP_PNG="${TMP_BASE}.png"
OUT_WEBP="${ROOT_DIR}/www/preview.webp"
SOURCE_PNG="${ROOT_DIR}/assets/queen-ii.png"
URL="http://127.0.0.1:${PORT}/scripts/preview.html?export=1&t=$(date +%s)"
HTTP_LOG="${TMPDIR:-/tmp}/gss-preview-http.log"
VIEWPORT_WIDTH=""
VIEWPORT_HEIGHT=""

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required" >&2
  exit 1
fi

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required" >&2
  exit 1
fi

if ! command -v shasum >/dev/null 2>&1; then
  echo "shasum is required" >&2
  exit 1
fi

if [ ! -f "${SOURCE_PNG}" ]; then
  echo "missing source image: ${SOURCE_PNG}" >&2
  exit 1
fi

VIEWPORT_WIDTH="$(sips -g pixelWidth "${SOURCE_PNG}" 2>/dev/null | awk '/pixelWidth:/{print $2}')"
VIEWPORT_HEIGHT="$(sips -g pixelHeight "${SOURCE_PNG}" 2>/dev/null | awk '/pixelHeight:/{print $2}')"
if [ -z "${VIEWPORT_WIDTH}" ] || [ -z "${VIEWPORT_HEIGHT}" ]; then
  echo "failed to read source image dimensions from ${SOURCE_PNG}" >&2
  exit 1
fi

SOURCE_SHA_BEFORE="$(shasum "${SOURCE_PNG}" | awk '{print $1}')"

python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" \
  >"${HTTP_LOG}" 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  rm -f "${TMP_BASE}" >/dev/null 2>&1 || true
  rm -f "${TMP_PNG}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 1

mv "${TMP_BASE}" "${TMP_PNG}"

npx --yes playwright@latest screenshot \
  --channel=chrome \
  --wait-for-timeout=2500 \
  --viewport-size="${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}" \
  "${URL}" \
  "${TMP_PNG}"

cwebp -quiet -q 92 "${TMP_PNG}" -o "${OUT_WEBP}"

SOURCE_SHA_AFTER="$(shasum "${SOURCE_PNG}" | awk '{print $1}')"
if [ "${SOURCE_SHA_BEFORE}" != "${SOURCE_SHA_AFTER}" ]; then
  echo "source image changed unexpectedly: ${SOURCE_PNG}" >&2
  exit 1
fi

echo "Wrote ${OUT_WEBP}"
