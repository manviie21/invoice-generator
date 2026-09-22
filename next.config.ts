import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Include font assets in serverless function bundles on Vercel
  outputFileTracingIncludes: {
    "/api/**/*": ["./public/fonts/**/*", "./assets/fonts/**/*"],
    "/api/invoices/[id]/pdf": ["./public/fonts/**/*", "./assets/fonts/**/*"],
  },
};

export default nextConfig;
