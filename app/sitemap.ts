import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  articles,
  getLatest,
  sectionSlug,
  sections,
} from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const newest = getLatest(1)[0];

  const frontPage: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: newest.date,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/news"),
      lastModified: newest.date,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const sectionPages: MetadataRoute.Sitemap = sections.map((section) => ({
    url: absoluteUrl(`/section/${sectionSlug(section)}`),
    lastModified: newest.date,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const storyPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/article/${article.slug}`),
    lastModified: article.date,
    changeFrequency: "never",
    priority: 0.6,
  }));

  return [...frontPage, ...sectionPages, ...storyPages];
}
