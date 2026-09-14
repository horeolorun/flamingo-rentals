import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    browserToTerminal: true,
    // 'error' - errors only (default)
    // 'warn' - errors and warnings
    // true - all console output (including console.log)
    // false - disabled
  },
};

export default nextConfig;
