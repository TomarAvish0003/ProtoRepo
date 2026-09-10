import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Profile and Terminal Settings",
  description: "Manage your ProtoDex trainer credentials, cloud-synced catalog data, avatar telemetry, and account preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
