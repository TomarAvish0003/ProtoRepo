// Team Weakness Auto-Resolver & Smart Teammate Recommender
import { TeamMember, PokemonType, PokemonFormat, ALL_POKEMON_TYPES } from "./types";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { getDefensiveMultiplier, TYPE_CHART } from "./typeEngine";
import { isPokemonLegal, getPokemonTierInfo } from "./formatEngine";

export interface SynergyRecommendation {
  pokemonId: number;
  speciesName: string;
  types: string[];
  tier: string;
  bst: number;
  spriteUrl: string;
  synergyScore: number;
  defensiveSynergies: string[];
  offensiveCoverages: string[];
  pivotPartners: string[];
  summaryRationale: string;
  preset: {
    item: string;
    ability: string;
    nature: string;
    evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    moves: [string, string, string, string];
  };
}

/**
 * Recommends the top 3 legal Pokémon to patch an active squad's defensive and offensive holes.
 */
export function recommendTeammates(
  members: TeamMember[],
  format: PokemonFormat,
  pokedexData: FlatVarietyWithTypes[]
): SynergyRecommendation[] {
  if (members.length === 0 || members.length >= 6) return [];

  const teamSpeciesSet = new Set(members.map((m) => m.speciesName.toLowerCase().replace(/[^a-z0-9]/g, "")));

  // 1. Determine team defensive weaknesses
  const teamWeaknessCounts = {} as Record<PokemonType, number>;
  const teamResistCounts = {} as Record<PokemonType, number>;

  for (const t of ALL_POKEMON_TYPES) {
    teamWeaknessCounts[t] = 0;
    teamResistCounts[t] = 0;
  }

  for (const m of members) {
    for (const atkType of ALL_POKEMON_TYPES) {
      const { multiplier } = getDefensiveMultiplier(atkType, m.types, m.ability, m.item, m.teraType);
      if (multiplier > 1.0) teamWeaknessCounts[atkType]++;
      else if (multiplier <= 0.5) teamResistCounts[atkType]++;
    }
  }

  // Priority types to resist: types where team has negative net balance or >= 2 weaknesses
  const priorityWeakTypes = ALL_POKEMON_TYPES.filter(
    (t) => teamWeaknessCounts[t] > teamResistCounts[t] || teamWeaknessCounts[t] >= 2
  );

  // 2. Determine missing offensive coverage (defending types not hit super-effectively by team STAB)
  const coveredDefendingTypes = new Set<PokemonType>();
  for (const m of members) {
    for (const memberType of m.types) {
      const normType = memberType.toLowerCase() as PokemonType;
      if (TYPE_CHART[normType]) {
        for (const defType of ALL_POKEMON_TYPES) {
          if (TYPE_CHART[normType][defType] > 1.0) {
            coveredDefendingTypes.add(defType);
          }
        }
      }
    }
  }
  const missingCoverageTypes = ALL_POKEMON_TYPES.filter((t) => !coveredDefendingTypes.has(t));

  // 3. Score candidate Pokémon
  interface ScoredCandidate {
    entry: FlatVarietyWithTypes;
    score: number;
    defensiveHelps: PokemonType[];
    offensiveHelps: PokemonType[];
    pivotPartners: string[];
    tierInfo: ReturnType<typeof getPokemonTierInfo>;
  }

  const scored: ScoredCandidate[] = [];

  for (const p of pokedexData) {
    const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (teamSpeciesSet.has(cleanName)) continue;

    // Check legality
    const legCheck = isPokemonLegal(p.id, p.name, format);
    if (!legCheck.legal) continue;

    const candTypes: string[] = p.types || ["Normal"];
    let score = 0;
    const defensiveHelps: PokemonType[] = [];
    const offensiveHelps: PokemonType[] = [];
    const pivotPartners: string[] = [];

    // Defensive synergy points
    for (const weakType of priorityWeakTypes) {
      const { multiplier } = getDefensiveMultiplier(weakType, candTypes);
      if (multiplier === 0) {
        score += 6;
        defensiveHelps.push(weakType);
      } else if (multiplier <= 0.5) {
        score += 3.5;
        defensiveHelps.push(weakType);
      } else if (multiplier > 1.0) {
        score -= 2.5;
      }
    }

    // Pivot synergy with current members
    for (const m of members) {
      let candProtectsM = false;
      let mProtectsCand = false;

      for (const atkType of ALL_POKEMON_TYPES) {
        const mMult = getDefensiveMultiplier(atkType, m.types, m.ability, m.item).multiplier;
        const cMult = getDefensiveMultiplier(atkType, candTypes).multiplier;

        if (mMult > 1.0 && cMult <= 0.5) candProtectsM = true;
        if (cMult > 1.0 && mMult <= 0.5) mProtectsCand = true;
      }

      if (candProtectsM && mProtectsCand) {
        score += 4.5;
        pivotPartners.push(m.speciesName);
      }
    }

    // Offensive coverage points
    for (const defType of missingCoverageTypes) {
      let hits = false;
      for (const cType of candTypes) {
        const normCType = cType.toLowerCase() as PokemonType;
        if (TYPE_CHART[normCType] && TYPE_CHART[normCType][defType] > 1.0) {
          hits = true;
          break;
        }
      }
      if (hits) {
        score += 2.5;
        offensiveHelps.push(defType);
      }
    }

    // Tier viability and BST bonus
    const tierInfo = getPokemonTierInfo(p.name);
    score += (tierInfo.sortWeight || 0) * 0.06;
    score += ((p.stats?.bst || 450) - 400) * 0.02;

    if (defensiveHelps.length > 0 || offensiveHelps.length > 0) {
      scored.push({
        entry: p,
        score,
        defensiveHelps,
        offensiveHelps,
        pivotPartners,
        tierInfo,
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top 3
  const top3 = scored.slice(0, 3);

  return top3.map((item) => {
    const p = item.entry;
    const defStr = item.defensiveHelps.slice(0, 3).map((t) => t.toUpperCase()).join(", ");
    const offStr = item.offensiveHelps.slice(0, 2).map((t) => t.toUpperCase()).join(", ");
    const pivotStr = item.pivotPartners.slice(0, 2).join(" & ");

    let rationale = "";
    if (defStr) rationale += `Resists [${defStr}] to patch team weaknesses. `;
    if (pivotStr) rationale += `Forms mutual pivot loop with ${pivotStr}. `;
    if (offStr) rationale += `Adds super-effective pressure against [${offStr}].`;

    // Competitive preset builder
    const bst = p.stats?.bst || 500;
    const isSpecial = (p.stats?.spa || 0) > (p.stats?.atk || 0);

    return {
      pokemonId: p.id,
      speciesName: p.name,
      types: p.types || ["Normal"],
      tier: item.tierInfo.tier || "OU",
      bst,
      spriteUrl: p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
      synergyScore: Math.round(item.score),
      defensiveSynergies: item.defensiveHelps,
      offensiveCoverages: item.offensiveHelps,
      pivotPartners: item.pivotPartners,
      summaryRationale: rationale.trim(),
      preset: {
        item: isSpecial ? "Choice Specs" : "Leftovers",
        ability: p.abilities?.[0] || "Pressure",
        nature: isSpecial ? "Timid" : "Jolly",
        evs: isSpecial
          ? { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 }
          : { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
        moves: ["Tackle", "Protect", "Substitute", "Rest"],
      },
    };
  });
}

