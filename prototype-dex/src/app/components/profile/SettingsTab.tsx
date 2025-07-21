"use client";
import ThemeToggle from "@/app/components/ThemeToggle";
import ExportImportSection from "@/app/components/profile/ExportImportSection";
import DeleteAccountSection from "@/app/components/profile/DeleteAccountSection";

export default function SettingsTab() {
  return (
    <div className="flex flex-col gap-6 py-8 max-w-lg mx-auto">
      <ThemeToggle />
      <ExportImportSection />
      <DeleteAccountSection />
    </div>
  );
}
