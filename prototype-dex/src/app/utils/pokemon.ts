// utils/pokemon.ts
export interface PokemonCard {
  name: string;
  id: number;
  sprite: string;
  types: string[];
}

// Fisher-Yates shuffle algorithm for randomization
export function shufflePokemon(array: PokemonCard[]): PokemonCard[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
