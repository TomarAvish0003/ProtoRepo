import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caught Pokémon Registry (捕獲)",
  description: "Track and manage your registered Pokémon across all 9 generations with live completion statistics.",
};

export default function CaughtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
