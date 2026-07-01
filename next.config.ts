import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Bust the precached route HTML on every commit.
const revision = (spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout || "").trim() || "dev";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Precache the exported HTML for each route so navigations work fully offline.
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/exam", revision },
    { url: "/practice", revision },
    { url: "/history", revision },
  ],
});
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};
export default withSerwist(nextConfig);
