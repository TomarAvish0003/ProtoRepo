import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Registration",
  description: "Create a new ProtoDex trainer profile to synchronize research records, tournament teams, and caught Pokémon.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
