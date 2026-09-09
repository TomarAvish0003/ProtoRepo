// Team Builder Core Types and Interfaces

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "steel"
  | "dark"
  | "fairy";

export const ALL_POKEMON_TYPES: PokemonType[] = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "steel",
  "dark",
  "fairy",
];

export interface StatSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface StatStages {
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export type StatName = keyof StatSpread;

export interface TeamMember {
  id: string; // unique slot identifier (uuid)
  pokemonId: number;
  name: string;
  speciesName: string;
  nickname?: string;
  types: string[];
  item?: string;
  ability: string;
  nature: string;
  level: number;
  gender?: "M" | "F" | "N";
  shiny?: boolean;
  teraType?: string;
  evs: StatSpread;
  ivs: StatSpread;
  moves: [string, string, string, string];
  sprite?: string;
}

export type PokemonFormat =
  | "gen9ou"
  | "gen9vgc"
  | "gen9ubers"
  | "gen9uu"
  | "natdex_ou"
  | "gen1"
  | "gen2"
  | "gen3"
  | "gen4"
  | "gen5"
  | "gen6"
  | "gen7"
  | "gen8"
  | "gen9"
  | "custom";

export interface Team {
  id: string;
  name: string;
  format: PokemonFormat;
  members: TeamMember[];
  createdAt: number;
  updatedAt: number;
}

// Analytical Data Structures
export interface DefenseCell {
  type: PokemonType;
  pokemonIndex: number;
  multiplier: number; // 0, 0.25, 0.5, 1, 2, 4
  immunityReason?: string; // e.g. "Levitate", "Air Balloon", "Water Absorb"
}

export interface DefenseMatrixResult {
  matrix: number[][]; // 18 rows (types) x N cols (members)
  weaknessCounts: number[]; // Count of members weak (>1.0) to this type
  resistanceCounts: number[]; // Count of members resistant (<1.0) to this type
  immunityCounts: number[]; // Count of members immune (==0) to this type
  netScores: number[]; // resistances - weaknesses
  criticalWeaknesses: { type: PokemonType; count: number }[]; // >= 3 weak with 0 immunities
  details: DefenseCell[][];
}

export interface CoverageEdge {
  move: string;
  moveType: string;
  defendingType: PokemonType;
  multiplier: number;
}

export interface SetCoverRecommendation {
  type: PokemonType;
  coveredTargets: PokemonType[];
}

export interface CoverageReport {
  coveredTypes: PokemonType[];
  uncoveredTypes: PokemonType[];
  edges: CoverageEdge[];
  recommendations: SetCoverRecommendation[];
  totalAttackingMoves: number;
}

export interface SpeedTierEntry {
  pokemonId: number;
  name: string;
  effectiveSpeed: number;
  baseSpeed: number;
  ev: number;
  natureModifier: number;
  hasScarf: boolean;
  hasBooster: boolean;
  stage: number;
  isParalyzed: boolean;
  hasTailwind: boolean;
}

export interface SpeedBenchmark {
  label: string;
  sublabel: string;
  speed: number;
  colorClass: string;
}

export type WeatherType = "none" | "sun" | "rain" | "sand" | "snow";
export type TerrainType = "none" | "electric" | "grassy" | "psychic" | "misty";
export type BattleFormat = "singles" | "doubles";

export interface DamageCalcParams {
  attacker: {
    speciesName: string;
    types: string[];
    baseStats: StatSpread;
    level: number;
    evs: StatSpread;
    ivs: StatSpread;
    nature: string;
    stages: StatStages;
    item?: string;
    ability: string;
    teraType?: string;
    isTeraActive: boolean;
    isBurned: boolean;
  };
  defender: {
    speciesName: string;
    types: string[];
    baseStats: StatSpread;
    level: number;
    evs: StatSpread;
    ivs: StatSpread;
    nature: string;
    stages: StatStages;
    item?: string;
    ability: string;
    teraType?: string;
    isTeraActive: boolean;
    currentHpPercent: number; // 100 default
  };
  move: {
    name: string;
    type: string;
    category: "Physical" | "Special" | "Status";
    power: number;
  };
  field: {
    format: BattleFormat;
    weather: WeatherType;
    terrain: TerrainType;
    isReflect: boolean;
    isLightScreen: boolean;
    isAuroraVeil: boolean;
    isCritical: boolean;
    spikesLayers: number; // 0, 1, 2, 3
    isStealthRock: boolean;
  };
}

export interface Convolution2HKOResult {
  oneHitKoPercent: number; // 0 to 100
  twoHitKoPercent: number; // 0 to 100
  hazardChip: number; // damage from SR + Spikes
  passiveRecovery: number; // HP recovered per turn
  distribution1Hit: { damagePct: number; probability: number }[];
  distribution2Hit: { damagePct: number; probability: number }[];
  guaranteedSurvive: boolean;
  guaranteed2HKO: boolean;
}

export interface DamageRollResult {
  rolls: number[]; // 16 discrete damage rolls
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  defenderMaxHp: number;
  effectiveMoveType: string;
  typeMultiplier: number;
  isStab: boolean;
  koChanceText: string;
  stealthRockDamage: number;
  spikesDamage: number;
  convolution?: Convolution2HKOResult;
}

