import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorite Pokémon Archive (お気に入り)",
  description: "Quick access terminal for your bookmarked Pokémon dossiers, competitive candidates, and priority specimens.",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
