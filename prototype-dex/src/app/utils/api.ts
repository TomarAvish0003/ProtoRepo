import { 
  Pokemon, 
  EvolutionStage, 
  PokedexListResponse, 
  EncounterLocationArea,
  FlatVarietyWithTypes,
  UserProfile,
  Move // Import the Move type
} from "@/app/utils/types";

// --- Generic API Response Type ---
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// --- Specific Raw API Response Types ---
interface RawSpeciesData {
  evolution_chain?: {
    url: string;
  };
}

interface EvolutionChainNode {
  species: { name: string; url: string };
  evolution_details: EvolutionStage["evolution_details"];
  evolves_to: EvolutionChainNode[];
}

interface RawEvolutionChainData {
  chain: EvolutionChainNode;
}

// --- API Constants ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MAX_RETRIES = 3;
const MAX_RETRY_DELAY = 30000;

// --- Headers ---
function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// --- Core Fetcher ---
async function fetcher<T>(
  endpoint: string,
  options?: RequestInit,
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  let attempt = 0;
  const mergedOptions: RequestInit = {
    credentials: "include",
    ...options,
  };
  while (attempt <= retries) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, mergedOptions);

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        // FIX: Use the MAX_RETRY_DELAY constant
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err?.error || err?.message || `Error ${res.status}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (e) {
      if (++attempt > retries) {
        return {
          data: null,
          error: e instanceof Error ? e.message : "Unknown error",
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  return {
    data: null,
    error: `Failed after ${retries} attempts.`,
  };
}

// --- AUTH / USER ---
export async function loginUser(email: string, password: string) {
  return fetcher<{ token: string; user: UserProfile }>("/api/auth/login", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutUser(token?: string) {
  return fetcher<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function registerUser(username: string, email: string, password: string) {
  return fetcher<{ token: string; user: UserProfile }>(
    "/api/auth/register",
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ username, email, password }),
    }
  );
}

export async function getMe() {
  return fetcher<{ user: UserProfile }>("/api/auth/me");
}

export async function getProfile(token?: string) {
  return fetcher<UserProfile>("/api/user/profile", {
    headers: authHeaders(token),
  });
}

export async function updateProfile(
  updates: { email?: string; password?: string; username?: string; avatar?: string },
  token?: string
) {
  return fetcher<UserProfile>("/api/user/profile", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
}

export async function deleteAccountApi(token?: string) {
  return fetcher<{ message: string }>("/api/user/profile", {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// --- FAVORITES & CAUGHT ---
export async function getFavorites(token?: string) {
  return fetcher<string[]>("/api/user/favorite", { headers: authHeaders(token) });
}

export async function toggleFavoriteApi(pokemon: string) {
  return fetcher<{ action: 'added' | 'removed'; pokemon: string; favorites: string[] }>(
    "/api/user/favorite",
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ pokemon }),
    }
  );
}

export async function addFavorite(token?: string, pokemon?: string) {
  const target = pokemon || token || "";
  return fetcher<{ favorites: string[] }>("/api/user/favorite", {
    method: "POST",
    headers: authHeaders(typeof token === 'string' && pokemon ? token : undefined),
    body: JSON.stringify({ pokemon: target }),
  });
}

export async function removeFavorite(token?: string, pokemon?: string) {
  const target = pokemon || token || "";
  return fetcher<string[]>(`/api/user/favorite/${target}`, {
    method: "DELETE",
    headers: authHeaders(typeof token === 'string' && pokemon ? token : undefined),
  });
}

export async function getCaught(token?: string) {
  return fetcher<string[]>("/api/user/caught", { headers: authHeaders(token) });
}

export async function toggleCaughtApi(pokemon: string) {
  return fetcher<{ action: 'added' | 'removed'; pokemon: string; caught: string[] }>(
    "/api/user/caught",
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ pokemon }),
    }
  );
}

export async function addCaught(token?: string, pokemon?: string) {
  const target = pokemon || token || "";
  return fetcher<{ caught: string[] }>("/api/user/caught", {
    method: "POST",
    headers: authHeaders(typeof token === 'string' && pokemon ? token : undefined),
    body: JSON.stringify({ pokemon: target }),
  });
}

export async function removeCaught(token?: string, pokemon?: string) {
  const target = pokemon || token || "";
  return fetcher<string[]>(`/api/user/caught/${target}`, {
    method: "DELETE",
    headers: authHeaders(typeof token === 'string' && pokemon ? token : undefined),
  });
}

export async function syncGuestData(favorites: string[], caught: string[]) {
  return fetcher<{
    message: string;
    syncedFavoritesCount: number;
    syncedCaughtCount: number;
    favorites: string[];
    caught: string[];
  }>("/api/user/sync", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ favorites, caught }),
  });
}

// --- POKÉMON ---
export async function getPokemon(nameOrId: string) {
  return fetcher<Pokemon>(`/api/pokemon/${nameOrId}`);
}

export async function getPokedexList(
  limit: number,
  offset: number,
  search?: string,
  types?: string[]
): Promise<ApiResponse<PokedexListResponse>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (search) {
    params.append("search", search);
  }
  if (types && types.length > 0) {
    params.append("types", types.join(','));
  }
  return fetcher<PokedexListResponse>(`/api/pokemon?${params.toString()}`);
}

export async function getAllPokemonTypes() {
  return fetcher<string[]>("/api/pokemon/types");
}

export async function getPokemonByGeneration(genId: number): Promise<ApiResponse<FlatVarietyWithTypes[]>> {
  return fetcher<FlatVarietyWithTypes[]>(`/api/pokemon/generation/${genId}`);
}

// --- ENCOUNTERS ---
export async function getPokemonEncounters(nameOrId: string) {
  return fetcher<EncounterLocationArea[]>(`/api/pokemon/${nameOrId}/encounters`);
}

// --- EVOLUTION ---
function getIdFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts.pop());
}
function flattenChain(node: EvolutionChainNode): EvolutionStage[] {
  const id = getIdFromUrl(node.species.url);
  const stage: EvolutionStage = {
    name: node.species.name,
    id,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    evolution_details: node.evolution_details,
  };
  const nextStages = node.evolves_to.flatMap(nextNode => flattenChain(nextNode));
  return [stage, ...nextStages];
}

export async function getEvolutionChainForPokemon(nameOrId: string) {
  try {
    const speciesResponse = await getPokemonSpecies(nameOrId);
    if (speciesResponse.error || !speciesResponse.data) {
      return { data: null, error: speciesResponse.error || "Species not found" };
    }
    
    const evolutionChainUrl = (speciesResponse.data as RawSpeciesData).evolution_chain?.url;
    if (!evolutionChainUrl) {
      return { data: null, error: "Evolution chain URL not found" };
    }

    const chainId = getIdFromUrl(evolutionChainUrl);
    const evolutionChainResponse = await getPokemonEvolutionChainById(chainId);
    if (evolutionChainResponse.error || !evolutionChainResponse.data) {
        return { data: null, error: evolutionChainResponse.error || "Evolution chain not found" };
    }

    const rawChain = (evolutionChainResponse.data as RawEvolutionChainData).chain;
    if (!rawChain) {
        return { data: null, error: "Invalid evolution chain structure in API response" };
    }
    
    return { data: flattenChain(rawChain), error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to fetch evolution chain",
    };
  }
}

// --- ADVANCED ENDPOINTS ---
export async function getPokemonSpecies(nameOrId: string) {
  return fetcher(`/api/pokemon/species/${nameOrId}`);
}
export async function getPokemonEvolutionChainById(id: string | number) {
  return fetcher(`/api/pokemon/evolution-chain/${id}`);
}
export async function getPokemonType(nameOrId: string) {
  return fetcher(`/api/pokemon/type/${nameOrId}`);
}
export async function getPokemonAbility(nameOrId: string) {
  return fetcher(`/api/pokemon/ability/${nameOrId}`);
}
export async function getPokemonMove(nameOrId: string) {
  return fetcher(`/api/pokemon/move/${nameOrId}`);
}

// FIX: Use the specific Move type instead of 'any' for better type safety
export async function getMovesBatch(names: string[]) {
  return fetcher<{ moves: Move[] }>("/api/pokemon/moves/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });
}

export default fetcher;
