"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  useTeamStore,
} from "@/app/hooks/useTeamStore";
import {
  PokemonFormat,
  LocalMoveEntry,
} from "@/app/utils/teamBuilder/types";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { computeDefenseMatrix, computeOffensiveCoverage } from "@/app/utils/teamBuilder/typeEngine";
import { FORMAT_CONFIGS, isPokemonLegal } from "@/app/utils/teamBuilder/formatEngine";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";

// Visual Analytics Components
import DefenseMatrixGrid from "@/app/components/teambuilder/DefenseMatrixGrid";
import OffensiveCoverageGraph from "@/app/components/teambuilder/OffensiveCoverageGraph";
import SpeedTierRuler from "@/app/components/teambuilder/SpeedTierRuler";
import TeamStatRadar from "@/app/components/teambuilder/TeamStatRadar";
import DamageCalculatorDrawer from "@/app/components/teambuilder/DamageCalculatorDrawer";
import ShowdownModal from "@/app/components/teambuilder/ShowdownModal";
import MemberInspector from "@/app/components/teambuilder/MemberInspector";
import MetaThreatHeatmap from "@/app/components/teambuilder/MetaThreatHeatmap";
import TacticalRoleGauge from "@/app/components/teambuilder/TacticalRoleGauge";
import DefensiveSwitchingNetwork from "@/app/components/teambuilder/DefensiveSwitchingNetwork";
import EffectiveBulkMatrix from "@/app/components/teambuilder/EffectiveBulkMatrix";
import SynergyRecommenderCard from "@/app/components/teambuilder/SynergyRecommenderCard";
import { getPokemonTierInfo } from "@/app/utils/teamBuilder/formatEngine";

import {
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Swords,
  Shield,
  Zap,
  Activity,
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Crosshair,
  Layers,
  Network,
  Scale,
} from "lucide-react";

interface TeamBuilderClientProps {
  pokedexData: FlatVarietyWithTypes[];
  movesData: Record<string, LocalMoveEntry>;
}

type AnalyticsTab =
  | "defense"
  | "pivots"
  | "coverage"
  | "heatmap"
  | "roles"
  | "speed"
  | "bulk"
  | "radar"
  | "calc";

