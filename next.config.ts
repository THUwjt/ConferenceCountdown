import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  // When deploying to GitHub Pages under a repo name, set basePath.
  // For user sites (username.github.io) or custom domains, remove basePath.
  basePath: isGitHubPages ? "/ConferenceCountdown" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
