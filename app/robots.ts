import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/research", "/about", "/contact"],
      disallow: [
        "/presentation",
        "/investors",
        "/docs",
        "/internal",
        "/dashboard",
        "/partners",
        "/funding",
      ],
    },
    sitemap: "https://wholebody.foundation/sitemap.xml",
    host: "https://wholebody.foundation",
  };
}
