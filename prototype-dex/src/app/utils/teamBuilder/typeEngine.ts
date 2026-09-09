/* eslint-disable @typescript-eslint/no-explicit-any */
// Type Synergy, Dense Defense Matrix, and Bipartite Offensive Coverage Engine
import {
  PokemonType,
  ALL_POKEMON_TYPES,
  TeamMember,
  DefenseMatrixResult,
  DefenseCell,
  CoverageReport,
  CoverageEdge,
  SetCoverRecommendation,
} from "./types";

// Standard 18x18 Type Effectiveness Table (Attacking Row -> Defending Column)
export const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
  normal: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1,
    flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, steel: 0.5, dark: 1, fairy: 1,
  },
  fire: {
    normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1,
    flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, steel: 2, dark: 1, fairy: 1,
  },
  water: {
    normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2,
    flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, steel: 1, dark: 1, fairy: 1,
  },
  electric: {
    normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0,
    flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, steel: 1, dark: 1, fairy: 1,
  },
  grass: {
    normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2,
    flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, steel: 0.5, dark: 1, fairy: 1,
  },
  ice: {
    normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2,
    flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 1, fairy: 1,
  },
  fighting: {
    normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1,
    flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, steel: 2, dark: 2, fairy: 0.5,
  },
  poison: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5,
    flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, steel: 0, dark: 1, fairy: 2,
  },
  ground: {
    normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1,
    flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, steel: 2, dark: 1, fairy: 1,
  },
  flying: {
    normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1,
    flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 1,
  },
  psychic: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1,
    flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, steel: 0.5, dark: 0, fairy: 1,
  },
  bug: {
    normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1,
    flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, steel: 0.5, dark: 2, fairy: 0.5,
  },
  rock: {
    normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5,
    flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 1,
  },
  ghost: {
    normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1,
    flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, dark: 0.5, fairy: 1,
  },
  dragon: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1,
    flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 1, fairy: 0,
  },
  steel: {
    normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1,
    flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 2,
  },
  dark: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1,
    flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, dark: 0.5, fairy: 0.5,
  },
  fairy: {
    normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1,
    flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 2, fairy: 1,
  },
};

export function getDefensiveMultiplier(
  attackingType: PokemonType,
  defendingTypes: string[],
  ability?: string,
  item?: string,
  teraType?: string
): { multiplier: number; reason?: string } {
  const normAbility = (ability || "").toLowerCase().replace(/[\s-_]/g, "");
  const normItem = (item || "").toLowerCase().replace(/[\s-_]/g, "");

  // Terastallization replaces defensive typings
  let targetTypes = defendingTypes.map((t) => t.toLowerCase() as PokemonType);
  if (teraType && teraType.toLowerCase() !== "stellar" && ALL_POKEMON_TYPES.includes(teraType.toLowerCase() as PokemonType)) {
    targetTypes = [teraType.toLowerCase() as PokemonType];
  }

  // Base dual-type effectiveness
  let multiplier = 1;
  for (const defType of targetTypes) {
    if (TYPE_CHART[attackingType] && TYPE_CHART[attackingType][defType] !== undefined) {
      multiplier *= TYPE_CHART[attackingType][defType];
    }
  }

  // Ability & Item Immunities and Resists
  if (attackingType === "ground") {
    if (normAbility === "levitate") return { multiplier: 0, reason: "Immunity: Levitate" };
    if (normItem === "airballoon") return { multiplier: 0, reason: "Immunity: Air Balloon" };
    if (normAbility === "eartheater") return { multiplier: 0, reason: "Immunity: Earth Eater" };
  }

  if (attackingType === "fire") {
    if (normAbility === "flashfire") return { multiplier: 0, reason: "Immunity: Flash Fire" };
    if (normAbility === "wellbakedbody") return { multiplier: 0, reason: "Immunity: Well-Baked Body" };
    if (normAbility === "thickfat" || normAbility === "heatproof") {
      multiplier *= 0.5;
      return { multiplier, reason: "Resist: " + (normAbility === "thickfat" ? "Thick Fat" : "Heatproof") };
    }
  }

  if (attackingType === "water") {
    if (normAbility === "waterabsorb" || normAbility === "stormdrain" || normAbility === "dryskin") {
      return { multiplier: 0, reason: `Immunity: ${ability}` };
    }
  }

  if (attackingType === "electric") {
    if (normAbility === "voltabsorb" || normAbility === "motordrive" || normAbility === "lightningrod") {
      return { multiplier: 0, reason: `Immunity: ${ability}` };
    }
  }

  if (attackingType === "grass") {
    if (normAbility === "sapsipper") return { multiplier: 0, reason: "Immunity: Sap Sipper" };
  }

  if (attackingType === "ice") {
    if (normAbility === "thickfat") {
      multiplier *= 0.5;
      return { multiplier, reason: "Resist: Thick Fat" };
    }
  }

  if (attackingType === "ghost") {
    if (normAbility === "purifyingsalt") {
      multiplier *= 0.5;
      return { multiplier, reason: "Resist: Purifying Salt" };
    }
  }

  if (normAbility === "wonderguard") {
    if (multiplier <= 1.0) {
      return { multiplier: 0, reason: "Immunity: Wonder Guard" };
    }
  }

  return { multiplier };
}

