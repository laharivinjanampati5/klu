import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GST GraphRecon AI",
    short_name: "GraphRecon AI",
    description: "Install the GST GraphRecon AI dashboard to desktop for faster access to reconciliation, audit, and vendor intelligence.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0F1A",
    theme_color: "#0B1929",
    lang: "en-IN",
    categories: ["finance", "productivity", "business"],
    icons: [
      {
        src: "/pwa-icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
