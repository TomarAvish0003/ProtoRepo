// Defensive Switching Network Graph Engine
import { TeamMember, PokemonType, ALL_POKEMON_TYPES } from "./types";
import { getDefensiveMultiplier } from "./typeEngine";

export interface PivotEdge {
  fromId: string;
  toId: string;
  fromSpecies: string;
  toSpecies: string;
  coveredWeaknesses: PokemonType[];
  hasImmunity: boolean;
  weight: number;
}

export interface PivotCycle {
  cycleType: "2-cycle" | "3-cycle";
  memberIds: string[];
  speciesNames: string[];
  description: string;
  keySynergies: string[];
}

export interface NodeMetrics {
  memberId: string;
  speciesName: string;
  weaknessCount: number;
  weaknesses: PokemonType[];
  inDegree: number; // Teammates that can pivot in to cover its weaknesses
  outDegree: number; // Teammates this Pokémon can pivot in to save
  isIsolatedBurden: boolean; // In-degree == 0 while having >= 1 weakness
  isDefensiveAnchor: boolean; // Out-degree >= 3
}

export interface SwitchingNetworkReport {
  edges: PivotEdge[];
  nodes: NodeMetrics[];
  cycles: PivotCycle[];
  isolatedBurdens: NodeMetrics[];
  connectivityScore: number; // 0-100%
  summary: {
    totalEdges: number;
    twoCyclesCount: number;
    threeCyclesCount: number;
    isolatedCount: number;
    rating: "Elite Core" | "Robust Synergy" | "Moderate Synergy" | "Fragmented";
  };
}

/**
 * Computes the directed defensive switching network for the active team.
 */
