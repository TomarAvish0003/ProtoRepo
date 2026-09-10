import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPokemon,
  getPokemonSpecies,
  getEvolutionChainForPokemon,
  getPokemonEncounters,
  getPokemonAbility,
  getMovesBatch,
} from "@/app/utils/api";
import {
  Pokemon,
  EvolutionStage,
  Move,
  PokemonForm,
  TypeEffectiveness,
  Ability,
  PokemonEncounter,
  PokedexNumber,
  FlavorTextEntry,
  PokemonSpecies,
  RawAbility,
  RawPokemonType,
  RawStat,
  FlatVarietyWithTypes,
  FormCategory,
} from "@/app/utils/types";
import { TYPE_CHART } from "@/app/utils/teamBuilder/typeEngine";
import { PokemonType } from "@/app/utils/teamBuilder/types";
import PokemonDetailClient from "./page.client";
import localMovesData from "@/app/data/pokemon_moves.json";
import localPokedexData from "@/app/data/pokedex-data.json";

// --- Type Definitions for this Page ---

/**
 * Next.js App Router dynamic route parameters.
 */
interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    title: `${capitalized} // Pokédex Entry - ProtoDex`,
    description: `Complete base stats, type matchups, move learnsets, and competitive battle telemetry for ${capitalized}.`,
    openGraph: {
      title: `${capitalized} // Pokédex Entry - ProtoDex`,
      description: `Complete base stats, type matchups, move learnsets, and competitive battle telemetry for ${capitalized}.`,
    },
  };
}

/** Raw API payload structure for Pokémon ability details. */
interface RawAbilityResponse {
    effect_entries?: {
        effect: string;
        language: { name: string };
        short_effect: string;
    }[];
}

// --- Helper Functions ---
const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
] as const;

function calculateTypeEffectiveness(defendingTypes: string[]): TypeEffectiveness {
  const cleanTypes = defendingTypes.map((t) => t.toLowerCase() as PokemonType);
  const typeEffectiveness: TypeEffectiveness = {};
  for (const atk of ALL_TYPES) {
    let multiplier = 1;
    for (const def of cleanTypes) {
      if (TYPE_CHART[atk] && TYPE_CHART[atk][def] !== undefined) {
        multiplier *= TYPE_CHART[atk][def];
      }
    }
    typeEffectiveness[atk] = multiplier;
  }
  return typeEffectiveness;
}

function classifyForm(name: string): { label: string; category: FormCategory } {
  const lower = name.toLowerCase();
  if (lower.includes("mega-x")) return { label: "Mega Evolution X", category: "mega" };
  if (lower.includes("mega-y")) return { label: "Mega Evolution Y", category: "mega" };
  if (lower.includes("mega") || lower.includes("primal")) {
    return { label: lower.includes("primal") ? "Primal Reversion" : "Mega Evolution", category: "mega" };
  }
  if (lower.includes("gmax")) return { label: "Gigantamax", category: "gmax" };
  if (lower.includes("alola")) return { label: "Alolan Form", category: "regional" };
  if (lower.includes("galar")) return { label: "Galarian Form", category: "regional" };
  if (lower.includes("hisui")) return { label: "Hisuian Form", category: "regional" };
  if (lower.includes("paldea")) return { label: "Paldean Form", category: "regional" };
  if (
    lower.includes("origin") || lower.includes("therian") || lower.includes("blade") ||
    lower.includes("shield") || lower.includes("zen") || lower.includes("school") ||
    lower.includes("pirouette") || lower.includes("complete") || lower.includes("10-percent") ||
    lower.includes("attack") || lower.includes("defense") || lower.includes("speed") ||
    lower.includes("crowned") || lower.includes("rapid-strike") || lower.includes("single-strike") ||
    lower.includes("hero") || lower.includes("dusk") || lower.includes("dawn") || lower.includes("ultra") ||
    lower.includes("ice") || lower.includes("shadow") || lower.includes("stellar") || lower.includes("terastal") ||
    lower.includes("heat") || lower.includes("wash") || lower.includes("frost") || lower.includes("fan") || lower.includes("mow") ||
    lower.includes("sky") || lower.includes("hangry")
  ) {
    return { label: "Battle Stance", category: "battle" };
  }
  if (
    lower.includes("cap") || lower.includes("totem") || lower.includes("starter") ||
    lower.includes("cosplay") || lower.includes("rock-star") || lower.includes("belle") ||
    lower.includes("pop-star") || lower.includes("phd") || lower.includes("libre")
  ) {
    return { label: "Special Variant", category: "cosmetic" };
  }
  return { label: "Standard", category: "standard" };
}

