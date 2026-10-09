#!/usr/bin/env bash
# Compile and run the dashboard locally, with no global installs.
#
# Uses the system Node.js when it is v18 or newer. Otherwise it downloads a
# pinned Node.js release from nodejs.org into ./.node (checksum-verified) and
# uses that. Dependencies are installed into ./node_modules on first use.
#
# Usage: ./run.sh [command]
#   dev        start the dev server (default)
#   build      typecheck and build into dist/
#   preview    build, then serve dist/
#   test       run the vitest suite
#   typecheck  run tsc --noEmit
#   check      typecheck, test and build
#   setup      only fetch Node.js and install dependencies
#   clean      remove .node, node_modules and dist
set -euo pipefail

NODE_VERSION="22.11.0"
MIN_NODE_MAJOR=18

cd "$(dirname "$0")"
DIR="$(pwd)"
LOCAL_NODE="$DIR/.node"

log() { printf '\033[1m==>\033[0m %s\n' "$*" >&2; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

node_major() { "$1" -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }

platform() {
  local os arch
  case "$(uname -s)" in
    Darwin) os=darwin ;;
    Linux) os=linux ;;
    *) die "unsupported OS $(uname -s); install Node.js $MIN_NODE_MAJOR+ yourself" ;;
  esac
  case "$(uname -m)" in
    arm64 | aarch64) arch=arm64 ;;
    x86_64 | amd64) arch=x64 ;;
    *) die "unsupported CPU $(uname -m); install Node.js $MIN_NODE_MAJOR+ yourself" ;;
  esac
  echo "$os-$arch"
}

install_local_node() {
  local name="node-v$NODE_VERSION-$(platform)"
  local base="https://nodejs.org/dist/v$NODE_VERSION"
  local tmp
  tmp="$(mktemp -d)"

  log "Downloading Node.js v$NODE_VERSION ($name)"
  curl -fsSL --retry 3 -o "$tmp/$name.tar.gz" "$base/$name.tar.gz"
  curl -fsSL --retry 3 -o "$tmp/SHASUMS256.txt" "$base/SHASUMS256.txt"

  log "Verifying checksum"
  local expected actual
  expected="$(awk -v f="$name.tar.gz" '$2 == f { print $1 }' "$tmp/SHASUMS256.txt")"
  [ -n "$expected" ] || die "no checksum listed for $name.tar.gz"
  actual="$(shasum -a 256 "$tmp/$name.tar.gz" | awk '{ print $1 }')"
  [ "$expected" = "$actual" ] || die "checksum mismatch for $name.tar.gz"

  rm -rf "$LOCAL_NODE"
  mkdir -p "$LOCAL_NODE"
  tar -xzf "$tmp/$name.tar.gz" -C "$LOCAL_NODE" --strip-components 1
  rm -rf "$tmp"
  log "Node.js installed in $LOCAL_NODE"
}

ensure_node() {
  if [ -x "$LOCAL_NODE/bin/node" ] && [ "$("$LOCAL_NODE/bin/node" --version)" = "v$NODE_VERSION" ]; then
    export PATH="$LOCAL_NODE/bin:$PATH"
  elif command -v node >/dev/null && [ "$(node_major node)" -ge "$MIN_NODE_MAJOR" ]; then
    : # system Node is new enough
  else
    install_local_node
    export PATH="$LOCAL_NODE/bin:$PATH"
  fi
  log "Using Node.js $(node --version) from $(command -v node)"
}

ensure_deps() {
  # Reinstall when package.json is newer than the last install.
  if [ ! -d node_modules ] || [ package.json -nt node_modules/.package-lock.json ]; then
    log "Installing dependencies"
    if [ -f package-lock.json ]; then npm ci; else npm install; fi
  fi
}

cmd="${1:-dev}"
[ $# -gt 0 ] && shift

case "$cmd" in
  clean)
    rm -rf "$LOCAL_NODE" node_modules dist
    log "Removed .node, node_modules and dist"
    exit 0
    ;;
  dev | build | preview | test | typecheck | check | setup) ;;
  -h | --help | help)
    sed -n '2,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'
    exit 0
    ;;
  *) die "unknown command '$cmd' (try ./run.sh help)" ;;
esac

ensure_node
ensure_deps

case "$cmd" in
  setup) log "Ready" ;;
  dev) exec npm run dev -- "$@" ;;
  build) exec npm run build ;;
  preview) npm run build && exec npm run preview -- "$@" ;;
  test) exec npm test -- "$@" ;;
  typecheck) exec npm run typecheck ;;
  check) npm run typecheck && npm test && exec npm run build ;;
esac
