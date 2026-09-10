import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "National Pokédex (全国図鑑)",
  description:
    "Complete National Pokédex catalog covering Generation I through IX with real-time multi-type filtering, Japanese nomenclature, base stat totals, and quick specimen telemetry.",
  openGraph: {
    title: "National Pokédex (全国図鑑) // ProtoDex",
    description:
      "Explore all 1,025 Pokémon across 9 generations with interactive sorting, audio cries, and statistical breakdowns.",
  },
};

export default function PokedexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
