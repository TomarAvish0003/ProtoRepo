"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { TeamMember, PokemonType } from "@/app/utils/teamBuilder/types";
import { META_THREATS_LIST, MetaThreat } from "@/app/utils/teamBuilder/metaThreats";
import { TYPE_CHART } from "@/app/utils/teamBuilder/typeEngine";
import { TYPE_CONFIGS } from "@/app/utils/pokemonDataHelpers";
import { calcActualStat, getNatureMultiplier } from "@/app/utils/teamBuilder/damageCalcEngine";
import pokedexDataRaw from "@/app/data/pokedex-data.json";
import { ShieldAlert, Crosshair, HelpCircle, ExternalLink } from "lucide-react";

const POKEDEX_MAP = new Map<number, { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }>(
  (pokedexDataRaw as Array<{ id: number; stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } }>).map(
    (p) => [p.id, p.stats]
  )
);

interface MetaThreatHeatmapProps {
  members: TeamMember[];
  onSelectMatchup?: (memberId: string, threat: MetaThreat) => void;
}

export interface MatchupEvaluation {
  score: number; // -100 to +100
  verdict: "DOMINANT" | "ADVANTAGE" | "EVEN" | "DISADVANTAGE" | "COUNTERED";
  speedDiff: number;
  outSpeeds: boolean;
  memberMaxOffense: number;
  threatMaxOffense: number;
  offensiveDetails: string;
  defensiveDetails: string;
  memberSpeed: number;
  threatSpeed: number;
}

