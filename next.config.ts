import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js (via unpdf) and tokenizer data should load from node_modules at runtime.
  serverExternalPackages: ["unpdf", "mammoth", "linkedom"],
  async headers() {
    return [
      {
        // The chat page is embedded by widget.js on any customer site.
        source: "/chat",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        // Everything else (admin included) may only be framed by ourselves.
        source: "/((?!chat$).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/widget.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
