import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Base path for GitHub Pages repo (e.g. /book)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? "/book" : "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Optimize file watching and prevent file lock conflicts on Windows / OneDrive
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
        ignored: ["**/node_modules", "**/.git", "**/.next"],
      };
    }
    return config;
  },
};

export default nextConfig;
