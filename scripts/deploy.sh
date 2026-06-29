#!/usr/bin/env bash
#
# Deploy Đồi Đom Đóm (Next.js web + game bundles) lên production: doidomdom.com
#
# Mô hình deploy: server KHÔNG dùng git. Source được đồng bộ thẳng từ máy local
# vào $REMOTE_DIR rồi build bằng Docker ngay trên server.
#   local:  rsync source → server (giữ nguyên .env của server)
#   server: docker compose up -d --build  (Dockerfile build cả games rồi web)
#
# Cách dùng:
#   ./scripts/deploy.sh           # đồng bộ + build + restart
#   ./scripts/deploy.sh --yes     # bỏ qua bước hỏi xác nhận
#   ./scripts/deploy.sh --dry-run # xem rsync sẽ đẩy gì, không thực thi
#
# Yêu cầu:
#   - SSH tới server đã cấu hình trong ~/.ssh/config (host: 42.96.17.167, port 8430).
#   - rsync có sẵn ở local lẫn server.
#   - File .env trên server (NEXT_PUBLIC_SUPABASE_*, WEB_BIND, WEB_PORT) đã có sẵn —
#     script KHÔNG đụng tới nó (được loại trong --exclude).
#
set -euo pipefail

# ---- Cấu hình (có thể override bằng biến môi trường) ----
SERVER="${SERVER:-42.96.17.167}"          # = doidomdom.com (root@…:8430 theo ~/.ssh/config)
REMOTE_DIR="${REMOTE_DIR:-/opt/domdom}"    # thư mục source trên server
SSH_OPTS="${SSH_OPTS:--o ConnectTimeout=15}"

# Repo root = thư mục cha của scripts/
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ---- Tiện ích log ----
c() { printf '\033[1;36m%s\033[0m\n' "$*"; }
ok() { printf '\033[1;32m%s\033[0m\n' "$*"; }
err() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

DRY_RUN=""
for a in "$@"; do
  case "$a" in
    --dry-run) DRY_RUN="--dry-run" ;;
  esac
done

# Những thứ KHÔNG đồng bộ: artefact build + cấu hình runtime của server.
RSYNC_EXCLUDES=(
  --exclude '.git'
  --exclude '.env'            # GIỮ NGUYÊN .env của server
  --exclude '.env.*'
  --exclude 'node_modules'
  --exclude '.next'
  --exclude 'dist'            # output build của các game
  --exclude '.turbo'
  --exclude '.claude'
  --exclude '.DS_Store'
  --exclude 'apps/web/public/games'  # game bundle, Dockerfile build lại
  --exclude 'images'                 # thư mục asset thiết kế, không cần cho build
  --exclude '*.log'
)

c "Deploy → $SERVER:$REMOTE_DIR (doidomdom.com)"

# ---- 1. Xác nhận (prod là thao tác khó hoàn tác) ----
if [[ -z "$DRY_RUN" && "${1:-}" != "--yes" && "${1:-}" != "-y" ]]; then
  read -r -p "Tiếp tục deploy lên PRODUCTION? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || { err "Đã huỷ."; exit 1; }
fi

# ---- 2. Đồng bộ source ----
c "→ rsync source lên server${DRY_RUN:+ (DRY RUN)}…"
rsync -az --human-readable $DRY_RUN \
  "${RSYNC_EXCLUDES[@]}" \
  -e "ssh $SSH_OPTS" \
  ./ "$SERVER:$REMOTE_DIR/"

if [[ -n "$DRY_RUN" ]]; then
  ok "✓ Dry-run xong (chưa build, chưa restart)."
  exit 0
fi

# ---- 3. Build + restart trên server ----
c "→ docker compose up -d --build trên server…"
ssh $SSH_OPTS "$SERVER" "set -euo pipefail
cd '$REMOTE_DIR'
docker compose up -d --build
docker image prune -f >/dev/null
docker compose ps"

ok "✓ Đã deploy lên doidomdom.com"
c  "Mở https://doidomdom.com (Cmd+Shift+R nếu trình duyệt còn cache)."
