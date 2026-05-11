import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://opensec.sh",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://opensec.sh/repos",
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: "https://opensec.sh/request",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://opensec.sh/donors",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