export default function TeamBuilderClient({
  pokedexData,
  movesData,
}: TeamBuilderClientProps) {
  const {
    teams,
    activeTeamId,
    activeTeam,
    selectedMemberId,
    selectedMember,
    setActiveTeamId,
    setSelectedMemberId,
    createTeam,
    setTeamFormat,
    duplicateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
    swapMembers,
    importShowdown,
  } = useTeamStore();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("defense");
  const [showdownModalOpen, setShowdownModalOpen] = useState(false);
  const [showdownModalMode, setShowdownModalMode] = useState<"import" | "export">("export");
  const [addPokemonModalOpen, setAddPokemonModalOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>("all");
  const [modalDisplayLimit, setModalDisplayLimit] = useState(36);

  // Format details
  const activeFormatConfig = FORMAT_CONFIGS[activeTeam.format] || FORMAT_CONFIGS.gen9ou;

  // Compute 18x6 Defense Matrix across active team
  const defenseResult = useMemo(() => {
    return computeDefenseMatrix(activeTeam.members);
  }, [activeTeam.members]);

  // Compute Offensive Bipartite Coverage across active team
  const coverageReport = useMemo(() => {
    return computeOffensiveCoverage(activeTeam.members, movesData);
  }, [activeTeam.members, movesData]);

  // Filtered & Tier-Sorted Pokémon list for Add Pokemon modal
  const allMatchingPokemon = useMemo(() => {
    if (!addPokemonModalOpen) return [];
    let list = pokedexData;

    // Format legalities filter
    if (activeTeam.format !== "custom") {
      list = list.filter(
        (p) => isPokemonLegal(p.id, p.name, activeTeam.format).legal
      );
    }

    // Tier filter
    if (selectedTierFilter !== "all") {
      list = list.filter((p) => {
        const t = getPokemonTierInfo(p.name).tier.toUpperCase();
        if (selectedTierFilter === "ou") return t === "OU" || t === "UUBL";
        if (selectedTierFilter === "uu") return t === "UU" || t === "RUBL";
        if (selectedTierFilter === "ru")
          return (
            t === "RU" ||
            t === "NU" ||
            t === "PU" ||
            t === "ZU" ||
            t === "NUBL" ||
            t === "PUBL" ||
            t === "ZUBL"
          );
        if (selectedTierFilter === "uber") return t === "UBER" || t === "AG";
        return true;
      });
    }

    // Type filter
    if (selectedTypeFilter !== "all") {
      list = list.filter((p) =>
        p.types?.map((t: string) => t.toLowerCase()).includes(selectedTypeFilter)
      );
    }

    // Search query filter
    if (addSearchQuery.trim()) {
      const q = addSearchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || String(p.id) === q
      );
    }

    // Strategic Viability Sorting
    return [...list].sort((a, b) => {
      // Query prefix priority if searching
      if (addSearchQuery.trim()) {
        const q = addSearchQuery.toLowerCase().trim();
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }

      // Format-specific competitive sorting
      if (
        activeTeam.format === "gen9ou" ||
        activeTeam.format === "gen9uu" ||
        activeTeam.format === "natdex_ou" ||
        activeTeam.format === "gen9vgc"
      ) {
        const weightA = getPokemonTierInfo(a.name).sortWeight;
        const weightB = getPokemonTierInfo(b.name).sortWeight;
        if (weightA !== weightB) return weightB - weightA;
      } else if (activeTeam.format === "gen9ubers") {
        const tierA = getPokemonTierInfo(a.name).tier;
        const tierB = getPokemonTierInfo(b.name).tier;
        const aIsUber = tierA === "Uber" || tierA === "AG";
        const bIsUber = tierB === "Uber" || tierB === "AG";
        if (aIsUber && !bIsUber) return -1;
        if (!aIsUber && bIsUber) return 1;
      }

      // Secondary sort: Base Stat Total (BST)
      const bstA = a.stats?.bst ?? 0;
      const bstB = b.stats?.bst ?? 0;
      if (bstA !== bstB) return bstB - bstA;

      // Tertiary sort: Dex ID
      return a.id - b.id;
    });
  }, [
    addPokemonModalOpen,
    pokedexData,
    selectedTypeFilter,
    selectedTierFilter,
    activeTeam.format,
    addSearchQuery,
  ]);

  // Sliced for progressive infinite scroll
  const searchResults = useMemo(() => {
    return allMatchingPokemon.slice(0, modalDisplayLimit);
  }, [allMatchingPokemon, modalDisplayLimit]);

  const handleAddPokemonToTeam = (entry: FlatVarietyWithTypes) => {
    addMember(activeTeam.id, entry);
    setAddPokemonModalOpen(false);
    setAddSearchQuery("");
  };

  const handleOpenShowdown = (mode: "import" | "export") => {
    setShowdownModalMode(mode);
    setShowdownModalOpen(true);
  };

  const handleImportShowdownSuccess = (text: string) => {
    importShowdown(activeTeam.id, text, pokedexData);
  };

  return (
    <main className="min-h-screen bg-background text-on-surface pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Controls Bar: Squad Selector, Formats, and Import/Export */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Squad Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-on-surface-variant font-semibold">
              Squad:
            </span>
            <select
              value={activeTeamId}
              onChange={(e) => setActiveTeamId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-panel border border-border-crisp text-xs font-mono font-bold text-on-surface cursor-pointer focus:outline-none focus:border-primary"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.members.length}/6)
                </option>
              ))}
            </select>
          </div>

          {/* New Team & Clone */}
          <button
            onClick={() => createTeam()}
            className="p-1.5 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface border border-border-crisp transition-colors cursor-pointer"
            title="Create New Team"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => duplicateTeam(activeTeam.id)}
            className="p-1.5 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface border border-border-crisp transition-colors cursor-pointer"
            title="Duplicate Active Team"
          >
            <Copy className="w-4 h-4" />
          </button>
          {teams.length > 1 && (
            <button
              onClick={() => deleteTeam(activeTeam.id)}
              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
              title="Delete Active Team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Format Selector */}
          <div className="flex items-center gap-2 pl-3 border-l border-border-crisp">
            <span className="text-xs font-mono text-on-surface-variant font-semibold">
              Format:
            </span>
            <select
              value={activeTeam.format}
              onChange={(e) => setTeamFormat(activeTeam.id, e.target.value as PokemonFormat)}
              className="px-3 py-1.5 rounded-xl bg-slate-panel border border-border-crisp text-xs font-mono font-semibold text-primary cursor-pointer focus:outline-none focus:border-primary"
            >
              <optgroup label="Competitive Metagames">
                <option value="gen9ou">Gen 9 OU (Smogon)</option>
                <option value="gen9vgc">VGC 2026 / Reg G (Doubles)</option>
                <option value="gen9ubers">Gen 9 Ubers</option>
                <option value="gen9uu">Gen 9 UU</option>
                <option value="natdex_ou">National Dex OU</option>
              </optgroup>
              <optgroup label="Nintendo Game Generations">
                <option value="gen1">Gen 1: Red / Blue / Yellow</option>
                <option value="gen2">Gen 2: Gold / Silver / Crystal</option>
                <option value="gen3">Gen 3: Ruby / Sapphire / Emerald</option>
                <option value="gen4">Gen 4: Diamond / Pearl / Platinum</option>
                <option value="gen5">Gen 5: Black / White</option>
                <option value="gen6">Gen 6: X / Y</option>
                <option value="gen7">Gen 7: Sun / Moon</option>
                <option value="gen8">Gen 8: Sword / Shield</option>
                <option value="gen9">Gen 9: Scarlet / Violet</option>
              </optgroup>
              <optgroup label="Sandbox">
                <option value="custom">Showdown Freeform / Custom</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Action Buttons: Showdown Import / Export */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenShowdown("export")}
            className="px-3 py-1.5 rounded-xl border border-border-crisp bg-slate-panel hover:bg-slate-panel/80 text-xs font-mono text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Showdown Export
          </button>
          <button
            onClick={() => handleOpenShowdown("import")}
            className="px-3 py-1.5 rounded-xl border border-secondary/40 bg-secondary/15 hover:bg-secondary/25 text-xs font-mono font-bold text-secondary flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Showdown Import
          </button>
        </div>
      </div>

      {/* Smart Teammate Recommender (Weakness Auto-Resolver) */}
      <SynergyRecommenderCard
        members={activeTeam.members}
        format={activeTeam.format}
        pokedexData={pokedexData}
        onAddPokemon={(entry) => handleAddPokemonToTeam(entry)}
      />

      {/* 6-Slot Interactive Team Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-primary uppercase">
              Roster // チーム編成
            </span>
            <span className="text-xs font-mono text-on-surface-variant">
              ({activeTeam.members.length}/6 Slots Occupied)
            </span>
          </div>

          <span className="text-xs font-mono text-secondary font-semibold">
            Format: {activeFormatConfig.label} ({activeFormatConfig.kanji})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {activeTeam.members.map((member, idx) => {
            const isSelected = selectedMemberId === member.id;
            return (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                  isSelected
                    ? "bg-charcoal-surface border-primary shadow-[0_0_16px_rgba(255,51,85,0.25)] ring-1 ring-primary"
                    : "bg-charcoal-surface/70 border-border-crisp hover:border-primary/50 hover:bg-charcoal-surface"
                }`}
              >
                {/* Slot Order Badges & Swappers */}
                <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant mb-1.5">
                  <span className="font-bold text-primary">#{idx + 1}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          swapMembers(activeTeam.id, idx, idx - 1);
                        }}
                        className="p-0.5 rounded hover:bg-slate-panel"
                        title="Move Left"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < activeTeam.members.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          swapMembers(activeTeam.id, idx, idx + 1);
                        }}
                        className="p-0.5 rounded hover:bg-slate-panel"
                        title="Move Right"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Pokemon Sprite & Identity */}
                <div className="flex flex-col items-center text-center space-y-1 my-1">
                  <div className="w-16 h-16 relative p-1 rounded-xl bg-surface-container-low/80 border border-border-crisp transition-transform group-hover:scale-105">
                    {member.sprite && (
                      <Image
                        src={member.sprite}
                        alt={member.speciesName}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <span className="font-bold text-xs text-on-surface truncate max-w-[120px]">
                    {member.speciesName}
                  </span>
                  {/* Types */}
                  <div className="flex gap-1">
                    {member.types.map((t) => {
                      const conf = TYPE_CONFIGS[t.toLowerCase()];
                      return (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white uppercase"
                          style={{ backgroundColor: conf?.colorHex || "#666" }}
                        >
                          {t.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Compact Specs: Item, Ability, Tera */}
                <div className="text-[10px] font-mono text-on-surface-variant border-t border-border-crisp/60 pt-2 mt-2 space-y-0.5">
                  <p className="truncate" title={member.item || "None"}>
                    <strong className="text-on-surface">Item:</strong> {member.item || "None"}
                  </p>
                  <p className="truncate" title={member.ability || "None"}>
                    <strong className="text-on-surface">Ability:</strong> {member.ability || "Standard"}
                  </p>
                  {member.teraType && (
                    <p className="text-secondary font-semibold truncate">
                      Tera: {member.teraType}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty Slot Button */}
          {Array.from({ length: Math.max(0, 6 - activeTeam.members.length) }).map((_, i) => (
            <button
              key={`empty_slot_${i}`}
              onClick={() => setAddPokemonModalOpen(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-border-crisp/80 hover:border-primary/60 bg-charcoal-surface/30 hover:bg-slate-panel/40 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[180px] group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-panel group-hover:bg-primary/15 group-hover:text-primary border border-border-crisp flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
              </div>
              <span className="text-xs font-mono text-on-surface-variant group-hover:text-on-surface font-semibold">
                + Add Pokémon
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant/40">
                Slot {activeTeam.members.length + i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Member Detailed Inspector */}
      {selectedMember && (
        <MemberInspector
          member={selectedMember}
          movesData={movesData}
          format={activeTeam.format}
          onUpdate={(updater) => updateMember(activeTeam.id, selectedMember.id, updater)}
          onRemove={() => removeMember(activeTeam.id, selectedMember.id)}
          onOpenCalc={() => setActiveTab("calc")}
        />
      )}

      {/* Analytical Tabbed Suite */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-crisp pb-2">
          <button
            onClick={() => setActiveTab("defense")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "defense"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Shield className="w-4 h-4" />
            Defense Matrix (18×6)
          </button>

          <button
            onClick={() => setActiveTab("pivots")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "pivots"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Network className="w-4 h-4" />
            Pivot Network (Cycles)
          </button>

          <button
            onClick={() => setActiveTab("coverage")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "coverage"
                ? "bg-secondary text-black shadow-xs font-bold"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Swords className="w-4 h-4" />
            Offensive Coverage & Set Cover
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "heatmap"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Crosshair className="w-4 h-4" />
            Meta Matchup Heatmap (6×12)
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Layers className="w-4 h-4" />
            Tactical Roles & Win-Cons
          </button>

          <button
            onClick={() => setActiveTab("speed")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "speed"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Zap className="w-4 h-4" />
            Action Order & Speed Tiers
          </button>

          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "bulk"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Scale className="w-4 h-4" />
            Bulk Matrix (Phys vs Spec)
          </button>

          <button
            onClick={() => setActiveTab("radar")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "radar"
                ? "bg-primary text-white shadow-xs"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Activity className="w-4 h-4" />
            Team Stat Balance Radar
          </button>

          <button
            onClick={() => setActiveTab("calc")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "calc"
                ? "bg-secondary text-black shadow-xs font-bold"
                : "bg-charcoal-surface text-on-surface-variant hover:text-on-surface border border-border-crisp"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Damage Calculator Studio
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "defense" && (
          <DefenseMatrixGrid
            result={defenseResult}
            members={activeTeam.members}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {activeTab === "pivots" && (
          <DefensiveSwitchingNetwork
            members={activeTeam.members}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {activeTab === "coverage" && (
          <OffensiveCoverageGraph
            report={coverageReport}
          />
        )}

        {activeTab === "heatmap" && (
          <MetaThreatHeatmap
            members={activeTeam.members}
            onSelectMatchup={(memberId) => {
              setSelectedMemberId(memberId);
              setActiveTab("calc");
            }}
          />
        )}

        {activeTab === "roles" && (
          <TacticalRoleGauge
            members={activeTeam.members}
            movesData={movesData}
          />
        )}

        {activeTab === "speed" && (
          <SpeedTierRuler
            members={activeTeam.members}
            pokedexData={pokedexData}
            onSelectMember={(id) => setSelectedMemberId(id)}
            onUpdateMember={(id, updater) => updateMember(activeTeam.id, id, updater)}
          />
        )}

        {activeTab === "bulk" && (
          <EffectiveBulkMatrix
            members={activeTeam.members}
            pokedexData={pokedexData}
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        )}

        {activeTab === "radar" && (
          <TeamStatRadar
            members={activeTeam.members}
            selectedMember={selectedMember}
            pokedexData={pokedexData}
          />
        )}

        {activeTab === "calc" && selectedMember && (
          <DamageCalculatorDrawer
            attackerMember={selectedMember}
            pokedexData={pokedexData}
            movesData={movesData}
          />
        )}
      </div>

      {/* Showdown Import / Export Modal */}
      <ShowdownModal
        isOpen={showdownModalOpen}
        mode={showdownModalMode}
        team={activeTeam}
        onClose={() => setShowdownModalOpen(false)}
        onImportSuccess={handleImportShowdownSuccess}
      />

      {/* Add Pokémon Search Modal */}
      {addPokemonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-surface border border-border-crisp rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-crisp flex items-center justify-between bg-slate-panel/40">
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Add Pokémon to Team
                </h3>
                <span className="text-xs font-mono text-on-surface-variant">
                  Format: {activeFormatConfig.label} ({allMatchingPokemon.length} legal matches)
                </span>
              </div>
              <button
                onClick={() => setAddPokemonModalOpen(false)}
                className="p-2 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface-variant hover:text-on-surface border border-border-crisp transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-border-crisp space-y-3 bg-charcoal-surface">
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addSearchQuery}
                  onChange={(e) => {
                    setAddSearchQuery(e.target.value);
                    setModalDisplayLimit(36);
                  }}
                  placeholder="Search Pokémon by name or ID..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-panel border border-border-crisp text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Tier Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                <span className="text-on-surface-variant font-bold mr-1">Tier:</span>
                <button
                  onClick={() => {
                    setSelectedTierFilter("all");
                    setModalDisplayLimit(36);
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedTierFilter === "all"
                      ? "bg-primary text-white font-bold"
                      : "bg-slate-panel text-on-surface-variant hover:bg-slate-panel/80"
                  }`}
                >
                  All Legal
                </button>
                <button
                  onClick={() => {
                    setSelectedTierFilter("ou");
                    setModalDisplayLimit(36);
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedTierFilter === "ou"
                      ? "bg-red-500 text-white font-bold"
                      : "bg-slate-panel text-red-400 hover:bg-slate-panel/80"
                  }`}
                >
                  OU Staples
                </button>
                <button
                  onClick={() => {
                    setSelectedTierFilter("uu");
                    setModalDisplayLimit(36);
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedTierFilter === "uu"
                      ? "bg-blue-500 text-white font-bold"
                      : "bg-slate-panel text-blue-400 hover:bg-slate-panel/80"
                  }`}
                >
                  UU Tier
                </button>
                <button
                  onClick={() => {
                    setSelectedTierFilter("ru");
                    setModalDisplayLimit(36);
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedTierFilter === "ru"
                      ? "bg-amber-500 text-white font-bold"
                      : "bg-slate-panel text-amber-400 hover:bg-slate-panel/80"
                  }`}
                >
                  RU / Lower
                </button>
                {activeTeam.format === "gen9ubers" && (
                  <button
                    onClick={() => {
                      setSelectedTierFilter("uber");
                      setModalDisplayLimit(36);
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      selectedTierFilter === "uber"
                        ? "bg-purple-500 text-white font-bold"
                        : "bg-slate-panel text-purple-400 hover:bg-slate-panel/80"
                    }`}
                  >
                    Ubers Only
                  </button>
                )}
              </div>

              {/* Type Filter Pills */}
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                <button
                  onClick={() => {
                    setSelectedTypeFilter("all");
                    setModalDisplayLimit(36);
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedTypeFilter === "all"
                      ? "bg-primary text-white font-bold"
                      : "bg-slate-panel text-on-surface-variant"
                  }`}
                >
                  All Types
                </button>
                {["fire", "water", "grass", "electric", "dragon", "steel", "fairy", "ground", "ghost"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTypeFilter(t);
                      setModalDisplayLimit(36);
                    }}
                    className={`px-2 py-0.5 rounded capitalize cursor-pointer ${
                      selectedTypeFilter === t
                        ? "bg-primary text-white font-bold"
                        : "bg-slate-panel text-on-surface-variant"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {searchResults.map((entry) => {
                const tierInfo = getPokemonTierInfo(entry.name);
                const tier = tierInfo.tier;
                const isOU = tier === "OU";
                const isUU = tier === "UU" || tier === "UUBL";
                const isUber = tier === "Uber" || tier === "AG";
                const isRU = tier === "RU" || tier === "RUBL" || tier === "NU" || tier === "PU";

                return (
                  <button
                    key={entry.id}
                    onClick={() => handleAddPokemonToTeam(entry)}
                    className="p-3 rounded-xl bg-slate-panel/30 hover:bg-slate-panel border border-border-crisp hover:border-primary/50 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 relative rounded-lg bg-surface-container-low border border-border-crisp p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                      {entry.sprite && (
                        <Image
                          src={entry.sprite}
                          alt={entry.name}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          #{String(entry.id).padStart(4, "0")}
                        </span>
                        {tier && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border ${
                              isOU
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : isUU
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : isUber
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                : isRU
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-slate-panel text-on-surface-variant border-border-crisp"
                            }`}
                          >
                            {tier}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-on-surface capitalize truncate">
                        {entry.name}
                      </h4>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <div className="flex gap-1">
                          {entry.types?.map((t: string) => {
                            const conf = TYPE_CONFIGS[t.toLowerCase()];
                            return (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded text-[8px] font-bold text-white uppercase"
                                style={{ backgroundColor: conf?.colorHex || "#666" }}
                              >
                                {t.slice(0, 3)}
                              </span>
                            );
                          })}
                        </div>
                        {entry.stats?.bst && (
                          <span className="text-[9px] font-mono text-on-surface-variant/75">
                            {entry.stats.bst}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progressive Pagination Footer */}
            {allMatchingPokemon.length > searchResults.length && (
              <div className="p-3 border-t border-border-crisp flex items-center justify-between bg-charcoal-surface/90 text-xs font-mono">
                <span className="text-on-surface-variant">
                  Showing {searchResults.length} of {allMatchingPokemon.length} legal Pokémon
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalDisplayLimit((prev) => prev + 36)}
                    className="px-3 py-1 rounded-xl bg-slate-panel hover:bg-slate-panel/80 text-on-surface border border-border-crisp transition-colors cursor-pointer"
                  >
                    + Load More (36)
                  </button>
                  <button
                    onClick={() => setModalDisplayLimit(allMatchingPokemon.length)}
                    className="px-3 py-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-bold transition-colors cursor-pointer"
                  >
                    Show All ({allMatchingPokemon.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

