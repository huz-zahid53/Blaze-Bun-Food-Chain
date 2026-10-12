import type { MetadataRoute } from "next";
import { posts } from "@/data/blog";
import { menuItems, categories } from "@/data/menu";
import { branches } from "@/data/branches";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blazeandbun.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/menu",
    "/deals",
    "/locations",
    "/cart",
    "/checkout",
    "/track",
    "/about",
    "/contact",
    "/blog",
    "/franchise",
    "/careers",
    "/catering",
    "/feedback",
    "/legal",
  ].map((route) => ({
    url: `${BASE}${route}`,
    lastModified: now,
    changeFrequency: (route === "" ? "daily" : "weekly") as
      | "daily"
      | "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const itemRoutes = menuItems.map((i) => ({
    url: `${BASE}/menu?item=${i.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE}/menu#${c.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const cityRoutes = Array.from(new Set(branches.map((b) => b.city))).map(
    (city) => ({
      url: `${BASE}/locations?city=${encodeURIComponent(city)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }),
  );

  return [
    ...staticRoutes,
    ...postRoutes,
    ...itemRoutes,
    ...categoryRoutes,
    ...cityRoutes,
  ];
}
