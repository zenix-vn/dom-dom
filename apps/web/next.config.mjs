import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone server bundle for a lean Docker image.
  output: "standalone",
  // Monorepo: trace files from the repo root so workspace deps are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@domdom/core",
    "@domdom/game-sdk",
    "@domdom/supabase-client",
  ],
};

export default nextConfig;
