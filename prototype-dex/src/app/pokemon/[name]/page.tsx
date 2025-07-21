/* eslint-disable */
import { notFound } from "next/navigation";
import {
  getPokemon,
  getPokemonSpecies,
  getEvolutionChainForPokemon,
  getPokemonType,
  getPokemonEncounters,
  getPokemonAbility,
} from "@/app/utils/api";
import {
  Pokemon,
  EvolutionStage,
  Move,
  PokemonForm,
  TypeEffectiveness,
  PokemonEncounter,
  PokedexNumber,
  FlavorTextEntry,
  PokemonSpecies,
} from "@/app/utils/types";
import PokemonDetailClient from "./page.client";

// --- Helper Functions ---
function computeTypeEffectiveness(typeDataArr: any[]): TypeEffectiveness {
  const attackTypes = [ "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy" ];
  const typeEffectiveness: TypeEffectiveness = {};
  for (const atkType of attackTypes) {
    let multiplier = 1;
    for (const t of typeDataArr) {
      if (!t?.damage_relations) continue;
      if (t.damage_relations.double_damage_from.some((x: { name: string }) => x.name === atkType)) multiplier *= 2;
      if (t.damage_relations.half_damage_from.some((x: { name: string }) => x.name === atkType)) multiplier *= 0.5;
      if (t.damage_relations.no_damage_from.some((x: { name: string }) => x.name === atkType)) multiplier *= 0;
    }
    typeEffectiveness[atkType] = multiplier;
  }
  return typeEffectiveness;
}

function getFormTypeLabel(name: string): string {
  if (name.includes("mega-x")) return "Mega X";
  if (name.includes("mega-y")) return "Mega Y";
  if (name.includes("mega")) return "Mega";
  if (name.includes("gmax")) return "Gmax";
  if (name.includes("alola")) return "Alolan";
  if (name.includes("galar")) return "Galarian";
  if (name.includes("hisui")) return "Hisuian";
  if (name.includes("paldea")) return "Paldean";
  return "Standard"; // Return a default value
}

function humanize(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Main Page Component ---
export default async function PokemonPage({ params }: { params: { name: string } }) {
  const { name } = await params;

  const [pokemonRes, speciesRes, encountersRes, evoChainRes] = await Promise.all([
    getPokemon(name),
    getPokemonSpecies(name),
    getPokemonEncounters(name),
    getEvolutionChainForPokemon(name),
  ]);

  if (!pokemonRes.data || !speciesRes.data) {
    return notFound();
  }
  const pokemon = pokemonRes.data;
  const species = speciesRes.data as PokemonSpecies;

  const evoChain: EvolutionStage[] = evoChainRes.data ?? [];
  const evoError: string | null = evoChainRes.error ?? null;

  let forms: PokemonForm[] = [];
  if (species?.varieties) {
    const allVarietyData = (await Promise.all(
      species.varieties.map(v => getPokemon(v.pokemon.name))
    )).map(res => res.data).filter((p): p is Pokemon => p !== null);
    
    const formsArr = await Promise.all(
      allVarietyData.map(async (formPokemon) => {
        const abilities = await Promise.all(
          formPokemon.abilities.map(async (a) => {
            const abilityRes = await getPokemonAbility(a.ability.name);
            const effectEntry = (abilityRes.data as any)?.effect_entries?.find((e: any) => e.language.name === "en");
            return {
              name: a.ability.name,
              is_hidden: a.is_hidden,
              description: effectEntry?.short_effect || "",
            };
          })
        );
        return {
          id: formPokemon.id,
          name: formPokemon.name,
          form_name: formPokemon.is_default ? undefined : formPokemon.name,
          sprite: formPokemon.sprites.front_default,
          types: formPokemon.types.map(t => t.type.name),
          abilities,
          stats: formPokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
          form_type: getFormTypeLabel(formPokemon.name),
        };
      })
    );
    forms = formsArr.filter((f): f is PokemonForm => f !== null);

    const megaAndGmaxForms = forms.filter(f => f.form_type?.includes("Mega") || f.form_type?.includes("Gmax"));
    const regionalForms = forms.filter(f => f.form_type?.includes("Alolan") || f.form_type?.includes("Galarian") || f.form_type?.includes("Hisuian") || f.form_type?.includes("Paldean"));
    
    if (evoChain.length > 0) {
        if (megaAndGmaxForms.length > 0) {
            evoChain[evoChain.length - 1].forms = megaAndGmaxForms;
        }
        if (regionalForms.length > 0) {
            evoChain[0].forms = [...(evoChain[0].forms || []), ...regionalForms];
        }
    }
  }
  
  const typeNames = pokemon.types.map((t) => t.type.name);
  const typeDataArr = (await Promise.all(typeNames.map((n) => getPokemonType(n)))).map(d => d.data);
  const typeEffectiveness = computeTypeEffectiveness(typeDataArr);

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
  
  // FIX: Process raw API data structures correctly
  const flavorTexts: FlavorTextEntry[] = species.flavor_text_entries
    ?.filter((ft) => ft.language.name === "en")
    .map((ft) => ({ version: ft.version.name, text: ft.flavor_text.replace(/\f/g, " ") })) ?? [];

  const pokedexNumbers: PokedexNumber[] = species.pokedex_numbers
    ?.map((pn) => ({ name: pn.pokedex.name, number: pn.entry_number })) ?? [];

  const eggGroups: string[] = species.egg_groups?.map((g) => g.name) ?? [];
  
  const moves = pokemon.moves.flatMap(pm => pm.version_group_details.map(vgd => ({ name: pm.move.name, method: vgd.move_learn_method.name as Move['method'], level_learned_at: vgd.level_learned_at, version_group: vgd.version_group.name })));
  const availableMoveVersions = Array.from(new Set(moves.map(m => m.version_group)));
  const availableEncounterVersions = Array.from(new Set(encounters.map(e => e.version)));

  const enrichedPokemon: Pokemon = {
    ...pokemon,
    pokedex_numbers: pokedexNumbers,
    gender_rate: species.gender_rate,
    egg_groups: eggGroups,
    hatch_counter: species.hatch_counter,
    flavor_text_entries: flavorTexts,
    type_effectiveness: typeEffectiveness,
  };
  
  return (
    <PokemonDetailClient
      pokemon={enrichedPokemon}
      evoChain={evoChain}
      evoError={evoError}
      flavorTexts={flavorTexts}
      abilities={forms.find(f => f.id === pokemon.id)?.abilities || []}
      moves={moves}
      encounters={encounters}
      availableVersions={availableMoveVersions}
      availableEncounterVersions={availableEncounterVersions}
      forms={forms}
    />
  );
}
