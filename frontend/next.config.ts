import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  // Keep a running local preview separate from the production build artifacts.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
export default nextConfig;
