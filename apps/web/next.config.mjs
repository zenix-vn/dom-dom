/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@domdom/core",
    "@domdom/game-sdk",
    "@domdom/supabase-client",
  ],
};

export default nextConfig;
