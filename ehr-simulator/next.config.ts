import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
