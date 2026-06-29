#!/usr/bin/env bash
#
# Deploy Đồi Đom Đóm (Next.js web + game bundles) lên production: doidomdom.com
#
# Mô hình deploy: SERVER tự build từ git.
#   local:  commit + push lên GitHub
#   server: git pull → docker compose up -d --build (Dockerfile build cả games rồi web)
#
# Cách dùng:
#   ./scripts/deploy.sh                 # deploy nhánh hiện tại
#   BRANCH=main ./scripts/deploy.sh     # ép deploy nhánh main
#   REMOTE_DIR=/root/dom-dom ./scripts/deploy.sh
#   ./scripts/deploy.sh --yes           # bỏ qua bước hỏi xác nhận
#
# Yêu cầu:
#   - SSH tới server đã cấu hình trong ~/.ssh/config (host bên dưới: 42.96.17.167, port 8430).
#   - Trên server, repo đã được clone sẵn ở $REMOTE_DIR và có file .env chứa
#     NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (docker compose đọc lúc build).
#
set -euo pipefail

# ---- Cấu hình (có thể override bằng biến môi trường) ----
SERVER="${SERVER:-42.96.17.167}"          # = doidomdom.com (root@…:8430 theo ~/.ssh/config)
REMOTE_DIR="${REMOTE_DIR:-/root/dom-dom}"  # ⚠️ ĐỔI cho đúng đường dẫn repo trên server nếu khác
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

# ---- Tiện ích log ----
c() { printf '\033[1;36m%s\033[0m\n' "$*"; }   # cyan
ok() { printf '\033[1;32m%s\033[0m\n' "$*"; }  # green
err() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; } # red

# ---- 0. Phải chạy trong repo, working tree sạch ----
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Không ở trong git repo."; exit 1; }
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  err "Working tree còn thay đổi chưa commit — hãy commit trước khi deploy:"
  git status --short >&2
  exit 1
fi

c "Deploy nhánh '$BRANCH' → $SERVER:$REMOTE_DIR (doidomdom.com)"

# ---- 1. Xác nhận (prod là thao tác khó hoàn tác) ----
if [[ "${1:-}" != "--yes" && "${1:-}" != "-y" ]]; then
  read -r -p "Tiếp tục deploy lên PRODUCTION? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || { err "Đã huỷ."; exit 1; }
fi

# ---- 2. Push lên GitHub ----
c "→ Đẩy code lên GitHub (origin/$BRANCH)…"
git push origin "$BRANCH"

# ---- 3. Trên server: pull + rebuild + restart ----
c "→ SSH vào server, pull & rebuild container…"
REMOTE_CMD="set -euo pipefail
cd '$REMOTE_DIR' 2>/dev/null || { echo 'LỖI: không thấy thư mục $REMOTE_DIR trên server' >&2; exit 1; }
[ -f docker-compose.yml ] || { echo 'LỖI: $REMOTE_DIR không chứa docker-compose.yml (sai REMOTE_DIR?)' >&2; exit 1; }
echo '  · git fetch & reset --hard origin/$BRANCH'
git fetch --all --prune
git checkout '$BRANCH'
git reset --hard 'origin/$BRANCH'
echo '  · docker compose up -d --build'
docker compose up -d --build
echo '  · dọn image cũ'
docker image prune -f >/dev/null
docker compose ps"

ssh "$SERVER" "$REMOTE_CMD"

ok "✓ Đã deploy '$BRANCH' lên doidomdom.com"
c  "Mở https://doidomdom.com (Cmd+Shift+R nếu trình duyệt còn cache)."