export default function MetaThreatHeatmap({
  members,
  onSelectMatchup,
}: MetaThreatHeatmapProps) {
  const [filterTier, setFilterTier] = useState<"ALL" | "OU" | "VGC">("ALL");
  const [selectedCell, setSelectedCell] = useState<{
    member: TeamMember;
    threat: MetaThreat;
    eval: MatchupEvaluation;
  } | null>(null);

  const filteredThreats = useMemo(() => {
    if (filterTier === "ALL") return META_THREATS_LIST;
    return META_THREATS_LIST.filter((t) => t.formatTier === filterTier);
  }, [filterTier]);

  // Evaluates member vs threat matchup algorithmically
  const evaluateMatchup = (
    member: TeamMember,
    threat: MetaThreat
  ): MatchupEvaluation => {
    // 1. Speed Evaluation
    const memberBaseStats = POKEDEX_MAP.get(member.pokemonId);
    const memberNatureMult = getNatureMultiplier(member.nature, "spe");
    const rawMemberSpeed = calcActualStat(
      memberBaseStats?.spe || 80,
      member.ivs.spe,
      member.evs.spe,
      member.level,
      memberNatureMult,
      false
    );
    const hasScarf = member.item?.toLowerCase().replace(/[\s-_]/g, "") === "choicescarf";
    const hasBooster =
      member.item?.toLowerCase().replace(/[\s-_]/g, "") === "boosterenergy" &&
      (member.ability?.toLowerCase().includes("proto") || member.ability?.toLowerCase().includes("quark"));

    let memberSpeed = rawMemberSpeed;
    if (hasScarf) memberSpeed = Math.floor(memberSpeed * 1.5);
    if (hasBooster) memberSpeed = Math.floor(memberSpeed * 1.5);

    const threatNatureMult = getNatureMultiplier(threat.nature, "spe");
    const threatSpeed = calcActualStat(
      threat.baseStats.spe,
      threat.ivs.spe,
      threat.evs.spe,
      threat.level,
      threatNatureMult,
      false
    );

    let speedScore = 0;
    const speedDiff = memberSpeed - threatSpeed;
    const outSpeeds = memberSpeed > threatSpeed;
    if (speedDiff >= 5) speedScore = 20;
    else if (speedDiff <= -5) speedScore = -20;

    // 2. Member Offensive Capability against Threat
    const offensiveTypes: PokemonType[] = member.types.map(
      (t) => t.toLowerCase() as PokemonType
    );
    if (member.teraType) {
      offensiveTypes.push(member.teraType.toLowerCase() as PokemonType);
    }

    let maxMemberMultiplier = 0;
    let bestOffType = offensiveTypes[0] || "normal";

    for (const atkType of offensiveTypes) {
      let mult = 1.0;
      for (const defType of threat.types) {
        const row = TYPE_CHART[atkType];
        if (row && row[defType.toLowerCase() as PokemonType] !== undefined) {
          mult *= row[defType.toLowerCase() as PokemonType];
        }
      }
      if (mult > maxMemberMultiplier) {
        maxMemberMultiplier = mult;
        bestOffType = atkType;
      }
    }

    let offenseScore = 0;
    if (maxMemberMultiplier >= 4.0) offenseScore = 40;
    else if (maxMemberMultiplier >= 2.0) offenseScore = 25;
    else if (maxMemberMultiplier === 0) offenseScore = -30;
    else if (maxMemberMultiplier <= 0.5) offenseScore = -15;

    // 3. Threat Offensive Capability against Member
    let maxThreatMultiplier = 0;
    let worstDefType = threat.types[0] || "normal";

    const memberDefTypes = member.types.map((t) => t.toLowerCase() as PokemonType);

    for (const threatAtk of threat.types) {
      const atkType = threatAtk.toLowerCase() as PokemonType;
      let mult = 1.0;
      for (const defType of memberDefTypes) {
        const row = TYPE_CHART[atkType];
        if (row && row[defType] !== undefined) {
          mult *= row[defType];
        }
      }

      // Check ability immunities
      const ab = (member.ability || "").toLowerCase();
      if (atkType === "ground" && (ab === "levitate" || member.item === "Air Balloon")) mult = 0;
      if (atkType === "fire" && ab === "flash fire") mult = 0;
      if (atkType === "water" && ab === "water absorb") mult = 0;
      if (atkType === "electric" && (ab === "volt absorb" || ab === "motor drive")) mult = 0;

      if (mult > maxThreatMultiplier) {
        maxThreatMultiplier = mult;
        worstDefType = threatAtk;
      }
    }

    let defenseScore = 0;
    if (maxThreatMultiplier >= 4.0) defenseScore = -40;
    else if (maxThreatMultiplier >= 2.0) defenseScore = -25;
    else if (maxThreatMultiplier === 0) defenseScore = 35;
    else if (maxThreatMultiplier <= 0.5) defenseScore = 20;

    // Composite clamped score
    const rawScore = speedScore + offenseScore + defenseScore;
    const score = Math.max(-100, Math.min(100, rawScore));

    let verdict: MatchupEvaluation["verdict"] = "EVEN";
    if (score >= 45) verdict = "DOMINANT";
    else if (score >= 15) verdict = "ADVANTAGE";
    else if (score <= -45) verdict = "COUNTERED";
    else if (score <= -15) verdict = "DISADVANTAGE";

    return {
      score,
      verdict,
      speedDiff,
      outSpeeds,
      memberMaxOffense: maxMemberMultiplier,
      threatMaxOffense: maxThreatMultiplier,
      offensiveDetails: `${bestOffType.toUpperCase()} hits for ${maxMemberMultiplier}x`,
      defensiveDetails: `Takes ${maxThreatMultiplier}x from ${worstDefType.toUpperCase()}`,
      memberSpeed,
      threatSpeed,
    };
  };

  // Matrix of results [memberIndex][threatIndex]
  const matrix = useMemo(() => {
    return members.map((member) => {
      return filteredThreats.map((threat) => {
        return evaluateMatchup(member, threat);
      });
    });
  }, [members, filteredThreats]);

  // Aggregate Metagame Coverage Score
  const coverageAnalysis = useMemo(() => {
    if (members.length === 0) {
      return { coveredCount: 0, total: filteredThreats.length, ratio: 0, uncoveredThreats: [] };
    }

    const uncovered: MetaThreat[] = [];

    filteredThreats.forEach((threat, tIdx) => {
      const hasAnswer = members.some((_, mIdx) => {
        const cell = matrix[mIdx]?.[tIdx];
        return cell && cell.score >= 15;
      });

      if (!hasAnswer) {
        uncovered.push(threat);
      }
    });

    const coveredCount = filteredThreats.length - uncovered.length;
    const ratio = Math.round((coveredCount / filteredThreats.length) * 100);

    return {
      coveredCount,
      total: filteredThreats.length,
      ratio,
      uncoveredThreats: uncovered,
    };
  }, [members, filteredThreats, matrix]);

  const getVerdictStyle = (verdict: MatchupEvaluation["verdict"]) => {
    switch (verdict) {
      case "DOMINANT":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30";
      case "ADVANTAGE":
        return "bg-lime-500/15 text-lime-400 border-lime-500/30 hover:bg-lime-500/25";
      case "EVEN":
        return "bg-slate-panel/60 text-on-surface-variant border-border-crisp hover:bg-slate-panel";
      case "DISADVANTAGE":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25";
      case "COUNTERED":
        return "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30";
    }
  };

  const getVerdictBadge = (verdict: MatchupEvaluation["verdict"]) => {
    switch (verdict) {
      case "DOMINANT":
        return "+Win";
      case "ADVANTAGE":
        return "+Adv";
      case "EVEN":
        return "Even";
      case "DISADVANTAGE":
        return "-Dis";
      case "COUNTERED":
        return "-Loss";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Meta Coverage Health Metric */}
      <div className="p-5 rounded-2xl bg-charcoal-surface border border-border-crisp flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-on-surface">
              Metagame Threat Advantage Matrix
            </h3>
            <span className="text-xs font-mono text-primary font-bold">
              {"// 実戦対戦相性表"}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Algorithmic 6×12 matchup tensor evaluating speed initiative, STAB damage exchange, and defensive immunity profiles.
          </p>
        </div>

        {/* Tier Scope Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {(["ALL", "OU", "VGC"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1 rounded-xl border transition-colors cursor-pointer ${
                filterTier === t
                  ? "bg-primary text-white border-primary font-bold shadow-xs"
                  : "bg-slate-panel text-on-surface-variant border-border-crisp hover:bg-slate-panel/80"
              }`}
            >
              {t === "ALL" ? "All Threats (12)" : `${t} Meta (${t === "OU" ? 8 : 4})`}
            </button>
          ))}
        </div>
      </div>

      {/* Team Readiness Summary Banner */}
      <div className="p-4 rounded-2xl bg-slate-panel/40 border border-border-crisp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base shrink-0 border ${
              coverageAnalysis.ratio >= 80
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : coverageAnalysis.ratio >= 60
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-red-500/20 text-red-400 border-red-500/40"
            }`}
          >
            {coverageAnalysis.ratio}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">
                Team Metagame Readiness Index
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-surface border border-border-crisp text-on-surface-variant">
                {coverageAnalysis.coveredCount} / {coverageAnalysis.total} Threats Handled
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {coverageAnalysis.ratio >= 80
                ? "High competitive coverage: Your team possesses clear positive answers against dominant tournament threats."
                : coverageAnalysis.ratio >= 60
                ? "Moderate coverage: Some top threats have no clean counter; positioning will require strict prediction."
                : "Defensive holes detected: Multiple metagame anchors exert unmitigated offensive pressure on this roster."}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono shrink-0">
          <span className="px-2 py-0.5 rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
            +Win (Hard Check)
          </span>
          <span className="px-2 py-0.5 rounded border bg-lime-500/15 text-lime-400 border-lime-500/30">
            +Adv (Favored)
          </span>
          <span className="px-2 py-0.5 rounded border bg-slate-panel text-on-surface-variant border-border-crisp">
            Even
          </span>
          <span className="px-2 py-0.5 rounded border bg-amber-500/15 text-amber-400 border-amber-500/30">
            -Dis (Unfavored)
          </span>
          <span className="px-2 py-0.5 rounded border bg-red-500/20 text-red-400 border-red-500/40">
            -Loss (Countered)
          </span>
        </div>
      </div>

      {/* Critical Threat Warnings */}
      {coverageAnalysis.uncoveredThreats.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Meta Threat Vulnerability Alert: </span>
            Your team currently lacks an advantageous switch-in against{" "}
            {coverageAnalysis.uncoveredThreats.map((t) => t.name).join(", ")}. Consider adjusting moves or EVs to ensure an offensive check.
          </div>
        </div>
      )}

      {/* Interactive 6x12 Matrix Table */}
      <div className="rounded-2xl bg-charcoal-surface border border-border-crisp overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header: Opposing Meta Threats */}
            <thead>
              <tr className="border-b border-border-crisp bg-slate-panel/60">
                <th className="p-3 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider sticky left-0 bg-slate-panel/90 backdrop-blur-md z-10 w-44 border-r border-border-crisp">
                  Active Pokémon
                </th>
                {filteredThreats.map((threat) => (
                  <th
                    key={threat.id}
                    className="p-2.5 text-center min-w-[90px] border-r border-border-crisp/50 last:border-r-0"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low border border-border-crisp p-0.5 mb-1 flex items-center justify-center">
                        <span className="text-[9px] font-mono font-bold text-on-surface truncate">
                          {threat.name.slice(0, 3)}
                        </span>
                      </div>
                      <span className="font-bold text-[11px] text-on-surface truncate max-w-[85px]">
                        {threat.name}
                      </span>
                      <div className="flex gap-0.5 mt-0.5">
                        {threat.types.map((t) => {
                          const conf = TYPE_CONFIGS[t.toLowerCase()];
                          return (
                            <span
                              key={t}
                              className="px-1 py-0.2 rounded text-[7px] font-bold text-white uppercase"
                              style={{ backgroundColor: conf?.colorHex || "#666" }}
                            >
                              {t.slice(0, 3)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Team Members (Rows) */}
            <tbody className="divide-y divide-border-crisp font-mono">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={filteredThreats.length + 1}
                    className="p-8 text-center text-on-surface-variant text-xs"
                  >
                    No Pokémon in active roster. Add Pokémon above to generate the threat advantage heatmap.
                  </td>
                </tr>
              ) : (
                members.map((member, mIdx) => (
                  <tr key={member.id} className="hover:bg-slate-panel/20 transition-colors">
                    {/* Row Sticky Header: Team Member */}
                    <td className="p-3 sticky left-0 bg-charcoal-surface/95 backdrop-blur-md z-10 border-r border-border-crisp">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 relative rounded-lg bg-slate-panel border border-border-crisp p-0.5 shrink-0">
                          {member.sprite && (
                            <Image
                              src={member.sprite}
                              alt={member.name}
                              fill
                              sizes="36px"
                              className="object-contain"
                            />
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-primary font-bold">
                            #{mIdx + 1}
                          </span>
                          <h4 className="font-bold text-xs text-on-surface capitalize truncate">
                            {member.name}
                          </h4>
                          <span className="text-[9px] text-on-surface-variant">
                            Level {member.level}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Matrix Cells */}
                    {filteredThreats.map((threat, tIdx) => {
                      const res = matrix[mIdx]?.[tIdx];
                      if (!res) return <td key={threat.id} className="p-2" />;

                      const isSelected =
                        selectedCell?.member.id === member.id &&
                        selectedCell?.threat.id === threat.id;

                      return (
                        <td
                          key={threat.id}
                          onClick={() => {
                            setSelectedCell({ member, threat, eval: res });
                            if (onSelectMatchup) onSelectMatchup(member.id, threat);
                          }}
                          className="p-1.5 text-center border-r border-border-crisp/30 last:border-r-0 cursor-pointer"
                        >
                          <div
                            className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${getVerdictStyle(
                              res.verdict
                            )} ${
                              isSelected
                                ? "ring-2 ring-primary scale-105 shadow-md"
                                : ""
                            }`}
                          >
                            <span className="text-xs font-bold font-mono">
                              {getVerdictBadge(res.verdict)}
                            </span>
                            <span className="text-[9px] opacity-75">
                              {res.score > 0 ? `+${res.score}` : res.score}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Matchup Inspector Drawer / Card */}
      {selectedCell && (
        <div className="p-5 rounded-2xl bg-charcoal-surface border border-primary/40 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-border-crisp pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                Matchup Diagnostic: {selectedCell.member.name} vs {selectedCell.threat.name}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getVerdictStyle(
                  selectedCell.eval.verdict
                )}`}
              >
                {selectedCell.eval.verdict} ({selectedCell.eval.score > 0 ? `+${selectedCell.eval.score}` : selectedCell.eval.score})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Speed Advantage */}
            <div className="p-3.5 rounded-xl bg-slate-panel/40 border border-border-crisp space-y-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Speed Initiative
              </span>
              <div className="flex items-center justify-between">
                <span className="text-on-surface font-bold">
                  {selectedCell.eval.outSpeeds
                    ? "Outspeeds Opponent"
                    : selectedCell.eval.speedDiff === 0
                    ? "Speed Tie"
                    : "Outsped by Opponent"}
                </span>
                <span
                  className={`font-bold ${
                    selectedCell.eval.speedDiff > 0
                      ? "text-emerald-400"
                      : selectedCell.eval.speedDiff < 0
                      ? "text-red-400"
                      : "text-on-surface-variant"
                  }`}
                >
                  {selectedCell.eval.speedDiff > 0
                    ? `+${selectedCell.eval.speedDiff}`
                    : selectedCell.eval.speedDiff} Spe
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Member: {selectedCell.eval.memberSpeed} | Threat: {selectedCell.eval.threatSpeed}
              </p>
            </div>

            {/* Offensive Pressure */}
            <div className="p-3.5 rounded-xl bg-slate-panel/40 border border-border-crisp space-y-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Offensive Pressure
              </span>
              <div className="flex items-center justify-between">
                <span className="text-on-surface font-bold">
                  {selectedCell.eval.memberMaxOffense >= 2.0
                    ? "Super Effective"
                    : selectedCell.eval.memberMaxOffense === 0
                    ? "Immune / Ineffective"
                    : "Neutral / Resisted"}
                </span>
                <span className="font-bold text-primary">
                  {selectedCell.eval.memberMaxOffense}x
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                {selectedCell.eval.offensiveDetails}
              </p>
            </div>

            {/* Defensive Exposure */}
            <div className="p-3.5 rounded-xl bg-slate-panel/40 border border-border-crisp space-y-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Defensive Exposure
              </span>
              <div className="flex items-center justify-between">
                <span className="text-on-surface font-bold">
                  {selectedCell.eval.threatMaxOffense <= 0.5
                    ? "Resisted / Safe"
                    : selectedCell.eval.threatMaxOffense >= 2.0
                    ? "High Danger Weakness"
                    : "Neutral Damage"}
                </span>
                <span
                  className={`font-bold ${
                    selectedCell.eval.threatMaxOffense >= 2.0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {selectedCell.eval.threatMaxOffense}x
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                {selectedCell.eval.defensiveDetails}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Calculated using Gen 9 tournament standard benchmark spreads.
            </span>
            {onSelectMatchup && (
              <button
                onClick={() => onSelectMatchup(selectedCell.member.id, selectedCell.threat)}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch in 16-Roll Battle Calculator
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
