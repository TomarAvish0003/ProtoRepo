// Effective Bulk Distribution Matrix Engine
import { TeamMember, StatSpread } from "./types";
import { calcActualStat, getNatureMultiplier } from "./damageCalcEngine";

export interface BulkPoint {
  memberId: string;
  speciesName: string;
  primaryType: string;
  types: string[];
  actualHp: number;
  actualDef: number;
  actualSpd: number;
  actualSpe: number;
  physBulk: number; // HP * Def
  specBulk: number; // HP * SpD
  normalizedPhys: number; // 0 to 100
  normalizedSpec: number; // 0 to 100
  quadrant: "mixed_tank" | "spec_wall" | "glass_cannon" | "phys_wall";
  quadrantLabel: string;
  quadrantColor: string;
  hasAssaultVest: boolean;
  hasEviolite: boolean;
}

export interface BulkMatrixReport {
  points: BulkPoint[];
  avgPhysBulk: number;
  avgSpecBulk: number;
  physRatioPercent: number;
  specRatioPercent: number;
  biasRating: "Heavy Physical Bias" | "Moderate Physical Bias" | "Balanced Bulk" | "Moderate Special Bias" | "Heavy Special Bias";
  biasWarning: string | null;
  minScale: number;
  maxScale: number;
}

// Standard competitive bulk benchmarks
export const BENCHMARK_PHYS_MEDIAN = 72000; // e.g. ~350 HP * ~205 Def
export const BENCHMARK_SPEC_MEDIAN = 70000; // e.g. ~350 HP * ~200 SpD

/**
 * Computes effective physical and special bulk for all team members.
 */
