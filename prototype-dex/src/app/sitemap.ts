import type { MetadataRoute } from "next";
import pokedexData from "@/app/data/pokedex-data.json";

interface PokemonCatalogItem {
  id: number;
  name: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://proto-repo.vercel.app";
  const now = new Date();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pokedex`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Dynamic Specimen Routes for all 1,025 Pokemon
  const catalog = pokedexData as PokemonCatalogItem[];
  const pokemonRoutes: MetadataRoute.Sitemap = catalog.map((p) => ({
    url: `${baseUrl}/pokemon/${p.name.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...pokemonRoutes];
}
