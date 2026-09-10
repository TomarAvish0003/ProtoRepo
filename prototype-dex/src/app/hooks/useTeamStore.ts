"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Team,
  TeamMember,
  PokemonFormat,
  StatSpread,
} from "@/app/utils/teamBuilder/types";
import { FlatVarietyWithTypes } from "@/app/utils/types";
import { parseShowdownText, exportToShowdownText } from "@/app/utils/teamBuilder/showdownParser";

const STORAGE_KEY = "prototype_dex_saved_teams_v1";

// High-synergy default competitive starter team
const DEFAULT_STARTER_MEMBERS: TeamMember[] = [
  {
    id: "m_garchomp",
    pokemonId: 445,
    name: "garchomp",
    speciesName: "Garchomp",
    types: ["dragon", "ground"],
    item: "Life Orb",
    ability: "Rough Skin",
    nature: "jolly",
    level: 100,
    gender: "M",
    teraType: "Steel",
    evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Earthquake", "Swords Dance", "Scale Shot", "Iron Head"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png",
  },
  {
    id: "m_rotom_wash",
    pokemonId: 479,
    name: "rotom-wash",
    speciesName: "Rotom-Wash",
    types: ["electric", "water"],
    item: "Leftovers",
    ability: "Levitate",
    nature: "bold",
    level: 100,
    gender: "N",
    teraType: "Steel",
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Hydro Pump", "Volt Switch", "Will-O-Wisp", "Protect"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png",
  },
  {
    id: "m_scizor",
    pokemonId: 212,
    name: "scizor",
    speciesName: "Scizor",
    types: ["bug", "steel"],
    item: "Choice Band",
    ability: "Technician",
    nature: "adamant",
    level: 100,
    gender: "M",
    teraType: "Steel",
    evs: { hp: 236, atk: 252, def: 0, spa: 0, spd: 20, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Bullet Punch", "U-turn", "Close Combat", "Quick Attack"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
  },
  {
    id: "m_great_tusk",
    pokemonId: 984,
    name: "great-tusk",
    speciesName: "Great Tusk",
    types: ["ground", "fighting"],
    item: "Booster Energy",
    ability: "Protosynthesis",
    nature: "jolly",
    level: 100,
    gender: "N",
    teraType: "Ice",
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Headlong Rush", "Close Combat", "Rapid Spin", "Knock Off"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/984.png",
  },
  {
    id: "m_kingambit",
    pokemonId: 983,
    name: "kingambit",
    speciesName: "Kingambit",
    types: ["dark", "steel"],
    item: "Leftovers",
    ability: "Supreme Overlord",
    nature: "adamant",
    level: 100,
    gender: "M",
    teraType: "Flying",
    evs: { hp: 212, atk: 252, def: 0, spa: 0, spd: 0, spe: 44 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/983.png",
  },
  {
    id: "m_iron_valiant",
    pokemonId: 1006,
    name: "iron-valiant",
    speciesName: "Iron Valiant",
    types: ["fairy", "fighting"],
    item: "Choice Specs",
    ability: "Quark Drive",
    nature: "timid",
    level: 100,
    gender: "N",
    teraType: "Fairy",
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["Moonblast", "Close Combat", "Shadow Ball", "Thunderbolt"],
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1006.png",
  },
];

const DEFAULT_STARTER_TEAM: Team = {
  id: "team_starter_ou",
  name: "OU Competitive Core (Alpha)",
  format: "gen9ou",
  members: DEFAULT_STARTER_MEMBERS,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Strict EV capping helper: ensures individual <= 252 and sum <= 510.
 */
export function clampEV(
  currentEVs: StatSpread,
  stat: keyof StatSpread,
  requestedValue: number
): StatSpread {
  const clampedTarget = Math.max(0, Math.min(252, requestedValue));
  const otherSum = Object.entries(currentEVs)
    .filter(([k]) => k !== stat)
    .reduce((sum, [, v]) => sum + (v || 0), 0);

  const maxAllowedForStat = Math.min(252, 510 - otherSum);
  const finalVal = Math.max(0, Math.min(clampedTarget, maxAllowedForStat));

  return {
    ...currentEVs,
    [stat]: finalVal,
  };
}

export function useTeamStore() {
  const [teams, setTeams] = useState<Team[]>([DEFAULT_STARTER_TEAM]);
  const [activeTeamId, setActiveTeamId] = useState<string>(DEFAULT_STARTER_TEAM.id);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    DEFAULT_STARTER_MEMBERS[0].id
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeams(parsed);
          setActiveTeamId(parsed[0].id);
          if (parsed[0].members?.[0]) {
            setSelectedMemberId(parsed[0].members[0].id);
          }
        }
      }
    } catch {
      // Fall back to default team on error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch {
      // Storage quota exceeded or disabled
    }
  }, [teams, isLoaded]);

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0] || DEFAULT_STARTER_TEAM;
  const selectedMember =
    activeTeam.members.find((m) => m.id === selectedMemberId) || activeTeam.members[0] || null;

  // Create new empty team
  const createTeam = useCallback((name?: string, format: PokemonFormat = "gen9ou") => {
    const newTeam: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name || `New Squad #${teams.length + 1}`,
      format,
      members: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTeams((prev) => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
    setSelectedMemberId(null);
    return newTeam;
  }, [teams.length]);

  // Rename team
  const renameTeam = useCallback((teamId: string, newName: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, name: newName, updatedAt: Date.now() } : t
      )
    );
  }, []);

  // Set format
  const setTeamFormat = useCallback((teamId: string, format: PokemonFormat) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, format, updatedAt: Date.now() } : t
      )
    );
  }, []);

  // Duplicate team
  const duplicateTeam = useCallback((teamId: string) => {
    const source = teams.find((t) => t.id === teamId);
    if (!source) return;
    const cloned: Team = {
      ...source,
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${source.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      members: source.members.map((m) => ({
        ...m,
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      })),
    };
    setTeams((prev) => [...prev, cloned]);
    setActiveTeamId(cloned.id);
  }, [teams]);

  // Delete team
  const deleteTeam = useCallback((teamId: string) => {
    setTeams((prev) => {
      const remaining = prev.filter((t) => t.id !== teamId);
      if (remaining.length === 0) {
        return [DEFAULT_STARTER_TEAM];
      }
      return remaining;
    });
    setActiveTeamId((prev) => {
      if (prev === teamId) {
        const remaining = teams.filter((t) => t.id !== teamId);
        return remaining[0]?.id || DEFAULT_STARTER_TEAM.id;
      }
      return prev;
    });
  }, [teams]);

  // Add member to active team
  const addMember = useCallback(
    (teamId: string, dexEntry: FlatVarietyWithTypes) => {
      let createdMember: TeamMember | null = null;
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== teamId || t.members.length >= 6) return t;

          const defaultTera = dexEntry.types?.[0]
            ? dexEntry.types[0].charAt(0).toUpperCase() + dexEntry.types[0].slice(1)
            : "Normal";

          createdMember = {
            id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            pokemonId: dexEntry.id,
            name: dexEntry.name,
            speciesName: dexEntry.name.charAt(0).toUpperCase() + dexEntry.name.slice(1),
            types: dexEntry.types || ["normal"],
            item: "Leftovers",
            ability: "Standard",
            nature: "adamant",
            level: t.format === "gen9vgc" ? 50 : 100,
            gender: "M",
            teraType: defaultTera,
            evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            moves: ["", "", "", ""],
            sprite: dexEntry.sprite,
          };

          return {
            ...t,
            members: [...t.members, createdMember],
            updatedAt: Date.now(),
          };
        })
      );
      if (createdMember) {
        setSelectedMemberId((createdMember as TeamMember).id);
      }
      return createdMember;
    },
    []
  );

  // Update member
  const updateMember = useCallback(
    (teamId: string, memberId: string, updater: (m: TeamMember) => TeamMember) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== teamId) return t;
          return {
            ...t,
            members: t.members.map((m) => (m.id === memberId ? updater(m) : m)),
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  // Remove member
  const removeMember = useCallback((teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const newMembers = t.members.filter((m) => m.id !== memberId);
        return {
          ...t,
          members: newMembers,
          updatedAt: Date.now(),
        };
      })
    );
    setSelectedMemberId((prev) => (prev === memberId ? null : prev));
  }, []);

  // Swap member slots
  const swapMembers = useCallback((teamId: string, idx1: number, idx2: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        if (idx1 < 0 || idx2 < 0 || idx1 >= t.members.length || idx2 >= t.members.length) return t;
        const newMembers = [...t.members];
        const temp = newMembers[idx1];
        newMembers[idx1] = newMembers[idx2];
        newMembers[idx2] = temp;
        return {
          ...t,
          members: newMembers,
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  // Import Showdown text
  const importShowdown = useCallback(
    (teamId: string, text: string, pokedexData: FlatVarietyWithTypes[]) => {
      const { members: parsedMembers, errors } = parseShowdownText(text, pokedexData);
      if (parsedMembers.length > 0) {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamId
              ? {
                  ...t,
                  members: parsedMembers,
                  updatedAt: Date.now(),
                }
              : t
          )
        );
        if (parsedMembers[0]) {
          setSelectedMemberId(parsedMembers[0].id);
        }
        return { success: true, errors };
      }
      return { success: false, errors };
    },
    []
  );

  // Export Showdown text
  const exportShowdown = useCallback(
    (teamId: string) => {
      const targetTeam = teams.find((t) => t.id === teamId) || activeTeam;
      return exportToShowdownText(targetTeam);
    },
    [teams, activeTeam]
  );

  return {
    teams,
    activeTeamId,
    activeTeam,
    selectedMemberId,
    selectedMember,
    isLoaded,
    setActiveTeamId,
    setSelectedMemberId,
    createTeam,
    renameTeam,
    setTeamFormat,
    duplicateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
    swapMembers,
    importShowdown,
    exportShowdown,
  };
}
