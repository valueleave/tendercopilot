import type { NextConfig } from "next/dist/server/config-shared";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
