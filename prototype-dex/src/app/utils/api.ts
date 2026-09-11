import { 
  Pokemon, 
  EvolutionStage, 
  PokedexListResponse, 
  EncounterLocationArea,
  FlatVarietyWithTypes,
  UserProfile,
  Move,
  RawTypeApiResponse
} from "@/app/utils/types";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MAX_RETRIES = 3;
const MAX_RETRY_DELAY = 30000;

export const AUTH_TOKEN_KEY = 'protodex_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

export function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const activeToken = token || getStoredToken();
  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
    headers['x-auth-token'] = activeToken;
  }
  return headers;
}

const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();
const MEMORY_CACHE_TTL = 1000 * 60 * 60 * 24;

async function fetcher<T>(
  endpoint: string,
  options?: RequestInit,
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  const isGet = !options?.method || options.method.toUpperCase() === "GET";
  const isStaticResource = endpoint.startsWith("/api/pokemon");

  if (isGet && isStaticResource) {
    const cached = memoryCache.get(endpoint);
    if (cached && cached.expiresAt > Date.now()) {
      return { data: cached.data as T, error: null };
    }
  }

  let attempt = 0;
  const isServer = typeof window === "undefined";
  const mergedOptions: RequestInit = {
    credentials: "include",
    ...(isServer && isGet && isStaticResource ? { next: { revalidate: 86400 } } : {}),
    ...options,
  };
  while (attempt <= retries) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, mergedOptions);

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }

      if (!res.ok) {
        // If server returns 401 Unauthorized, automatically clear any stale token
        if (res.status === 401 && getStoredToken()) {
          setStoredToken(null);
        }
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err?.error || err?.message || `Error ${res.status}` };
      }

      const data = await res.json();
      if (isGet && isStaticResource && data) {
        memoryCache.set(endpoint, { data, expiresAt: Date.now() + MEMORY_CACHE_TTL });
      }
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

export async function loginUser(email: string, password: string) {
  const res = await fetcher<{ token: string; user: UserProfile }>("/api/auth/login", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (res.data?.token) {
    setStoredToken(res.data.token);
  }
  return res;
}

export async function logoutUser(token?: string) {
  const activeToken = token || getStoredToken();
  const res = await fetcher<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: authHeaders(activeToken || undefined),
  });
  setStoredToken(null);
  return res;
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetcher<{ token: string; user: UserProfile }>(
    "/api/auth/register",
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ username, email, password }),
    }
  );
  if (res.data?.token) {
    setStoredToken(res.data.token);
  }
  return res;
}

export async function getMe(token?: string): Promise<ApiResponse<{ user: UserProfile }>> {
  const activeToken = token || getStoredToken();

  // Primary: Use /api/user/profile (supported on current Render build and local backend)
  const profileRes = await fetcher<UserProfile>("/api/user/profile", {
    headers: authHeaders(activeToken || undefined),
  });

  if (profileRes.data) {
    return { data: { user: profileRes.data }, error: null };
  }

  // Fallback: If /api/user/profile fails or is unconfigured, try /api/auth/me
  const meRes = await fetcher<{ user: UserProfile }>("/api/auth/me", {
    headers: authHeaders(activeToken || undefined),
  });

  return meRes;
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

export async function getPokemonEncounters(nameOrId: string) {
  return fetcher<EncounterLocationArea[]>(`/api/pokemon/${nameOrId}/encounters`);
}

function getIdFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts.pop());
}
function parseEvolutionNode(node: EvolutionChainNode): EvolutionStage {
  const id = getIdFromUrl(node.species.url);
  return {
    name: node.species.name,
    id,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    evolution_details: node.evolution_details || [],
    evolves_to: (node.evolves_to || []).map(parseEvolutionNode),
  };
}

function flattenChain(node: EvolutionChainNode): EvolutionStage[] {
  const id = getIdFromUrl(node.species.url);
  const stage: EvolutionStage = {
    name: node.species.name,
    id,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    evolution_details: node.evolution_details || [],
  };
  const nextStages = (node.evolves_to || []).flatMap(nextNode => flattenChain(nextNode));
  return [stage, ...nextStages];
}

export interface EvolutionChainData {
  tree: EvolutionStage;
  stages: EvolutionStage[];
}

export async function getEvolutionChainForPokemon(
  nameOrId: string,
  knownChainUrl?: string
): Promise<ApiResponse<EvolutionChainData>> {
  try {
    let evolutionChainUrl = knownChainUrl;
    if (!evolutionChainUrl) {
      const speciesResponse = await getPokemonSpecies(nameOrId);
      if (speciesResponse.error || !speciesResponse.data) {
        return { data: null, error: speciesResponse.error || "Species not found" };
      }
      evolutionChainUrl = (speciesResponse.data as RawSpeciesData).evolution_chain?.url;
    }
    
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
    
    return {
      data: {
        tree: parseEvolutionNode(rawChain),
        stages: flattenChain(rawChain),
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to fetch evolution chain",
    };
  }
}

export async function getPokemonSpecies(nameOrId: string) {
  return fetcher(`/api/pokemon/species/${nameOrId}`);
}
export async function getPokemonEvolutionChainById(id: string | number) {
  return fetcher(`/api/pokemon/evolution-chain/${id}`);
}
export async function getPokemonType(nameOrId: string): Promise<ApiResponse<RawTypeApiResponse>> {
  return fetcher<RawTypeApiResponse>(`/api/pokemon/type/${nameOrId}`);
}
export async function getPokemonAbility(nameOrId: string) {
  return fetcher(`/api/pokemon/ability/${nameOrId}`);
}
export async function getPokemonMove(nameOrId: string) {
  return fetcher(`/api/pokemon/move/${nameOrId}`);
}

/** Batch query move learnset data from the database */
export async function getMovesBatch(names: string[]) {
  return fetcher<{ moves: Move[] }>("/api/pokemon/moves/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });
}

export default fetcher;
