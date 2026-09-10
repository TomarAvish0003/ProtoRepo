// Universal Pokémon Showdown Format Two-Way Serializer
import { TeamMember, Team, StatSpread } from "./types";
import { FlatVarietyWithTypes } from "@/app/utils/types";

/**
 * Parses raw Pokémon Showdown team export text into structured team members.
 */
export function parseShowdownText(
  text: string,
  pokedexData: FlatVarietyWithTypes[]
): { members: TeamMember[]; errors: string[] } {
  const errors: string[] = [];
  const members: TeamMember[] = [];

  // Split into individual pokemon text blocks (separated by empty lines)
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  // Quick lookup map for pokedex data
  const pokeMap = new Map<string, FlatVarietyWithTypes>();
  for (const p of pokedexData) {
    pokeMap.set(p.name.toLowerCase().replace(/[\s_]/g, "-"), p);
  }

  for (let idx = 0; idx < blocks.length; idx++) {
    if (members.length >= 6) break; // Maximum 6 team members

    const block = blocks[idx];
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let speciesName = "";
    let nickname: string | undefined = undefined;
    let item: string | undefined = undefined;
    let ability = "";
    let nature = "Serious";
    let level = 100;
    let gender: "M" | "F" | "N" = "N";
    let shiny = false;
    let teraType: string | undefined = undefined;
    const evs: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const ivs: StatSpread = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const moves: [string, string, string, string] = ["", "", "", ""];
    let moveIdx = 0;

    // Line 1: [Nickname (Species) | Species] [(M/F)] [@ Item]
    const headerLine = lines[0];
    let headerWithoutItem = headerLine;

    if (headerLine.includes("@")) {
      const parts = headerLine.split("@");
      headerWithoutItem = parts[0].trim();
      item = parts.slice(1).join("@").trim();
    }

    // Gender tag
    if (/\((M|F)\)$/i.test(headerWithoutItem)) {
      const match = headerWithoutItem.match(/\((M|F)\)$/i);
      if (match) {
        gender = match[1].toUpperCase() as "M" | "F";
        headerWithoutItem = headerWithoutItem.replace(/\((M|F)\)$/i, "").trim();
      }
    }

    // Nickname vs Species: e.g. "Chomp (Garchomp)"
    const nickMatch = headerWithoutItem.match(/^(.+?)\s*\((.+?)\)$/);
    if (nickMatch) {
      nickname = nickMatch[1].trim();
      speciesName = nickMatch[2].trim();
    } else {
      speciesName = headerWithoutItem.trim();
    }

    // Match with local Dex data
    const cleanKey = speciesName.toLowerCase().replace(/[\s_]/g, "-");
    const dexEntry = pokeMap.get(cleanKey);

    const pokemonId = dexEntry ? dexEntry.id : idx + 1;
    const displayName = dexEntry ? dexEntry.name : speciesName;
    const types = dexEntry ? dexEntry.types : ["normal"];
    const sprite =
      dexEntry?.sprite ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

    // Process remaining lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (/^ability:\s*/i.test(line)) {
        ability = line.replace(/^ability:\s*/i, "").trim();
      } else if (/^level:\s*/i.test(line)) {
        level = parseInt(line.replace(/^level:\s*/i, "").trim(), 10) || 100;
      } else if (/^shiny:\s*yes/i.test(line)) {
        shiny = true;
      } else if (/^tera type:\s*/i.test(line)) {
        teraType = line.replace(/^tera type:\s*/i, "").trim();
      } else if (/^evs:\s*/i.test(line)) {
        const evStr = line.replace(/^evs:\s*/i, "");
        const parts = evStr.split("/");
        for (const p of parts) {
          const m = p.trim().match(/^(\d+)\s*(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) {
            const val = Math.min(252, Math.max(0, parseInt(m[1], 10)));
            const statKey = m[2].toLowerCase() as keyof StatSpread;
            evs[statKey] = val;
          }
        }
      } else if (/^ivs:\s*/i.test(line)) {
        const ivStr = line.replace(/^ivs:\s*/i, "");
        const parts = ivStr.split("/");
        for (const p of parts) {
          const m = p.trim().match(/^(\d+)\s*(HP|Atk|Def|SpA|SpD|Spe)$/i);
          if (m) {
            const val = Math.min(31, Math.max(0, parseInt(m[1], 10)));
            const statKey = m[2].toLowerCase() as keyof StatSpread;
            ivs[statKey] = val;
          }
        }
      } else if (/\snature$/i.test(line)) {
        nature = line.replace(/\snature$/i, "").trim();
      } else if (line.startsWith("-")) {
        if (moveIdx < 4) {
          moves[moveIdx] = line.replace(/^-+\s*/, "").trim();
          moveIdx++;
        }
      }
    }

    members.push({
      id: `sm_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
      pokemonId,
      name: displayName,
      speciesName: displayName,
      nickname,
      types,
      item,
      ability: ability || "Standard",
      nature,
      level,
      gender,
      shiny,
      teraType: teraType || (types[0] ? types[0].charAt(0).toUpperCase() + types[0].slice(1) : undefined),
      evs,
      ivs,
      moves,
      sprite,
    });
  }

  if (members.length === 0) {
    errors.push("No valid Pokémon sets could be parsed from the provided text.");
  }

  return { members, errors };
}

/**
 * Formats a team into standard universal Pokémon Showdown export text.
 */
export function exportToShowdownText(team: Team): string {
  const blocks: string[] = [];

  for (const m of team.members) {
    const lines: string[] = [];

    // Header: [Nickname (Species) | Species] [(M/F)] [@ Item]
    let header = m.nickname ? `${m.nickname} (${m.speciesName})` : m.speciesName;
    if (m.gender && m.gender !== "N") {
      header += ` (${m.gender})`;
    }
    if (m.item && m.item.trim()) {
      header += ` @ ${m.item.trim()}`;
    }
    lines.push(header);

    // Ability
    if (m.ability && m.ability.trim()) {
      lines.push(`Ability: ${m.ability.trim()}`);
    }

    // Level
    if (m.level && m.level !== 100) {
      lines.push(`Level: ${m.level}`);
    }

    // Shiny
    if (m.shiny) {
      lines.push(`Shiny: Yes`);
    }

    // Tera Type
    if (m.teraType && m.teraType.trim()) {
      lines.push(`Tera Type: ${m.teraType.trim()}`);
    }

    // EVs
    const evParts: string[] = [];
    if (m.evs.hp > 0) evParts.push(`${m.evs.hp} HP`);
    if (m.evs.atk > 0) evParts.push(`${m.evs.atk} Atk`);
    if (m.evs.def > 0) evParts.push(`${m.evs.def} Def`);
    if (m.evs.spa > 0) evParts.push(`${m.evs.spa} SpA`);
    if (m.evs.spd > 0) evParts.push(`${m.evs.spd} SpD`);
    if (m.evs.spe > 0) evParts.push(`${m.evs.spe} Spe`);
    if (evParts.length > 0) {
      lines.push(`EVs: ${evParts.join(" / ")}`);
    }

    // Nature
    if (m.nature && m.nature.trim()) {
      const capNature = m.nature.charAt(0).toUpperCase() + m.nature.slice(1).toLowerCase();
      lines.push(`${capNature} Nature`);
    }

    // IVs (only output if not 31)
    const ivParts: string[] = [];
    if (m.ivs.hp < 31) ivParts.push(`${m.ivs.hp} HP`);
    if (m.ivs.atk < 31) ivParts.push(`${m.ivs.atk} Atk`);
    if (m.ivs.def < 31) ivParts.push(`${m.ivs.def} Def`);
    if (m.ivs.spa < 31) ivParts.push(`${m.ivs.spa} SpA`);
    if (m.ivs.spd < 31) ivParts.push(`${m.ivs.spd} SpD`);
    if (m.ivs.spe < 31) ivParts.push(`${m.ivs.spe} Spe`);
    if (ivParts.length > 0) {
      lines.push(`IVs: ${ivParts.join(" / ")}`);
    }

    // Moves
    for (const mv of m.moves) {
      if (mv && mv.trim()) {
        lines.push(`- ${mv.trim()}`);
      }
    }

    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n\n");
}
