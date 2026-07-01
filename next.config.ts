import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/cca") to deploy under a subpath: assets/links are
// prefixed and the PWA (service worker + manifest) is disabled. Unset = root deploy w/ full PWA.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Bust the precached route HTML on every commit.
const revision = (spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout || "").trim() || "dev";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: basePath !== "",
  // Precache the exported HTML for each route so navigations work fully offline.
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/exam", revision },
    { url: "/practice", revision },
    { url: "/history", revision },
    { url: "/study", revision },
    { url: "/study/agent-architecture", revision },
    { url: "/study/claude-code-config", revision },
    { url: "/study/prompt-engineering", revision },
    { url: "/study/tool-mcp-design", revision },
    { url: "/study/context-reliability", revision },
    { url: "/study/exam-overview", revision },
    { url: "/study/glossary", revision },
    { url: "/study/out-of-scope", revision },
  ],
});
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};
export default withSerwist(nextConfig);
