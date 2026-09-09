"use client";

import React, { useState, useEffect } from "react";
import { Team } from "@/app/utils/teamBuilder/types";
import { exportToShowdownText } from "@/app/utils/teamBuilder/showdownParser";
import { X, Copy, Check, Download, Upload, FileText, AlertCircle } from "lucide-react";

interface ShowdownModalProps {
  isOpen: boolean;
  mode: "import" | "export";
  team: Team;
  onClose: () => void;
  onImportSuccess: (text: string) => void;
}

export default function ShowdownModal({
  isOpen,
  mode: initialMode,
  team,
  onClose,
  onImportSuccess,
}: ShowdownModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "export">(initialMode);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialMode);
    setImportError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const exportText = exportToShowdownText(team);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([exportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${team.name.replace(/\s+/g, "_")}_showdown.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = () => {
    setImportError(null);
    if (!inputText.trim()) {
      setImportError("Please paste standard Pokémon Showdown export text.");
      return;
    }
    onImportSuccess(inputText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-charcoal-surface border border-border-crisp rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-crisp flex items-center justify-between bg-slate-panel/40">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-on-surface">
                Pokémon Showdown Format Interop
              </h3>
              <span className="text-xs font-mono text-on-surface-variant">
                Universal Two-Way Text Serializer
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface-variant hover:text-on-surface border border-border-crisp transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-border-crisp text-xs font-mono">
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === "export"
                ? "bg-primary/10 text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Export Showdown Format
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === "import"
                ? "bg-secondary/10 text-secondary border-b-2 border-secondary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Showdown Text
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === "export" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                <span>{team.name} ({team.members.length}/6 Pokémon)</span>
                <span>Standard Smogon Format</span>
              </div>
              <textarea
                readOnly
                value={exportText}
                rows={14}
                className="w-full p-4 rounded-xl bg-slate-panel/60 border border-border-crisp text-xs font-mono text-on-surface resize-none focus:outline-none focus:border-primary select-all leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                <span>Paste Showdown team or Pokémon text below:</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Garchomp @ Life Orb\nAbility: Rough Skin\nTera Type: Steel\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Earthquake\n- Swords Dance\n- Scale Shot\n- Iron Head`}
                rows={14}
                className="w-full p-4 rounded-xl bg-slate-panel/60 border border-border-crisp text-xs font-mono text-on-surface resize-none focus:outline-none focus:border-secondary leading-relaxed"
              />
              {importError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-crisp flex items-center justify-between bg-slate-panel/30">
          <span className="text-xs font-mono text-on-surface-variant">
            Compatible with Pokémon Showdown & Smogon tournaments
          </span>
          <div className="flex items-center gap-2">
            {activeTab === "export" ? (
              <>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl border border-border-crisp bg-slate-panel hover:bg-slate-panel/80 text-xs font-mono text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .txt
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleImport}
                className="px-4 py-1.5 rounded-xl bg-secondary text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs hover:bg-secondary/90 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Team
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