function humanize(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Main Page Component ---
export default async function PokemonPage({ params }: PageProps) {
  const { name } = await params;

  const [pokemonRes, speciesRes, encountersRes] = await Promise.all([
    getPokemon(name),
    getPokemonSpecies(name),
    getPokemonEncounters(name),
  ]);

  if (!pokemonRes.data || !speciesRes.data) {
    return notFound();
  }
  const pokemon = pokemonRes.data;
  const species = speciesRes.data as PokemonSpecies;

  // Ingest evolution chain asynchronously using pre-fetched species evolution chain URL
  const evoChainPromise = getEvolutionChainForPokemon(
    name,
    (species as { evolution_chain?: { url?: string } })?.evolution_chain?.url
  );

  // 1. Optimized Variety and Alternate Form Ingestion
  let forms: PokemonForm[] = [];
  if (species?.varieties && species.varieties.length > 0) {
    const varietyEntries = species.varieties;
    const prioritizedVarieties: typeof varietyEntries = [];
    const cosmeticVarieties: typeof varietyEntries = [];

    for (const v of varietyEntries) {
      const { category } = classifyForm(v.pokemon.name);
      if (v.is_default || v.pokemon.name.toLowerCase() === pokemon.name.toLowerCase()) {
        prioritizedVarieties.unshift(v);
      } else if (category === "mega" || category === "gmax" || category === "regional" || category === "battle") {
        prioritizedVarieties.push(v);
      } else {
        cosmeticVarieties.push(v);
      }
    }

    // Include prioritized forms and cap cosmetic forms to at most 2, max 9 total varieties
    const selectedVarieties = [
      ...prioritizedVarieties,
      ...cosmeticVarieties.slice(0, 2),
    ].slice(0, 9);

    // Reuse in-memory base pokemon payload instead of duplicate remote network fetch
    const varietyResults = await Promise.allSettled(
      selectedVarieties.map((v) => {
        if (v.is_default || v.pokemon.name.toLowerCase() === pokemon.name.toLowerCase()) {
          return Promise.resolve({ data: pokemon, error: null });
        }
        return getPokemon(v.pokemon.name);
      })
    );

    const formsArr: PokemonForm[] = [];
    for (let i = 0; i < selectedVarieties.length; i++) {
      const res = varietyResults[i];
      if (res.status !== "fulfilled" || !res.value?.data) continue;
      const fData = res.value.data as Pokemon;
      const { label, category } = classifyForm(fData.name);

      const stats = (fData.stats || []).map((s: RawStat) => ({
        name: s.stat.name,
        value: s.base_stat,
      }));
      const bst = stats.reduce((acc, curr) => acc + curr.value, 0);

      const officialArt =
        fData.sprites?.other?.["official-artwork"]?.front_default ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fData.id}.png`;

      formsArr.push({
        id: fData.id,
        name: fData.name,
        form_name: fData.is_default ? undefined : fData.name,
        sprite: fData.sprites?.front_default || officialArt,
        officialArtwork: officialArt,
        types: (fData.types || []).map((t: RawPokemonType) => t.type.name),
        abilities: (fData.abilities || []).map((a: RawAbility) => ({
          name: a.ability.name,
          is_hidden: a.is_hidden,
          description: "",
        })),
        stats,
        bst,
        height: fData.height,
        weight: fData.weight,
        form_type: label,
        category,
      });
    }
    forms = formsArr;
  }

  // 2. Resolve Evolution Chain and Type Mapping for Evolution Lineage
  const evoChainRes = await evoChainPromise;
  const evoError: string | null = evoChainRes.error ?? null;
  const rawTree = evoChainRes.data?.tree || null;
  const rawStages = evoChainRes.data?.stages || [];

  const stageTypeMap = new Map<number, string[]>();
  for (const stage of rawStages) {
    const localEntry = (localPokedexData as unknown as FlatVarietyWithTypes[]).find(
      (p) => p.id === stage.id || p.name.toLowerCase() === stage.name.toLowerCase()
    );
    if (localEntry?.types) {
      stageTypeMap.set(stage.id, localEntry.types);
    }
  }

  await Promise.all(
    rawStages.map(async (stage) => {
      if (!stageTypeMap.has(stage.id)) {
        try {
          const res = await getPokemon(String(stage.id));
          if (res.data?.types) {
            stageTypeMap.set(
              stage.id,
              res.data.types.map((t: RawPokemonType) => t.type.name)
            );
          }
        } catch {
          stageTypeMap.set(stage.id, ["normal"]);
        }
      }
    })
  );

  // 3. Enriched Recursive Evolution Tree
  function enrichEvolutionTree(node: EvolutionStage): EvolutionStage {
    const nodeTypes = stageTypeMap.get(node.id) || [];
    const stageForms = node.id === pokemon.id
      ? forms.filter((f) => f.category !== "standard")
      : undefined;

    return {
      ...node,
      types: nodeTypes,
      forms: stageForms,
      evolves_to: (node.evolves_to || []).map(enrichEvolutionTree),
    };
  }

  const enrichedTree = rawTree ? enrichEvolutionTree(rawTree) : null;
  const evoChainWithTypes: EvolutionStage[] = rawStages.map((stage) => ({
    ...stage,
    types: stageTypeMap.get(stage.id) || [],
    forms: stage.id === pokemon.id ? forms.filter((f) => f.category !== "standard") : undefined,
  }));
  
  const typeNames = pokemon.types.map((t: RawPokemonType) => t.type.name);
  const typeEffectiveness = calculateTypeEffectiveness(typeNames);

  const encounters: PokemonEncounter[] = encountersRes.data?.flatMap(loc =>
    loc.version_details.flatMap(ver =>
      ver.encounter_details.map(ed => ({
        location: humanize(loc.location_area.name),
        version: ver.version.name,
        method: humanize(ed.method.name),
        min_level: ed.min_level,
        max_level: ed.max_level,
        rate: ed.chance,
      }))
    )
  ) ?? [];
  
  const flavorTexts: FlavorTextEntry[] = species.flavor_text_entries
    ?.filter((ft) => ft.language.name === "en")
    .map((ft) => ({
      version: ft.version.name,
      text: ft.flavor_text.replace(/[\f\n\r\t]/g, " ").replace(/\s+/g, " ").trim(),
    })) ?? [];

  const pokedexNumbers: PokedexNumber[] = species.pokedex_numbers
    ?.map((pn) => ({ name: pn.pokedex.name, number: pn.entry_number })) ?? [];

  const eggGroups: string[] = species.egg_groups?.map((g) => g.name) ?? [];
  
  // Helper to parse numeric move stats safely
  const parseStatNum = (val: unknown): number | undefined => {
    if (val === undefined || val === null || val === "—" || val === "" || isNaN(Number(val))) return undefined;
    return Number(val);
  };

  interface DbMoveMeta {
    name?: string;
    power?: number | null;
    accuracy?: number | null;
    pp?: number | null;
    type?: string;
    damageClass?: string;
    damage_class?: string;
    shortDescription?: string;
  }

  // Hydrate moves with real damageClass, power, accuracy, pp, and type from Turso database with static fallback
  const uniqueMoveNames = Array.from(new Set((pokemon.moves || []).map((pm) => pm.move.name)));
  const moveMetaMap = new Map<string, DbMoveMeta>();
  try {
    const movesBatchRes = await getMovesBatch(uniqueMoveNames);
    if (movesBatchRes.data?.moves) {
      for (const m of movesBatchRes.data.moves) {
        moveMetaMap.set(m.name.toLowerCase(), m as unknown as DbMoveMeta);
      }
    }
  } catch (err) {
    console.error("Failed to hydrate moves batch:", err);
  }

  const movesRecord = localMovesData as Record<string, {
    type?: string;
    category?: string;
    power?: string;
    accuracy?: string;
    pp?: string;
    effect?: string;
  }>;

  const moves: Move[] = (pokemon.moves || []).flatMap((pm) => {
    const cleanKey = pm.move.name.toLowerCase().trim();
    const dbMeta = moveMetaMap.get(cleanKey);
    const localMeta = movesRecord[cleanKey] ||
      movesRecord[cleanKey.replace(/-/g, " ")] ||
      movesRecord[cleanKey.replace(/-/g, "")];

    const resolvedPower = dbMeta?.power !== undefined && dbMeta?.power !== null
      ? dbMeta.power
      : parseStatNum(localMeta?.power);

    const resolvedAccuracy = dbMeta?.accuracy !== undefined && dbMeta?.accuracy !== null
      ? dbMeta.accuracy
      : parseStatNum(localMeta?.accuracy);

    const resolvedPp = dbMeta?.pp !== undefined && dbMeta?.pp !== null
      ? dbMeta.pp
      : parseStatNum(localMeta?.pp);

    const resolvedType = (dbMeta?.type || localMeta?.type || "normal").toLowerCase();

    const resolvedDamageClass = (
      dbMeta?.damageClass ||
      dbMeta?.damage_class ||
      localMeta?.category ||
      "status"
    ).toLowerCase();

    const resolvedShortDesc = dbMeta?.shortDescription || localMeta?.effect || undefined;

    return pm.version_group_details.map((vgd) => ({
      name: pm.move.name,
      method: vgd.move_learn_method.name as Move['method'],
      level_learned_at: vgd.level_learned_at,
      version_group: vgd.version_group.name,
      power: resolvedPower,
      accuracy: resolvedAccuracy,
      pp: resolvedPp,
      type: resolvedType,
      damage_class: resolvedDamageClass,
      category: resolvedDamageClass,
      shortDescription: resolvedShortDesc,
    }));
  });

  const availableMoveVersions = Array.from(new Set(moves.map((m) => m.version_group)));
  const availableEncounterVersions = Array.from(new Set(encounters.map((e) => e.version)));

  const enrichedPokemon: Pokemon = {
    ...pokemon,
    pokedex_numbers: pokedexNumbers,
    gender_rate: species.gender_rate,
    egg_groups: eggGroups,
    hatch_counter: species.hatch_counter,
    flavor_text_entries: flavorTexts,
    type_effectiveness: typeEffectiveness,
  };
  
  const resolvedAbilities: Ability[] = await Promise.all(
    (pokemon.abilities || []).map(async (a: RawAbility) => {
      try {
        const abilityRes = await getPokemonAbility(a.ability.name);
        const effectEntry = (abilityRes.data as RawAbilityResponse)?.effect_entries?.find((e) => e.language.name === "en");
        return {
          name: a.ability.name,
          is_hidden: a.is_hidden,
          description: effectEntry?.short_effect || "",
        };
      } catch {
        return {
          name: a.ability.name,
          is_hidden: a.is_hidden,
          description: "",
        };
      }
    })
  );

  return (
    <PokemonDetailClient
      pokemon={enrichedPokemon}
      evoChain={evoChainWithTypes}
      evoTree={enrichedTree}
      evoError={evoError}
      flavorTexts={flavorTexts}
      abilities={resolvedAbilities}
      moves={moves}
      encounters={encounters}
      availableVersions={availableMoveVersions}
      availableEncounterVersions={availableEncounterVersions}
      forms={forms}
    />
  );
}
