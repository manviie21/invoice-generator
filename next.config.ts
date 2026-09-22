import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Include font assets in serverless function bundles on Vercel
  outputFileTracingIncludes: {
    "/api/invoices/[id]/pdf": ["./assets/fonts/**/*", "./assets/**/*"],
  },
};

export default nextConfig;
