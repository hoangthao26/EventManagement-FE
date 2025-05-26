import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  debug: false,
  env: {
    NEXTAUTH_DEBUG: 'false'
  }
};

export default nextConfig;