export function computeBulkMatrix(
  members: TeamMember[],
  pokedexMap: Map<number, { stats?: StatSpread } | StatSpread>
): BulkMatrixReport {
  if (members.length === 0) {
    return {
      points: [],
      avgPhysBulk: 0,
      avgSpecBulk: 0,
      physRatioPercent: 50,
      specRatioPercent: 50,
      biasRating: "Balanced Bulk",
      biasWarning: null,
      minScale: 20000,
      maxScale: 150000,
    };
  }

  const points: BulkPoint[] = members.map((m) => {
    const dexEntry = pokedexMap.get(m.pokemonId);
    const base: StatSpread =
      dexEntry && typeof dexEntry === "object" && "stats" in dexEntry && dexEntry.stats
        ? dexEntry.stats
        : (dexEntry as StatSpread) || { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };

    const defNatureMult = getNatureMultiplier(m.nature, "def");
    const spdNatureMult = getNatureMultiplier(m.nature, "spd");
    const speNatureMult = getNatureMultiplier(m.nature, "spe");

    const actualHp = calcActualStat(base.hp, m.ivs.hp, m.evs.hp, m.level, 1.0, true, m.speciesName);
    let actualDef = calcActualStat(base.def, m.ivs.def, m.evs.def, m.level, defNatureMult, false);
    let actualSpd = calcActualStat(base.spd, m.ivs.spd, m.evs.spd, m.level, spdNatureMult, false);
    const actualSpe = calcActualStat(base.spe, m.ivs.spe, m.evs.spe, m.level, speNatureMult, false);

    const normItem = (m.item || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const hasAssaultVest = normItem === "assaultvest";
    const hasEviolite = normItem === "eviolite";

    if (hasAssaultVest) {
      actualSpd = Math.floor(actualSpd * 1.5);
    }
    if (hasEviolite) {
      actualDef = Math.floor(actualDef * 1.5);
      actualSpd = Math.floor(actualSpd * 1.5);
    }

    const physBulk = actualHp * actualDef;
    const specBulk = actualHp * actualSpd;

    // Quadrant determination based on competitive medians
    const isPhysHigh = physBulk >= BENCHMARK_PHYS_MEDIAN;
    const isSpecHigh = specBulk >= BENCHMARK_SPEC_MEDIAN;

    let quadrant: BulkPoint["quadrant"];
    let quadrantLabel: string;
    let quadrantColor: string;

    if (isPhysHigh && isSpecHigh) {
      quadrant = "mixed_tank";
      quadrantLabel = "True Mixed Tank";
      quadrantColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    } else if (!isPhysHigh && isSpecHigh) {
      quadrant = "spec_wall";
      quadrantLabel = "Specially Defensive Sponge";
      quadrantColor = "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    } else if (isPhysHigh && !isSpecHigh) {
      quadrant = "phys_wall";
      quadrantLabel = "Physically Defensive Wall";
      quadrantColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    } else {
      quadrant = "glass_cannon";
      quadrantLabel = "Glass Cannon / Frail Sweeper";
      quadrantColor = "text-red-400 border-red-500/30 bg-red-500/10";
    }

    return {
      memberId: m.id,
      speciesName: m.speciesName,
      primaryType: m.types[0] || "normal",
      types: m.types,
      actualHp,
      actualDef,
      actualSpd,
      actualSpe,
      physBulk,
      specBulk,
      normalizedPhys: 0, // will calibrate next
      normalizedSpec: 0,
      quadrant,
      quadrantLabel,
      quadrantColor,
      hasAssaultVest,
      hasEviolite,
    };
  });

  // Calculate dynamic scale bounds
  const allPhys = points.map((p) => p.physBulk);
  const allSpec = points.map((p) => p.specBulk);
  const minVal = Math.min(20000, ...allPhys, ...allSpec);
  const maxVal = Math.max(140000, ...allPhys, ...allSpec);

  // Normalize points between 0 and 100 for SVG plotting
  for (const pt of points) {
    pt.normalizedPhys = Math.round(((pt.physBulk - minVal) / (maxVal - minVal)) * 100);
    pt.normalizedSpec = Math.round(((pt.specBulk - minVal) / (maxVal - minVal)) * 100);
  }

  // Aggregate averages
  const totalPhys = points.reduce((acc, p) => acc + p.physBulk, 0);
  const totalSpec = points.reduce((acc, p) => acc + p.specBulk, 0);
  const avgPhysBulk = Math.round(totalPhys / points.length);
  const avgSpecBulk = Math.round(totalSpec / points.length);

  const grandTotal = totalPhys + totalSpec;
  const physRatioPercent = grandTotal > 0 ? Math.round((totalPhys / grandTotal) * 100) : 50;
  const specRatioPercent = 100 - physRatioPercent;

  let biasRating: BulkMatrixReport["biasRating"] = "Balanced Bulk";
  let biasWarning: string | null = null;

  if (physRatioPercent >= 62) {
    biasRating = "Heavy Physical Bias";
    biasWarning = `Critical Bulk Asymmetry: Team is heavily skewed toward physical defense (${physRatioPercent}%). Elite Special Wallbreakers (Gholdengo, Walking Wake, Iron Moth) create an unmanageable deficit.`;
  } else if (physRatioPercent >= 56) {
    biasRating = "Moderate Physical Bias";
    biasWarning = `Moderate Bulk Asymmetry: Physical defense outpaces special sponge capacity (${physRatioPercent}% vs ${specRatioPercent}%). Consider bolstering special resistance.`;
  } else if (specRatioPercent >= 62) {
    biasRating = "Heavy Special Bias";
    biasWarning = `Critical Bulk Asymmetry: Team is heavily skewed toward special defense (${specRatioPercent}%). High-tier Physical Wallbreakers (Great Tusk, Dragonite, Kingambit) can puncture defenses.`;
  } else if (specRatioPercent >= 56) {
    biasRating = "Moderate Special Bias";
    biasWarning = `Moderate Bulk Asymmetry: Special bulk outweighs physical sponge capability (${specRatioPercent}% vs ${physRatioPercent}%).`;
  }

  return {
    points,
    avgPhysBulk,
    avgSpecBulk,
    physRatioPercent,
    specRatioPercent,
    biasRating,
    biasWarning,
    minScale: minVal,
    maxScale: maxVal,
  };
}

