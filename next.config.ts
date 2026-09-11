import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isNetlify = process.env.NETLIFY === "true";
const isGitHubPages = !isVercel && !isNetlify && (process.env.GITHUB_ACTIONS === "true" || isProd);
// Base path for GitHub Pages repo (e.g. /book) or root for Vercel/custom domain
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (isGitHubPages ? "/book" : "");

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
  experimental: {
    // Prevent OneDrive file-locking conflicts (ENOENT/PageNotFoundError) during build on Windows
    cpus: process.platform === "win32" ? 1 : undefined,
    workerThreads: process.platform === "win32" ? false : undefined,
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
