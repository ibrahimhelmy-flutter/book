import type { NextConfig } from "next";
import { execSync } from "child_process";

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isNetlify = process.env.NETLIFY === "true";
const isGitHubPages = !isVercel && !isNetlify && (process.env.GITHUB_ACTIONS === "true" || isProd);
// Base path for GitHub Pages repo (e.g. /book) or root for Vercel/custom domain
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (isGitHubPages ? "/book" : "");

// One build id per deploy (the commit), also written into every page as <meta name="app-build-id">
// (src/app/layout.tsx): an open tab compares it with out/version.json (scripts/build.mjs) to offer a
// reload after a deploy.
function resolveBuildId(): string {
  const fromEnv = process.env.APP_BUILD_ID || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 12);
  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return `local-${Date.now()}`;
  }
}
const buildId = resolveBuildId();
// Child processes that load this config again reuse the same id
process.env.APP_BUILD_ID = buildId;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: isDev ? ".next-dev" : ".next",
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  generateBuildId: async () => buildId,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    APP_BUILD_ID: buildId,
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
        ignored: ["**/node_modules", "**/.git", "**/.next", "**/.next-dev"],
      };
    }
    return config;
  },
};

export default nextConfig;
