import { TeamMember, StatSpread } from "./types";
import { cleanSpeciesKey } from "./formatEngine";
import abilitiesDataRaw from "@/app/data/abilities.json";
import itemsDataRaw from "@/app/data/items.json";
import learnsetsDataRaw from "@/app/data/learnsets.json";

export interface SpecimenRole {
  roleId: string;
  title: string;
  category: "Offensive" | "Defensive" | "Utility" | "Specialized";
  description: string;
  badgeClass: string;
}

export interface TeamArchetype {
  title: string;
  desc: string;
  badgeClass: string;
}

interface AbilityEntry {
  regular: string[];
  hidden: string | null;
  special: string | null;
}

const ABILITIES_MAP = abilitiesDataRaw as Record<string, AbilityEntry>;
const LEARNSETS_MAP = learnsetsDataRaw as Record<string, string[]>;

export interface ItemEntry {
  id: string;
  name: string;
  desc: string;
  gen: number;
  isNonstandard: string | null;
  megaStone: boolean;
  megaUser: string[] | null;
  isTopCompetitive: boolean;
}

export const ALL_ITEMS = itemsDataRaw as ItemEntry[];

/**
 * Returns all verified legal abilities for a given Pokémon species.
 */
export function getPokemonLegalAbilities(speciesName: string): string[] {
  const key = cleanSpeciesKey(speciesName);
  const entry = ABILITIES_MAP[key];
  if (!entry) return ["Standard Ability"];

  const list: string[] = [...entry.regular];
  if (entry.hidden) list.push(`${entry.hidden} (Hidden)`);
  if (entry.special) list.push(`${entry.special} (Special)`);
  return Array.from(new Set(list));
}

/**
 * Returns all verified legal moves for a given Pokémon species.
 */
export function getPokemonLegalLearnset(speciesName: string): Set<string> {
  const key = cleanSpeciesKey(speciesName);
  const rawMoves = LEARNSETS_MAP[key] || [];
  return new Set(rawMoves.map((m) => m.toLowerCase().replace(/[^a-z0-9]/g, "")));
}

/**
 * Validates if an item is legal for the selected format and species.
 */
export function isItemLegal(
  itemId: string,
  format: string,
  speciesName: string
): { legal: boolean; reason?: string; isMega: boolean } {
  const normItem = itemId.toLowerCase().replace(/[^a-z0-9]/g, "");
  const item = ALL_ITEMS.find((i) => i.id === normItem);
  if (!item) return { legal: true, isMega: false };

  // Mega Stone validation
  if (item.megaStone) {
    const isMegaAllowed =
      format === "custom" ||
      format === "natdex_ou" ||
      format === "gen6" ||
      format === "gen7";

    if (!isMegaAllowed) {
      return {
        legal: false,
        reason: "Mega Stones are not allowed in this format (Past Gen Mechanic)",
        isMega: true,
      };
    }

    if (item.megaUser && item.megaUser.length > 0) {
      const cleanTarget = cleanSpeciesKey(speciesName);
      const matched = item.megaUser.some(
        (u) => cleanSpeciesKey(u) === cleanTarget
      );
      if (!matched) {
        return {
          legal: false,
          reason: `Can only be held by ${item.megaUser.join(", ")}`,
          isMega: true,
        };
      }
    }

    return { legal: true, isMega: true };
  }

  // Gen 9 formats cut check
  if (
    (format === "gen9ou" || format === "gen9vgc" || format === "gen9uu" || format === "gen9ubers") &&
    item.isNonstandard === "Past"
  ) {
    return {
      legal: false,
      reason: "Item cut in Generation 9",
      isMega: false,
    };
  }

  return { legal: true, isMega: false };
}

/**
 * Dynamically classifies a Pokémon's competitive combat role based on its
 * EVs, nature, held item, ability, and current moves.
 */
