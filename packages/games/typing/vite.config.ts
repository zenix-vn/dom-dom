import { defineConfig } from "vite";

// Build bundle game vào thư mục public của web để host phục vụ same-origin
// tại /games/typing/. Trong dev có thể chạy `vite` riêng ở :5173.
export default defineConfig({
  base: "/games/typing/",
  build: {
    outDir: "../../../apps/web/public/games/typing",
    emptyOutDir: true,
  },
});
