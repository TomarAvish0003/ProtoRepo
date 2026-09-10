import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Sign In",
  description: "Secure authentication terminal for ProtoDex. Access your caught Pokémon, bookmarks, and battle teams.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