export function classifySpecimenRole(
  member: TeamMember,
  baseStats?: Partial<StatSpread>
): SpecimenRole {
  const moveNames = member.moves
    .filter((m): m is string => typeof m === "string" && m.trim().length > 0)
    .map((m) => m.toLowerCase().replace(/[^a-z0-9]/g, ""));

  const itemNorm = (member.item || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const abilityNorm = (member.ability || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Weather / Terrain Setter
  if (
    abilityNorm.includes("drizzle") ||
    abilityNorm.includes("drought") ||
    abilityNorm.includes("sandstream") ||
    abilityNorm.includes("snowwarning") ||
    abilityNorm.includes("electricsurge") ||
    abilityNorm.includes("grassysurge") ||
    abilityNorm.includes("psychicsurge")
  ) {
    return {
      roleId: "weather_setter",
      title: "Weather / Terrain Anchor",
      category: "Specialized",
      description: "Deploys field conditions on entry to empower entire team synergy.",
      badgeClass: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    };
  }

  // 2. Suicide / Hazard Lead
  const hasHazards = moveNames.some((m) =>
    ["stealthrock", "spikes", "toxicspikes", "stickyweb", "ceaselessedge", "stoneaxe"].includes(m)
  );
  if (
    hasHazards &&
    (itemNorm === "focussash" ||
      moveNames.some((m) => ["explosion", "memento", "mortalspin", "taunt"].includes(m))) &&
    member.evs.spe >= 120
  ) {
    return {
      roleId: "suicide_lead",
      title: "Suicide / Hazard Lead",
      category: "Utility",
      description: "Designed to guarantee early-game entry hazards and disruption before fainting.",
      badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
  }

  // 3. Physical Setup Sweeper
  const hasPhysicalSetup = moveNames.some((m) =>
    ["swordsdance", "dragondance", "bulkup", "bellydrum", "victorydance", "scaleshot", "shiftgear"].includes(m)
  );
  if (
    hasPhysicalSetup &&
    (member.evs.atk >= 160 || member.evs.spe >= 160 || itemNorm === "loadeddice" || itemNorm === "lifeorb" || itemNorm === "boosterenergy")
  ) {
    return {
      roleId: "phys_sweeper",
      title: "Physical Setup Sweeper",
      category: "Offensive",
      description: "Late-game physical win-condition utilizing attack/speed boosts to sweep.",
      badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    };
  }

  // 4. Special Setup Sweeper
  const hasSpecialSetup = moveNames.some((m) =>
    ["nastyplot", "calmmind", "quiverdance", "tailglow", "takeheart", "geomancy"].includes(m)
  );
  if (
    hasSpecialSetup &&
    (member.evs.spa >= 160 || member.evs.spe >= 160 || itemNorm === "lifeorb" || itemNorm === "boosterenergy")
  ) {
    return {
      roleId: "spec_sweeper",
      title: "Special Setup Sweeper",
      category: "Offensive",
      description: "Late-game special win-condition capable of breaking defensive cores with boosted Special Attack.",
      badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
  }

  // 5. Fast Revenge Killer / Cleaner
  if (
    itemNorm === "choicescarf" ||
    (itemNorm === "boosterenergy" && (baseStats?.spe || 0) >= 110) ||
    (member.evs.spe >= 200 && (baseStats?.spe || 0) >= 120 && moveNames.some((m) => ["extremespeed", "suckerpunch", "machpunch"].includes(m)))
  ) {
    return {
      roleId: "revenge_killer",
      title: "Fast Revenge Killer / Cleaner",
      category: "Offensive",
      description: "Fast-strike specialist designed to outspeed boosted threats and clean up weakened teams.",
      badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
  }

  // 6. Physical Wallbreaker
  if (itemNorm === "choiceband" || (member.evs.atk >= 200 && !hasPhysicalSetup && member.evs.hp < 160)) {
    return {
      roleId: "phys_breaker",
      title: "Physical Wallbreaker",
      category: "Offensive",
      description: "Massive unboosted physical damage output designed to dismantle defensive tanks on switch-in.",
      badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
  }

  // 7. Special Wallbreaker
  if (itemNorm === "choicespecs" || (member.evs.spa >= 200 && !hasSpecialSetup && member.evs.hp < 160)) {
    return {
      roleId: "spec_breaker",
      title: "Special Wallbreaker",
      category: "Offensive",
      description: "Devastating Special Attack barrage breaking opposing physically defensive cores.",
      badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };
  }

  // 8. Physically Defensive Wall / Hazard Tank
  const hasRecovery = moveNames.some((m) =>
    ["recover", "roost", "softboiled", "wish", "slackoff", "synthesis", "moonlight", "strengthsap"].includes(m)
  );
  if (
    member.evs.hp >= 160 &&
    member.evs.def >= 160
  ) {
    return {
      roleId: "phys_wall",
      title: "Physically Defensive Tank",
      category: "Defensive",
      description: "High physical damage sponge mitigating contact hits and laying hazard chip.",
      badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  }

  // 9. Specially Defensive Sponge / Wall
  if (
    member.evs.hp >= 160 &&
    member.evs.spd >= 160
  ) {
    return {
      roleId: "spec_wall",
      title: "Specially Defensive Sponge",
      category: "Defensive",
      description: "Dedicated special damage absorber neutralizing powerful special wallbreakers.",
      badgeClass: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    };
  }

  // 10. Pivot (Defensive vs Offensive)
  const hasPivotMove = moveNames.some((m) =>
    ["uturn", "voltswitch", "flipturn", "partingshot", "chillyreception", "teleport"].includes(m)
  );
  if (hasPivotMove) {
    if (member.evs.hp >= 120 || member.evs.def >= 120 || member.evs.spd >= 120) {
      return {
        roleId: "def_pivot",
        title: "Defensive Momentum Pivot",
        category: "Utility",
        description: "Absorbs incoming hits and uses slow pivoting to bring offensive sweepers safely into play.",
        badgeClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      };
    } else {
      return {
        roleId: "off_pivot",
        title: "Offensive Momentum Pivot",
        category: "Offensive",
        description: "Fast offensive switcher forcing opponent switches and maintaining relentless tempo.",
        badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
    }
  }

  // 11. Mixed Attrition / Hazard Tank
  if (hasRecovery || hasHazards) {
    return {
      roleId: "hazard_tank",
      title: "Bulky Hazard Controller",
      category: "Utility",
      description: "Consistent team supporter laying hazards or maintaining health through recovery.",
      badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  }

  // Fallback
  return {
    roleId: "balanced_attacker",
    title: "Versatile Core Pokémon",
    category: "Offensive",
    description: "Multi-purpose battler balancing offensive contributions with baseline natural bulk.",
    badgeClass: "bg-slate-panel text-on-surface border-border-crisp",
  };
}

export type DexStatsEntry = {
  stats?: {
    hp?: number;
    atk?: number;
    def?: number;
    spa?: number;
    spd?: number;
    spe?: number;
    bst?: number;
  };
};

/**
 * Evaluates the overall holistic team composition to determine the true competitive archetype.
 */
export function evaluateTeamArchetype(
  members: TeamMember[],
  pokedexMap: Map<number, DexStatsEntry | Partial<StatSpread>>
): TeamArchetype {
  if (members.length === 0) {
    return {
      title: "Unassigned",
      desc: "Add Pokémon to analyze team archetype.",
      badgeClass: "bg-slate-panel text-on-surface-variant border-border-crisp",
    };
  }

  let sweepers = 0;
  let wallbreakers = 0;
  let defensiveWalls = 0;
  let weatherSetters = 0;
  let trickRoomSetters = 0;
  let totalSpeed = 0;

  for (const m of members) {
    const dexEntry = pokedexMap.get(m.pokemonId);
    const baseStats: Partial<StatSpread> | undefined =
      dexEntry && typeof dexEntry === "object" && "stats" in dexEntry && dexEntry.stats
        ? dexEntry.stats
        : (dexEntry as Partial<StatSpread> | undefined);
    const role = classifySpecimenRole(m, baseStats);

    if (role.roleId === "phys_sweeper" || role.roleId === "spec_sweeper" || role.roleId === "revenge_killer") {
      sweepers++;
    } else if (role.roleId === "phys_breaker" || role.roleId === "spec_breaker" || role.roleId === "off_pivot") {
      wallbreakers++;
    } else if (
      role.roleId === "phys_wall" ||
      role.roleId === "spec_wall" ||
      role.roleId === "def_pivot" ||
      role.roleId === "hazard_tank"
    ) {
      defensiveWalls++;
    } else if (role.roleId === "weather_setter") {
      weatherSetters++;
    }

    // Check Trick Room moves
    const moveNames = m.moves
      .filter((mv): mv is string => typeof mv === "string")
      .map((mv) => mv.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (moveNames.includes("trickroom")) trickRoomSetters++;

    totalSpeed += baseStats?.spe || 80;
  }

  const avgSpeed = Math.round(totalSpeed / members.length);

  // 1. Trick Room Core
  if (trickRoomSetters >= 1 && avgSpeed <= 78) {
    return {
      title: "Trick Room / Distortion Core",
      desc: "Slow, heavy-damage powerhouse roster designed to invert turn order under Trick Room.",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
  }

  // 2. Weather / Terrain Hyper-Team
  if (weatherSetters >= 1) {
    return {
      title: "Weather / Terrain Hyper-Core",
      desc: "Specialized climate-abusing architecture designed around dedicated weather/terrain multipliers.",
      badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    };
  }

  // 3. Hyper Offense (HO)
  if (sweepers + wallbreakers >= 4 && defensiveWalls <= 1) {
    return {
      title: "Hyper Offense (HO)",
      desc: "Maximum aggression sacrificing passive sustainability for relentless momentum and multiple setup sweepers.",
      badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    };
  }

  // 4. Stall / Defensive Attrition
  if (defensiveWalls >= 4 && sweepers <= 1) {
    return {
      title: "Stall / Attrition Core",
      desc: "High defensive bulk with passive damage (hazards, status) and reliable recovery to win by exhaustion.",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    };
  }

  // 5. Bulky Offense (BO)
  if (sweepers + wallbreakers >= 3 && defensiveWalls >= 2) {
    return {
      title: "Bulky Offense (BO)",
      desc: "Synergistic balance of heavy damage threats supported by defensive pivots with VoltTurn momentum.",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    };
  }

  // 6. Balance (Classic)
  return {
    title: "Balanced Good-Stuff",
    desc: "Classical competitive balance pairing reliable defensive walls with versatile offensive win-conditions.",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };
}