export function computeSwitchingNetwork(members: TeamMember[]): SwitchingNetworkReport {
  if (members.length < 2) {
    return {
      edges: [],
      nodes: members.map((m) => ({
        memberId: m.id,
        speciesName: m.speciesName,
        weaknessCount: 0,
        weaknesses: [],
        inDegree: 0,
        outDegree: 0,
        isIsolatedBurden: false,
        isDefensiveAnchor: false,
      })),
      cycles: [],
      isolatedBurdens: [],
      connectivityScore: 0,
      summary: {
        totalEdges: 0,
        twoCyclesCount: 0,
        threeCyclesCount: 0,
        isolatedCount: 0,
        rating: "Fragmented",
      },
    };
  }

  // 1. Calculate defensive profiles for each member
  const memberWeaknesses = new Map<string, PokemonType[]>();
  const memberResistances = new Map<string, { res: PokemonType[]; imm: PokemonType[] }>();

  for (const m of members) {
    const weaks: PokemonType[] = [];
    const res: PokemonType[] = [];
    const imm: PokemonType[] = [];

    for (const atkType of ALL_POKEMON_TYPES) {
      const { multiplier } = getDefensiveMultiplier(
        atkType,
        m.types,
        m.ability,
        m.item,
        m.teraType
      );
      if (multiplier > 1.0) {
        weaks.push(atkType);
      } else if (multiplier === 0) {
        imm.push(atkType);
        res.push(atkType);
      } else if (multiplier < 1.0) {
        res.push(atkType);
      }
    }

    memberWeaknesses.set(m.id, weaks);
    memberResistances.set(m.id, { res, imm });
  }

  // 2. Build directed edges (u -> v if v cleanly resists or is immune to a weakness of u)
  const edges: PivotEdge[] = [];
  const edgeSet = new Set<string>(); // "uId->vId"

  for (let i = 0; i < members.length; i++) {
    const u = members[i];
    const uWeaks = memberWeaknesses.get(u.id) || [];

    for (let j = 0; j < members.length; j++) {
      if (i === j) continue;
      const v = members[j];
      const vResData = memberResistances.get(v.id) || { res: [], imm: [] };

      // Check which weaknesses of u are resisted or neutralized by v
      const covered = uWeaks.filter((w) => vResData.res.includes(w));
      const hasImm = covered.some((w) => vResData.imm.includes(w));

      if (covered.length > 0) {
        edges.push({
          fromId: u.id,
          toId: v.id,
          fromSpecies: u.speciesName,
          toSpecies: v.speciesName,
          coveredWeaknesses: covered,
          hasImmunity: hasImm,
          weight: covered.length + (hasImm ? 1 : 0),
        });
        edgeSet.add(`${u.id}->${v.id}`);
      }
    }
  }

  // 3. Cycle Detection (2-Cycles and 3-Cycles)
  const cycles: PivotCycle[] = [];
  const visited2Cycles = new Set<string>();

  // 2-Cycles: u -> v and v -> u
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const u = members[i];
      const v = members[j];
      const key1 = `${u.id}->${v.id}`;
      const key2 = `${v.id}->${u.id}`;

      if (edgeSet.has(key1) && edgeSet.has(key2)) {
        const sortedKey = [u.id, v.id].sort().join("<->");
        if (!visited2Cycles.has(sortedKey)) {
          visited2Cycles.add(sortedKey);

          const edgeUV = edges.find((e) => e.fromId === u.id && e.toId === v.id);
          const edgeVU = edges.find((e) => e.fromId === v.id && e.toId === u.id);

          const uHelps = edgeVU?.coveredWeaknesses.map((t) => t.toUpperCase()).join(", ") || "";
          const vHelps = edgeUV?.coveredWeaknesses.map((t) => t.toUpperCase()).join(", ") || "";

          cycles.push({
            cycleType: "2-cycle",
            memberIds: [u.id, v.id],
            speciesNames: [u.speciesName, v.speciesName],
            description: `Symbiotic Pivot Core: ${v.speciesName} absorbs ${vHelps} for ${u.speciesName}; ${u.speciesName} absorbs ${uHelps} for ${v.speciesName}.`,
            keySynergies: [`${u.speciesName} covers [${uHelps}]`, `${v.speciesName} covers [${vHelps}]`],
          });
        }
      }
    }
  }

  // 3-Cycles: u -> v -> w -> u (where neither subpair is a 2-cycle)
  const visited3Cycles = new Set<string>();
  for (let i = 0; i < members.length; i++) {
    for (let j = 0; j < members.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < members.length; k++) {
        if (k === i || k === j) continue;
        const u = members[i];
        const v = members[j];
        const w = members[k];

        if (
          edgeSet.has(`${u.id}->${v.id}`) &&
          edgeSet.has(`${v.id}->${w.id}`) &&
          edgeSet.has(`${w.id}->${u.id}`)
        ) {
          const sortedKey = [u.id, v.id, w.id].sort().join("->");
          if (!visited3Cycles.has(sortedKey)) {
            visited3Cycles.add(sortedKey);
            cycles.push({
              cycleType: "3-cycle",
              memberIds: [u.id, v.id, w.id],
              speciesNames: [u.speciesName, v.speciesName, w.speciesName],
              description: `Triad Defense Loop: ${u.speciesName} → ${v.speciesName} → ${w.speciesName} → ${u.speciesName}. Clean rotational pivot coverage.`,
              keySynergies: [
                `${u.speciesName} pivots into ${v.speciesName}`,
                `${v.speciesName} pivots into ${w.speciesName}`,
                `${w.speciesName} pivots into ${u.speciesName}`,
              ],
            });
          }
        }
      }
    }
  }

  // 4. Compute Node Metrics
  const nodes: NodeMetrics[] = members.map((m) => {
    const weaks = memberWeaknesses.get(m.id) || [];
    const inDegree = edges.filter((e) => e.toId === m.id).length;
    const outDegree = edges.filter((e) => e.fromId === m.id).length;
    const isIsolatedBurden = inDegree === 0 && weaks.length > 0;
    const isDefensiveAnchor = outDegree >= 3;

    return {
      memberId: m.id,
      speciesName: m.speciesName,
      weaknessCount: weaks.length,
      weaknesses: weaks,
      inDegree,
      outDegree,
      isIsolatedBurden,
      isDefensiveAnchor,
    };
  });

  const isolatedBurdens = nodes.filter((n) => n.isIsolatedBurden);

  // 5. Overall Connectivity Score
  const maxPossibleEdges = members.length * (members.length - 1);
  const connectivityScore =
    maxPossibleEdges > 0 ? Math.min(100, Math.round((edges.length / maxPossibleEdges) * 100)) : 0;

  let rating: "Elite Core" | "Robust Synergy" | "Moderate Synergy" | "Fragmented" = "Fragmented";
  if (connectivityScore >= 60 && isolatedBurdens.length === 0) {
    rating = "Elite Core";
  } else if (connectivityScore >= 40 && isolatedBurdens.length <= 1) {
    rating = "Robust Synergy";
  } else if (connectivityScore >= 20) {
    rating = "Moderate Synergy";
  }

  return {
    edges,
    nodes,
    cycles,
    isolatedBurdens,
    connectivityScore,
    summary: {
      totalEdges: edges.length,
      twoCyclesCount: cycles.filter((c) => c.cycleType === "2-cycle").length,
      threeCyclesCount: cycles.filter((c) => c.cycleType === "3-cycle").length,
      isolatedCount: isolatedBurdens.length,
      rating,
    },
  };
}

