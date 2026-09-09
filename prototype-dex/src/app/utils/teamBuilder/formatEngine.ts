// Bitmask & Rule Engine for Competitive and Nintendo Game Format Legalities
import { PokemonFormat } from "./types";

export enum FormatBitmask {
  GEN9_OU = 1 << 0,
  GEN9_VGC = 1 << 1,
  GEN9_UBERS = 1 << 2,
  GEN9_UU = 1 << 3,
  NATDEX_OU = 1 << 4,
  GEN1 = 1 << 5,
  GEN2 = 1 << 6,
  GEN3 = 1 << 7,
  GEN4 = 1 << 8,
  GEN5 = 1 << 9,
  GEN6 = 1 << 10,
  GEN7 = 1 << 11,
  GEN8 = 1 << 12,
  GEN9 = 1 << 13,
  CUSTOM = 1 << 14,
}

export interface FormatConfig {
  key: PokemonFormat;
  bitmask: FormatBitmask;
  label: string;
  kanji: string;
  category: "Competitive" | "Nintendo Generation" | "Sandbox";
  defaultLevel: number;
  maxTeamSize: number;
  description: string;
  hasTera: boolean;
}

export const FORMAT_CONFIGS: Record<PokemonFormat, FormatConfig> = {
  gen9ou: {
    key: "gen9ou",
    bitmask: FormatBitmask.GEN9_OU,
    label: "Gen 9 OU (Smogon)",
    kanji: "現行単",
    category: "Competitive",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Standard 6v6 Singles Tier. Banned Ubers excluded.",
    hasTera: true,
  },
  gen9vgc: {
    key: "gen9vgc",
    bitmask: FormatBitmask.GEN9_VGC,
    label: "VGC 2026 / Reg G",
    kanji: "公式複",
    category: "Competitive",
    defaultLevel: 50,
    maxTeamSize: 6,
    description: "Official Nintendo Doubles Championship format (bring 6, pick 4).",
    hasTera: true,
  },
  gen9ubers: {
    key: "gen9ubers",
    bitmask: FormatBitmask.GEN9_UBERS,
    label: "Gen 9 Ubers",
    kanji: "超戦階",
    category: "Competitive",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Unrestricted powerhouse metagame permitting Box Legendaries.",
    hasTera: true,
  },
  gen9uu: {
    key: "gen9uu",
    bitmask: FormatBitmask.GEN9_UU,
    label: "Gen 9 UU",
    kanji: "中戦階",
    category: "Competitive",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "UnderUsed metagame excluding OU and Uber staples.",
    hasTera: true,
  },
  natdex_ou: {
    key: "natdex_ou",
    bitmask: FormatBitmask.NATDEX_OU,
    label: "National Dex OU",
    kanji: "全国戦",
    category: "Competitive",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "All historical 1,025 Pokémon allowed with modern Gen 9 mechanics.",
    hasTera: true,
  },
  gen1: {
    key: "gen1",
    bitmask: FormatBitmask.GEN1,
    label: "Gen 1: Red / Blue / Yellow",
    kanji: "赤緑青",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Original Kanto Bioregion (Species #0001 - #0151).",
    hasTera: false,
  },
  gen2: {
    key: "gen2",
    bitmask: FormatBitmask.GEN2,
    label: "Gen 2: Gold / Silver / Crystal",
    kanji: "金銀晶",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Johto & Kanto Historic Bioregions (#0001 - #0251).",
    hasTera: false,
  },
  gen3: {
    key: "gen3",
    bitmask: FormatBitmask.GEN3,
    label: "Gen 3: Ruby / Sapphire / Emerald",
    kanji: "紅藍緑",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Hoenn Subtropical Bioregion (#0001 - #0386).",
    hasTera: false,
  },
  gen4: {
    key: "gen4",
    bitmask: FormatBitmask.GEN4,
    label: "Gen 4: Diamond / Pearl / Platinum",
    kanji: "金剛真",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Sinnoh Mountain Range (#0001 - #0493).",
    hasTera: false,
  },
  gen5: {
    key: "gen5",
    bitmask: FormatBitmask.GEN5,
    label: "Gen 5: Black / White",
    kanji: "黒白編",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Unova Continental Fauna (#0001 - #0649).",
    hasTera: false,
  },
  gen6: {
    key: "gen6",
    bitmask: FormatBitmask.GEN6,
    label: "Gen 6: X / Y",
    kanji: "XY編",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Kalos European Bioregion (#0001 - #0721).",
    hasTera: false,
  },
  gen7: {
    key: "gen7",
    bitmask: FormatBitmask.GEN7,
    label: "Gen 7: Sun / Moon",
    kanji: "日月編",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Alola Tropical Islands (#0001 - #0809).",
    hasTera: false,
  },
  gen8: {
    key: "gen8",
    bitmask: FormatBitmask.GEN8,
    label: "Gen 8: Sword / Shield",
    kanji: "剣盾編",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Galar Industrial Lands (#0001 - #0905).",
    hasTera: false,
  },
  gen9: {
    key: "gen9",
    bitmask: FormatBitmask.GEN9,
    label: "Gen 9: Scarlet / Violet",
    kanji: "朱紫編",
    category: "Nintendo Generation",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Paldea Wilderness (#0001 - #1025).",
    hasTera: true,
  },
  custom: {
    key: "custom",
    bitmask: FormatBitmask.CUSTOM,
    label: "Showdown Freeform / Custom",
    kanji: "自由戦",
    category: "Sandbox",
    defaultLevel: 100,
    maxTeamSize: 6,
    description: "Unrestricted sandbox for testing and theorycrafting.",
    hasTera: true,
  },
};

import formatsDataRaw from "@/app/data/formats-data.json";

export interface TierEntry {
  tier: string;
  isNonstandard: string | null;
  doublesTier: string | null;
  natDexTier: string | null;
}

const formatsData = formatsDataRaw as Record<string, TierEntry>;

export function cleanSpeciesKey(name: string): string {
  const s = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (formatsData[s]) return s;
  const suffixes = [
    "normal", "plant", "altered", "land", "redstriped", "standard",
    "incarnate", "ordinary", "aria", "shield", "average", "50",
    "baile", "midday", "solo", "redmeteor", "disguised", "amped",
    "ice", "fullbelly", "singlestrike", "twosegment", "familyoffour",
    "greenplumage", "zero", "curly", "male"
  ];
  for (const suf of suffixes) {
    if (s.endsWith(suf)) {
      const base = s.slice(0, -suf.length);
      if (formatsData[base]) return base;
    }
  }
  return s;
}

export interface PokemonTierInfo {
  tier: string;
  isGen9Legal: boolean;
  doublesTier: string | null;
  natDexTier: string | null;
  sortWeight: number;
}

const TIER_WEIGHTS: Record<string, number> = {
  OU: 100,
  UUBL: 85,
  UU: 80,
  RUBL: 65,
  RU: 60,
  NUBL: 45,
  NU: 40,
  PUBL: 25,
  PU: 20,
  ZUBL: 15,
  ZU: 10,
  NFE: 5,
  LC: 1,
  Uber: 95,
  AG: 99,
  Untiered: 0,
};

export function getPokemonTierInfo(speciesName: string): PokemonTierInfo {
  const k = cleanSpeciesKey(speciesName);
  const entry = formatsData[k];
  if (!entry) {
    return {
      tier: "Untiered",
      isGen9Legal: true,
      doublesTier: null,
      natDexTier: null,
      sortWeight: 0,
    };
  }

  const isGen9Legal = entry.isNonstandard !== "Past";
  const tier = entry.tier || "Untiered";
  const sortWeight = TIER_WEIGHTS[tier] ?? 0;

  return {
    tier,
    isGen9Legal,
    doublesTier: entry.doublesTier,
    natDexTier: entry.natDexTier,
    sortWeight,
  };
}

// Generation Maximum National Dex IDs
const GEN_MAX_ID: Record<string, number> = {
  gen1: 151,
  gen2: 251,
  gen3: 386,
  gen4: 493,
  gen5: 649,
  gen6: 721,
  gen7: 809,
  gen8: 905,
  gen9: 1025,
};

/**
 * Validates whether a Pokémon is legal in the selected format using Showdown tier rules.
 */
export function isPokemonLegal(
  pokemonId: number,
  speciesName: string,
  format: PokemonFormat
): { legal: boolean; reason?: string } {
  if (format === "custom") {
    return { legal: true };
  }

  // Generation Cartridge Lock (Gen 1 - 8)
  if (
    format !== "natdex_ou" &&
    format !== "gen9ou" &&
    format !== "gen9vgc" &&
    format !== "gen9ubers" &&
    format !== "gen9uu" &&
    format !== "gen9"
  ) {
    const maxGenId = GEN_MAX_ID[format];
    if (maxGenId !== undefined) {
      if (pokemonId > maxGenId) {
        return {
          legal: false,
          reason: `Exceeds ${FORMAT_CONFIGS[format]?.label || format} Dex boundary (#${maxGenId})`,
        };
      }
      return { legal: true };
    }
  }

  const tierInfo = getPokemonTierInfo(speciesName);

  // NatDex OU: all 1,025 allowed except NatDex Ubers / AG
  if (format === "natdex_ou") {
    if (tierInfo.natDexTier === "Uber" || tierInfo.natDexTier === "AG") {
      return {
        legal: false,
        reason: "Banned in National Dex OU (Classified as Uber/AG)",
      };
    }
    return { legal: true };
  }

  // Gen 9 formats require species availability in Scarlet/Violet (Paldea + Kitakami + Blueberry + Transfers)
  if (!tierInfo.isGen9Legal) {
    return {
      legal: false,
      reason: "Not available in Gen 9 (Scarlet & Violet cut species)",
    };
  }

  // Gen 9 Ubers / Gen 9 Dex: All Gen 9 legal Pokémon allowed
  if (format === "gen9ubers" || format === "gen9") {
    return { legal: true };
  }

  // Gen 9 OU: Smogon Standard
  if (format === "gen9ou") {
    if (tierInfo.tier === "Uber" || tierInfo.tier === "AG") {
      return {
        legal: false,
        reason: "Banned in Gen 9 OU (Classified as Uber)",
      };
    }
    return { legal: true };
  }

  // Gen 9 UU: UnderUsed (OU & UUBL banned)
  if (format === "gen9uu") {
    if (
      tierInfo.tier === "Uber" ||
      tierInfo.tier === "AG" ||
      tierInfo.tier === "OU" ||
      tierInfo.tier === "UUBL"
    ) {
      return {
        legal: false,
        reason: "Banned in Gen 9 UU (OU/Uber tier)",
      };
    }
    return { legal: true };
  }

  // Gen 9 VGC: Official Doubles Championship rules
  if (format === "gen9vgc") {
    return { legal: true };
  }

  return { legal: true };
}

