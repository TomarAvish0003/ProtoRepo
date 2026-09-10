// --- Raw API Types ---
// These types match the nested structure directly from the PokeAPI

export interface RawPokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface RawVersionGroupDetail {
  level_learned_at: number;
  move_learn_method: { name: string; url: string };
  version_group: { name: string; url: string };
}

export interface RawPokemonMove {
  move: { name: string; url: string };
  version_group_details: RawVersionGroupDetail[];
}

export interface RawStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface RawAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface RawSprites {
  front_default: string;
  other?: {
    'official-artwork'?: {
      front_default: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RawDamageRelations {
  double_damage_from: { name: string; url?: string }[];
  double_damage_to: { name: string; url?: string }[];
  half_damage_from: { name: string; url?: string }[];
  half_damage_to: { name: string; url?: string }[];
  no_damage_from: { name: string; url?: string }[];
  no_damage_to: { name: string; url?: string }[];
}

export interface RawTypeApiResponse {
  id?: number;
  name?: string;
  damage_relations?: RawDamageRelations;
  [key: string]: unknown;
}

// --- User Profile Type ---
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string | Date;
  favorites?: string[];
  caught?: string[];
}

// --- Simplified/Processed Types ---
// These are the clean, flat types your application components will use.

export interface PokedexNumber {
  name: string;
  number: number;
}

export interface FlavorTextEntry {
  version: string;
  text: string;
}

export interface PokemonEncounter {
  version: string;
  location: string;
  method: string;
  min_level?: number;
  max_level?: number;
  rate?: number;
}

export type FormCategory = "mega" | "gmax" | "regional" | "battle" | "cosmetic" | "standard";

export interface PokemonForm {
  id: number;
  name: string;
  form_name: string | undefined;
  sprite: string;
  officialArtwork?: string;
  types: string[];
  abilities: Ability[];
  stats: { name: string; value: number }[];
  bst?: number;
  height?: number;
  weight?: number;
  form_type: string;
  category?: FormCategory;
}

export interface TypeEffectiveness {
  [type: string]: number;
}

export interface EvolutionDetail {
  item?: { name: string; url: string } | null;
  trigger: { name: string; url: string };
  gender?: number | null;
  held_item?: { name: string; url: string } | null;
  known_move?: { name: string; url: string } | null;
  known_move_type?: { name: string; url: string } | null;
  location?: { name: string; url: string } | null;
  min_level?: number | null;
  min_happiness?: number | null;
  min_beauty?: number | null;
  min_affection?: number | null;
  needs_overworld_rain?: boolean | null;
  party_species?: { name: string; url: string } | null;
  party_type?: { name: string; url: string } | null;
  relative_physical_stats?: number | null;
  time_of_day?: string;
  trade_species?: { name: string; url: string } | null;
  turn_upside_down?: boolean | null;
}

export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  evolution_details: EvolutionDetail[];
  forms?: PokemonForm[];
  types?: string[];
  evolves_to?: EvolutionStage[];
}

export type MoveMethod = "level-up" | "machine" | "egg" | "tutor" | "event";

export interface Move {
  name: string;
  type?: string;
  category?: string;
  power?: number;
  accuracy?: number;
  pp?: number;
  method: MoveMethod;
  level_learned_at?: number;
  version_group: string;
  effect?: string;
  flavor_text?: string;
  damage_class?: string;
  shortDescription?: string;
}

export interface Ability {
  name: string;
  is_hidden: boolean;
  description: string;
}

// --- Main Interfaces Reflecting Raw API Data ---

export interface Pokemon {
  id: number;
  name: string;
  sprites: RawSprites;
  types: RawPokemonType[];
  height: number;
  weight: number;
  abilities: RawAbility[];
  stats: RawStat[];
  moves: RawPokemonMove[];
  is_default: boolean;

  // Extended properties that are added after processing
  pokedex_numbers?: PokedexNumber[];
  gender_rate?: number;
  egg_groups?: string[];
  hatch_counter?: number;
  catch_rate?: number;
  flavor_text_entries?: FlavorTextEntry[];
  encounters?: PokemonEncounter[];
  moves_details?: Move[];
  available_versions?: string[];
  forms?: PokemonForm[];
  type_effectiveness?: TypeEffectiveness;
}

export type PokemonSpecies = {
  evolution_chain?: { url: string };
  varieties?: { is_default: boolean; pokemon: { name: string; url: string } }[];
  flavor_text_entries?: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  pokedex_numbers?: {
    entry_number: number;
    pokedex: { name: string };
  }[];
  gender_rate?: number;
  egg_groups?: { name: string; url: string }[];
  hatch_counter?: number;
};

// --- API-Specific Response Types ---

export interface FlatVarietyWithTypes {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height?: number;
  weight?: number;
  stats?: {
    hp?: number;
    atk?: number;
    def?: number;
    spa?: number;
    spd?: number;
    spe?: number;
    bst?: number;
  };
  abilities?: string[];
}

export interface PokedexListResponse {
  results: FlatVarietyWithTypes[];
  count: number;
}

export interface EncounterMethod {
  name: string;
  url: string;
}

export interface EncounterConditionValue {
  name: string;
  url: string;
}

export interface EncounterDetails {
  chance: number;
  min_level: number;
  max_level: number;
  method: EncounterMethod;
  condition_values: EncounterConditionValue[];
}

export interface EncounterVersionDetails {
  version: { name: string; url: string };
  max_chance: number;
  encounter_details: EncounterDetails[];
}

export interface EncounterLocationArea {
  location_area: { name: string; url: string };
  version_details: EncounterVersionDetails[];
}
