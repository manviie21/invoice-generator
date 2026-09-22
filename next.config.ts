import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "pdfkit"],
  // Include font assets and pdfkit standard fonts in serverless function bundles on Vercel
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./public/fonts/**/*",
      "./assets/fonts/**/*",
      "./node_modules/pdfkit/**/*",
      "./node_modules/pdfkit/js/standard-fonts/**/*",
      "./node_modules/pdfkit/js/data/**/*",
    ],
    "/api/invoices/[id]/pdf": [
      "./public/fonts/**/*",
      "./assets/fonts/**/*",
      "./node_modules/pdfkit/**/*",
      "./node_modules/pdfkit/js/standard-fonts/**/*",
      "./node_modules/pdfkit/js/data/**/*",
    ],
  },
};

export default nextConfig;