/**
 * Computes the 18 x 6 Dense Defense Matrix across the team.
 */
export function computeDefenseMatrix(members: TeamMember[]): DefenseMatrixResult {
  const matrix: number[][] = [];
  const details: DefenseCell[][] = [];
  const weaknessCounts: number[] = new Array(18).fill(0);
  const resistanceCounts: number[] = new Array(18).fill(0);
  const immunityCounts: number[] = new Array(18).fill(0);
  const netScores: number[] = new Array(18).fill(0);
  const criticalWeaknesses: { type: PokemonType; count: number }[] = [];

  for (let i = 0; i < ALL_POKEMON_TYPES.length; i++) {
    const atkType = ALL_POKEMON_TYPES[i];
    const rowMultipliers: number[] = [];
    const rowDetails: DefenseCell[] = [];

    let rowWeakCount = 0;
    let rowResistCount = 0;
    let rowImmuneCount = 0;

    for (let j = 0; j < members.length; j++) {
      const member = members[j];
      const { multiplier, reason } = getDefensiveMultiplier(
        atkType,
        member.types,
        member.ability,
        member.item,
        member.teraType
      );

      rowMultipliers.push(multiplier);
      rowDetails.push({
        type: atkType,
        pokemonIndex: j,
        multiplier,
        immunityReason: reason,
      });

      if (multiplier > 1.0) rowWeakCount++;
      else if (multiplier === 0) {
        rowImmuneCount++;
        rowResistCount++; // Immunes also count as defensive resistance
      } else if (multiplier < 1.0) {
        rowResistCount++;
      }
    }

    matrix.push(rowMultipliers);
    details.push(rowDetails);
    weaknessCounts[i] = rowWeakCount;
    resistanceCounts[i] = rowResistCount;
    immunityCounts[i] = rowImmuneCount;
    netScores[i] = rowResistCount - rowWeakCount;

    // Critical weakness: 3 or more members weak to this type and 0 immunities on the team
    if (rowWeakCount >= 3 && rowImmuneCount === 0) {
      criticalWeaknesses.push({ type: atkType, count: rowWeakCount });
    }
  }

  return {
    matrix,
    weaknessCounts,
    resistanceCounts,
    immunityCounts,
    netScores,
    criticalWeaknesses,
    details,
  };
}

/**
 * Evaluates Offensive Coverage using Bipartite Graph representation and a Greedy Set Cover algorithm.
 */
export function computeOffensiveCoverage(
  members: TeamMember[],
  movesData: Record<string, any>
): CoverageReport {
  const edges: CoverageEdge[] = [];
  const coveredSet = new Set<PokemonType>();
  let totalAttackingMoves = 0;

  for (const member of members) {
    for (const moveName of member.moves) {
      if (!moveName || !moveName.trim()) continue;
      const cleanKey = moveName.toLowerCase().trim().replace(/[\s_]/g, "-");
      const moveInfo = movesData[cleanKey] || movesData[cleanKey.replace(/-/g, " ")];

      if (!moveInfo) continue;
      const category = (moveInfo.category || "").toLowerCase();
      if (category === "status") continue; // only damaging moves contribute to super-effective coverage

      const moveType = (moveInfo.type || "").toLowerCase() as PokemonType;
      if (!ALL_POKEMON_TYPES.includes(moveType)) continue;

      totalAttackingMoves++;

      // Evaluate edge to defending types
      for (const defType of ALL_POKEMON_TYPES) {
        const mult = TYPE_CHART[moveType]?.[defType] ?? 1;
        if (mult >= 2.0) {
          coveredSet.add(defType);
          edges.push({
            move: moveName,
            moveType,
            defendingType: defType,
            multiplier: mult,
          });
        }
      }
    }
  }

  const coveredTypes = Array.from(coveredSet);
  const uncoveredTypes = ALL_POKEMON_TYPES.filter((t) => !coveredSet.has(t));

  // Greedy Set Cover Heuristic to recommend 1-2 coverage move types that hit the maximum uncovered targets
  const recommendations: SetCoverRecommendation[] = [];
  let remainingUncovered = [...uncoveredTypes];

  while (remainingUncovered.length > 0 && recommendations.length < 3) {
    let bestType: PokemonType | null = null;
    let bestCovered: PokemonType[] = [];

    for (const candType of ALL_POKEMON_TYPES) {
      const hits = remainingUncovered.filter(
        (target) => (TYPE_CHART[candType]?.[target] ?? 1) >= 2.0
      );
      if (hits.length > bestCovered.length) {
        bestCovered = hits;
        bestType = candType;
      }
    }

    if (!bestType || bestCovered.length === 0) break;

    recommendations.push({
      type: bestType,
      coveredTargets: bestCovered,
    });

    const coveredNow = new Set(bestCovered);
    remainingUncovered = remainingUncovered.filter((t) => !coveredNow.has(t));
  }

  return {
    coveredTypes,
    uncoveredTypes,
    edges,
    recommendations,
    totalAttackingMoves,
  };
}
