import type { MetadataRoute } from "next";

const routes = ["", "/research", "/about", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://wholebody.foundation${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "quarterly",
    priority: route === "" ? 1 : 0.7,
  }));
}
