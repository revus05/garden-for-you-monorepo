#!/usr/bin/env bash
# Build & push the garden-for-you Docker images to Docker Hub.
#
# Usage:
#   bash scripts/push-images.sh [service] [tag]
#     service : all | backend | storefront   (default: all)
#     tag     : image tag                     (default: latest)
#
# Overridable via env:
#   DOCKER_USER (default revus05), PLATFORM (default linux/amd64)
#
# Storefront NEXT_PUBLIC_* and REVALIDATE_SECRET are read from
# garden-for-you/.env.docker — that file is the single source of truth, so to
# change the baked-in domain/keys just edit .env.docker and re-run this script.
set -euo pipefail

# --- resolve paths (works from anywhere) ------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STOREFRONT_DIR="$ROOT_DIR/garden-for-you"
BACKEND_DIR="$ROOT_DIR/garden-for-you-backend"
ENV_FILE="$STOREFRONT_DIR/.env.docker"

# --- config -----------------------------------------------------------------
SERVICE="${1:-all}"
TAG="${2:-${TAG:-latest}}"
DOCKER_USER="${DOCKER_USER:-revus05}"
PLATFORM="${PLATFORM:-linux/amd64}"

BACKEND_IMAGE="$DOCKER_USER/garden-backend:$TAG"
STOREFRONT_IMAGE="$DOCKER_USER/garden-storefront:$TAG"

# --- helpers ----------------------------------------------------------------
# Read KEY=value from .env.docker (last match wins, strips inline CR).
env_get() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr -d '\r'
}

require() {
  local name="$1" val="$2"
  if [ -z "$val" ]; then
    echo "ERROR: $name is empty in $ENV_FILE" >&2
    exit 1
  fi
  case "$val" in
    *replace_me*|*example.com*|*your-*|*build-placeholder*)
      echo "ERROR: $name still has a placeholder value: $val" >&2
      exit 1 ;;
  esac
}

# --- pre-flight -------------------------------------------------------------
if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon not reachable (is Docker Desktop running?)" >&2
  exit 1
fi

case "$SERVICE" in
  all|backend|storefront) ;;
  *) echo "ERROR: unknown service '$SERVICE' (use: all|backend|storefront)" >&2; exit 1 ;;
esac

echo "==> user=$DOCKER_USER  tag=$TAG  platform=$PLATFORM  service=$SERVICE"

# --- backend ----------------------------------------------------------------
build_push_backend() {
  echo "==> Building $BACKEND_IMAGE"
  docker build --platform "$PLATFORM" -t "$BACKEND_IMAGE" "$BACKEND_DIR"
  echo "==> Pushing $BACKEND_IMAGE"
  docker push "$BACKEND_IMAGE"
}

# --- storefront -------------------------------------------------------------
build_push_storefront() {
  [ -f "$ENV_FILE" ] || { echo "ERROR: missing $ENV_FILE" >&2; exit 1; }

  local NEXT_PUBLIC_MEDUSA_URL NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
        NEXT_PUBLIC_REGION_ID NEXT_PUBLIC_SITE_URL \
        NEXT_PUBLIC_CONTENT_TABLE_URL REVALIDATE_SECRET
  NEXT_PUBLIC_MEDUSA_URL="$(env_get NEXT_PUBLIC_MEDUSA_URL)"
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$(env_get NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)"
  NEXT_PUBLIC_REGION_ID="$(env_get NEXT_PUBLIC_REGION_ID)"
  NEXT_PUBLIC_SITE_URL="$(env_get NEXT_PUBLIC_SITE_URL)"
  NEXT_PUBLIC_CONTENT_TABLE_URL="$(env_get NEXT_PUBLIC_CONTENT_TABLE_URL)"
  REVALIDATE_SECRET="$(env_get REVALIDATE_SECRET)"

  require NEXT_PUBLIC_MEDUSA_URL "$NEXT_PUBLIC_MEDUSA_URL"
  require NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY "$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
  require NEXT_PUBLIC_REGION_ID "$NEXT_PUBLIC_REGION_ID"
  require NEXT_PUBLIC_SITE_URL "$NEXT_PUBLIC_SITE_URL"
  require NEXT_PUBLIC_CONTENT_TABLE_URL "$NEXT_PUBLIC_CONTENT_TABLE_URL"
  require REVALIDATE_SECRET "$REVALIDATE_SECRET"

  # These get baked into the bundle — localhost is almost certainly wrong for a
  # pushed prod image. Warn, but don't block (you may be pushing a dev image).
  case "$NEXT_PUBLIC_MEDUSA_URL$NEXT_PUBLIC_SITE_URL" in
    *localhost*|*127.0.0.1*)
      echo "WARNING: NEXT_PUBLIC_MEDUSA_URL / NEXT_PUBLIC_SITE_URL point to localhost." >&2
      echo "         These are inlined into the image — set the real prod URLs in" >&2
      echo "         $ENV_FILE before pushing a production image." >&2 ;;
  esac

  echo "==> Building $STOREFRONT_IMAGE"
  echo "      NEXT_PUBLIC_MEDUSA_URL=$NEXT_PUBLIC_MEDUSA_URL"
  echo "      NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"
  docker build --platform "$PLATFORM" \
    --build-arg NEXT_PUBLIC_MEDUSA_URL="$NEXT_PUBLIC_MEDUSA_URL" \
    --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" \
    --build-arg NEXT_PUBLIC_REGION_ID="$NEXT_PUBLIC_REGION_ID" \
    --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    --build-arg NEXT_PUBLIC_CONTENT_TABLE_URL="$NEXT_PUBLIC_CONTENT_TABLE_URL" \
    --build-arg REVALIDATE_SECRET="$REVALIDATE_SECRET" \
    -t "$STOREFRONT_IMAGE" "$STOREFRONT_DIR"
  echo "==> Pushing $STOREFRONT_IMAGE"
  docker push "$STOREFRONT_IMAGE"
}

# --- run --------------------------------------------------------------------
if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
  build_push_backend
fi
if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "storefront" ]; then
  build_push_storefront
fi

echo "==> Done. On the server:"
echo "    docker compose -f docker-compose.deploy.yml pull"
echo "    docker compose -f docker-compose.deploy.yml up -d"
