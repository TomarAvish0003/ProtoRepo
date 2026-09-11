export interface TypeConfig {
  label: string;
  kanji: string;
  fullBadge: string;
  bgClass: string;
  textClass: string;
  colorHex: string;
  softBg: string;
  borderHex: string;
}

export const TYPE_CONFIGS: Record<string, TypeConfig> = {
  normal: {
    label: "Normal",
    kanji: "無",
    fullBadge: "Normal // 無",
    bgClass: "bg-[#A8A77A]",
    textClass: "text-white",
    colorHex: "#A8A77A",
    softBg: "rgba(168, 167, 122, 0.12)",
    borderHex: "rgba(168, 167, 122, 0.35)",
  },
  fire: {
    label: "Fire",
    kanji: "炎",
    fullBadge: "Fire // 炎",
    bgClass: "bg-[#EE8130]",
    textClass: "text-white",
    colorHex: "#EE8130",
    softBg: "rgba(238, 129, 48, 0.14)",
    borderHex: "rgba(238, 129, 48, 0.35)",
  },
  water: {
    label: "Water",
    kanji: "水",
    fullBadge: "Water // 水",
    bgClass: "bg-[#6390F0]",
    textClass: "text-white",
    colorHex: "#6390F0",
    softBg: "rgba(99, 144, 240, 0.14)",
    borderHex: "rgba(99, 144, 240, 0.35)",
  },
  electric: {
    label: "Electric",
    kanji: "雷",
    fullBadge: "Electric // 雷",
    bgClass: "bg-[#F7D02C]",
    textClass: "text-[#1A1A1A]",
    colorHex: "#F7D02C",
    softBg: "rgba(247, 208, 44, 0.18)",
    borderHex: "rgba(247, 208, 44, 0.4)",
  },
  grass: {
    label: "Grass",
    kanji: "草",
    fullBadge: "Grass // 草",
    bgClass: "bg-[#7AC74C]",
    textClass: "text-white",
    colorHex: "#7AC74C",
    softBg: "rgba(122, 199, 76, 0.14)",
    borderHex: "rgba(122, 199, 76, 0.35)",
  },
  ice: {
    label: "Ice",
    kanji: "氷",
    fullBadge: "Ice // 氷",
    bgClass: "bg-[#96D9D6]",
    textClass: "text-[#1A1A1A]",
    colorHex: "#96D9D6",
    softBg: "rgba(150, 217, 214, 0.18)",
    borderHex: "rgba(150, 217, 214, 0.4)",
  },
  fighting: {
    label: "Fighting",
    kanji: "闘",
    fullBadge: "Fighting // 闘",
    bgClass: "bg-[#C22E28]",
    textClass: "text-white",
    colorHex: "#C22E28",
    softBg: "rgba(194, 46, 40, 0.13)",
    borderHex: "rgba(194, 46, 40, 0.35)",
  },
  poison: {
    label: "Poison",
    kanji: "毒",
    fullBadge: "Poison // 毒",
    bgClass: "bg-[#A33EA1]",
    textClass: "text-white",
    colorHex: "#A33EA1",
    softBg: "rgba(163, 62, 161, 0.13)",
    borderHex: "rgba(163, 62, 161, 0.35)",
  },
  ground: {
    label: "Ground",
    kanji: "地",
    fullBadge: "Ground // 地",
    bgClass: "bg-[#E2BF65]",
    textClass: "text-[#1A1A1A]",
    colorHex: "#E2BF65",
    softBg: "rgba(226, 191, 101, 0.16)",
    borderHex: "rgba(226, 191, 101, 0.38)",
  },
  flying: {
    label: "Flying",
    kanji: "飛",
    fullBadge: "Flying // 飛",
    bgClass: "bg-[#A98FF3]",
    textClass: "text-white",
    colorHex: "#A98FF3",
    softBg: "rgba(169, 143, 243, 0.14)",
    borderHex: "rgba(169, 143, 243, 0.35)",
  },
  psychic: {
    label: "Psychic",
    kanji: "超",
    fullBadge: "Psychic // 超",
    bgClass: "bg-[#F95587]",
    textClass: "text-white",
    colorHex: "#F95587",
    softBg: "rgba(249, 85, 135, 0.14)",
    borderHex: "rgba(249, 85, 135, 0.35)",
  },
  bug: {
    label: "Bug",
    kanji: "虫",
    fullBadge: "Bug // 虫",
    bgClass: "bg-[#A6B91A]",
    textClass: "text-white",
    colorHex: "#A6B91A",
    softBg: "rgba(166, 185, 26, 0.14)",
    borderHex: "rgba(166, 185, 26, 0.35)",
  },
  rock: {
    label: "Rock",
    kanji: "岩",
    fullBadge: "Rock // 岩",
    bgClass: "bg-[#B6A136]",
    textClass: "text-white",
    colorHex: "#B6A136",
    softBg: "rgba(182, 161, 54, 0.15)",
    borderHex: "rgba(182, 161, 54, 0.35)",
  },
  ghost: {
    label: "Ghost",
    kanji: "霊",
    fullBadge: "Ghost // 霊",
    bgClass: "bg-[#735797]",
    textClass: "text-white",
    colorHex: "#735797",
    softBg: "rgba(115, 87, 151, 0.14)",
    borderHex: "rgba(115, 87, 151, 0.35)",
  },
  dragon: {
    label: "Dragon",
    kanji: "竜",
    fullBadge: "Dragon // 竜",
    bgClass: "bg-[#6F35FC]",
    textClass: "text-white",
    colorHex: "#6F35FC",
    softBg: "rgba(111, 53, 252, 0.14)",
    borderHex: "rgba(111, 53, 252, 0.35)",
  },
  steel: {
    label: "Steel",
    kanji: "鋼",
    fullBadge: "Steel // 鋼",
    bgClass: "bg-[#B7B7CE]",
    textClass: "text-[#1A1A1A]",
    colorHex: "#B7B7CE",
    softBg: "rgba(183, 183, 206, 0.18)",
    borderHex: "rgba(183, 183, 206, 0.4)",
  },
  dark: {
    label: "Dark",
    kanji: "悪",
    fullBadge: "Dark // 悪",
    bgClass: "bg-[#705746]",
    textClass: "text-white",
    colorHex: "#705746",
    softBg: "rgba(112, 87, 70, 0.14)",
    borderHex: "rgba(112, 87, 70, 0.35)",
  },
  fairy: {
    label: "Fairy",
    kanji: "妖",
    fullBadge: "Fairy // 妖",
    bgClass: "bg-[#D685AD]",
    textClass: "text-white",
    colorHex: "#D685AD",
    softBg: "rgba(214, 133, 173, 0.14)",
    borderHex: "rgba(214, 133, 173, 0.35)",
  },
};

export const JAPANESE_POKEMON_NAMES: Record<number, string> = {
  1: "フシギダネ",
  2: "フシギソウ",
  3: "フシギバナ",
  4: "ヒトカゲ",
  5: "リザード",
  6: "リザードン",
  7: "ゼニガメ",
  8: "カメール",
  9: "カメックス",
  10: "キャタピー",
  11: "トランセル",
  12: "バタフリー",
  13: "ビードル",
  14: "コクーン",
  15: "スピアー",
  16: "ポッポ",
  17: "ピジョン",
  18: "ピジョット",
  19: "コラッタ",
  20: "ラッタ",
  25: "ピカチュウ",
  26: "ライチュウ",
  37: "ロコン",
  38: "キュウコン",
  39: "プリン",
  40: "プクリン",
  52: "ニャース",
  54: "コダック",
  59: "ウインディ",
  65: "フーディン",
  68: "カイリキー",
  94: "ゲンガー",
  129: "コイキング",
  130: "ギャラドス",
  131: "ラプラス",
  132: "メタモン",
  133: "イーブイ",
  134: "シャワーズ",
  135: "サンダース",
  136: "ブースター",
  143: "カビゴン",
  144: "フリーザー",
  145: "サンダー",
  146: "ファイヤー",
  149: "カイリュー",
  150: "ミュウツー",
  151: "ミュウ",
  196: "エーフィ",
  197: "ブラッキー",
  249: "ルギア",
  250: "ホウオウ",
  251: "セレビィ",
  257: "バシャーモ",
  282: "サーナイト",
  384: "レックウザ",
  385: "ジラーチ",
  386: "デオキシス",
  448: "ルカリオ",
  470: "リーフィア",
  471: "グレイシア",
  483: "ディアルガ",
  484: "パルキア",
  487: "ギラティナ",
  493: "アルセウス",
  658: "ゲッコウガ",
  700: "ニンフィア",
  937: "ソウブレイズ",
  1007: "コライドン",
  1008: "ミライドン",
};

export function getJapaneseName(id: number, englishName: string): string {
  if (JAPANESE_POKEMON_NAMES[id]) {
    return JAPANESE_POKEMON_NAMES[id];
  }
  return englishName.toUpperCase();
}

export const ICONIC_JAPANESE_MONIKERS: Record<number, string> = {
  448: "波導の勇者",   // Lucario
  133: "無限の可能性", // Eevee
  25: "電撃の勇者",    // Pikachu
  6: "紅蓮の覇者",     // Charizard
  9: "激流の砲撃",     // Blastoise
  3: "大樹の生命",     // Venusaur
  150: "最強の遺伝子", // Mewtwo
  151: "命の源流",     // Mew
  94: "闇影の支配者",  // Gengar
  149: "大海の守護竜", // Dragonite
  248: "鎧殻の暴君",   // Tyranitar
  249: "深海の海神",   // Lugia
  250: "天空の鳳凰",   // Ho-Oh
  282: "純白の守護霊", // Gardevoir
  382: "大海の創造主", // Kyogre
  383: "大地の創造主", // Groudon
  384: "天空の覇者",   // Rayquaza
  445: "砂漠の音速竜", // Garchomp
  483: "時間の神話",   // Dialga
  484: "空間の神話",   // Palkia
  487: "反骨の暗黒神", // Giratina
  493: "創世の神性",   // Arceus
  658: "忍法の達人",   // Greninja
  700: "絆の妖精",     // Sylveon
  778: "化けの皮",     // Mimikyu
  887: "超音速の幽霊", // Dragapult
  1007: "古代の翼",    // Koraidon
  1008: "未来の鉄機",  // Miraidon
};

const TYPE_MONIKER_FALLBACK: Record<string, string> = {
  fire: "火炎の闘志",
  water: "波濤の息吹",
  grass: "新緑の息吹",
  electric: "迅雷の閃光",
  psychic: "超念の覚醒",
  ice: "氷雪の結晶",
  dragon: "竜の咆哮",
  dark: "暗黒の深淵",
  ghost: "幽冥の幻影",
  steel: "剛鉄の意志",
  fairy: "妖精の祈り",
  fighting: "武道の精神",
  poison: "劇毒の領域",
  ground: "大地の鼓動",
  rock: "岩石の要塞",
  bug: "天命の翅音",
  flying: "疾風の飛翔",
  normal: "原初の胎動",
};

export function getJapaneseMoniker(id: number, name: string, types: string[] = []): string {
  if (ICONIC_JAPANESE_MONIKERS[id]) {
    return ICONIC_JAPANESE_MONIKERS[id];
  }
  const primaryType = types[0]?.toLowerCase() || "normal";
  return TYPE_MONIKER_FALLBACK[primaryType] || "原初の胎動";
}

export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

export function formatArchivalIndex(id: number, region = "NAT"): string {
  return `DEX.${region}.${String(id).padStart(4, "0")}`;
}

export function getOfficialArtwork(id: number, fallback?: string | null): string {
  if (id > 0) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
  return fallback || "/detective-pikachu.jpg";
}

export function getShinyArtwork(id: number, fallback?: string | null): string {
  if (id > 0) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
  }
  return fallback || "/detective-pikachu.jpg";
}

export function getPokemonCryUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
}

export interface RegionGateway {
  name: string;
  japanese: string;
  generation: string;
  genNumber: number;
  range: string;
  speciesCount: number;
  highlightPokemon: string;
  description: string;
}

export const REGIONAL_GATEWAYS: RegionGateway[] = [
  { name: "Kanto", japanese: "カントー地方", generation: "GEN I", genNumber: 1, range: "#0001 – #0151", speciesCount: 151, highlightPokemon: "Mewtwo", description: "Original temperate oceanic bioregion." },
  { name: "Johto", japanese: "ジョウト地方", generation: "GEN II", genNumber: 2, range: "#0152 – #0251", speciesCount: 100, highlightPokemon: "Lugia", description: "Historic shrine forests and ancient belltowers." },
  { name: "Hoenn", japanese: "ホウエン地方", generation: "GEN III", genNumber: 3, range: "#0252 – #0386", speciesCount: 135, highlightPokemon: "Rayquaza", description: "Subtropical archipelago and vulcanology preserve." },
  { name: "Sinnoh", japanese: "シンオウ地方", generation: "GEN IV", genNumber: 4, range: "#0387 – #0493", speciesCount: 107, highlightPokemon: "Lucario", description: "Subarctic mountain range and creation mythology." },
  { name: "Unova", japanese: "イッシュ地方", generation: "GEN V", genNumber: 5, range: "#0494 – #0649", speciesCount: 156, highlightPokemon: "Reshiram", description: "Continental diversity and modernized cityscapes." },
  { name: "Kalos", japanese: "カロス地方", generation: "GEN VI", genNumber: 6, range: "#0650 – #0721", speciesCount: 72, highlightPokemon: "Greninja", description: "Continental European fauna and mega evolution hub." },
  { name: "Alola", japanese: "アローラ地方", generation: "GEN VII", genNumber: 7, range: "#0722 – #0809", speciesCount: 88, highlightPokemon: "Decidueye", description: "Isolated tropical volcanic archipelagos." },
  { name: "Galar", japanese: "ガラル地方", generation: "GEN VIII", genNumber: 8, range: "#0810 – #0905", speciesCount: 96, highlightPokemon: "Zacian", description: "Industrial pastoral lands and Dynamax geoglyphs." },
  { name: "Paldea", japanese: "パルデア地方", generation: "GEN IX", genNumber: 9, range: "#0906 – #1025", speciesCount: 120, highlightPokemon: "Miraidon", description: "Iberian expansive wilderness and Terastral craters." },
];

export interface PokemonLore {
  redBlue: string;
  crystal: string;
  scarlet: string;
  habitat: string;
  rarity: string;
  surveyYear: number;
  leadSurveyor: string;
}

export const DEFAULT_POKEMON_LORE: Record<number, PokemonLore> = {
  1: {
    redBlue: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
    crystal: "While it is young, it uses the nutrients that are stored in the seeds on its back in order to grow.",
    scarlet: "For some time after its birth, it grows by gaining nourishment from the seed on its back.",
    habitat: "Grassland / Rare Forest Clearings",
    rarity: "Common / Protected Pokemon",
    surveyYear: 1996,
    leadSurveyor: "Prof. Samuel Oak",
  },
  4: {
    redBlue: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
    crystal: "If it's healthy, the flame on the tip of its tail will burn vigorously, even if it gets a little wet.",
    scarlet: "From the time it is born, a flame burns at the tip of its tail. Its life would end if the flame were to go out.",
    habitat: "Mountain Crags / Volcanic Foothills",
    rarity: "Protected Starter Line",
    surveyYear: 1996,
    leadSurveyor: "Prof. Samuel Oak",
  },
  7: {
    redBlue: "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.",
    crystal: "When it feels threatened, it draws its limbs inside its shell and sprays water from its mouth.",
    scarlet: "It shelters on its shell, then strikes back with spouts of water at every opportunity.",
    habitat: "Freshwater Estuaries / Coastal Ponds",
    rarity: "Protected Starter Line",
    surveyYear: 1996,
    leadSurveyor: "Prof. Samuel Oak",
  },
  25: {
    redBlue: "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
    crystal: "When it is angered, it immediately discharges the energy stored in the pouches in its cheeks.",
    scarlet: "When it smashes its cheeks against others, it shares electricity to greet them.",
    habitat: "Temperate Woodlands / Viridian Forest",
    rarity: "Standard Terrestrial",
    surveyYear: 1996,
    leadSurveyor: "Prof. Samuel Oak",
  },
  448: {
    redBlue: "By catching the aura emanating from others, it can read their thoughts and movements from over a mile away.",
    crystal: "A well-trained Lucario can sense auras to identify and take in the feelings of creatures more than a half-mile away.",
    scarlet: "It controls its aura with master precision, generating energy spheres that can pulverize solid boulders.",
    habitat: "Highland Crags / Sinnoh Mountain Trails",
    rarity: "Apex Field Pokemon",
    surveyYear: 2006,
    leadSurveyor: "Prof. Rowan",
  },
};

export const DEFAULT_SPECIMEN_LORE = DEFAULT_POKEMON_LORE;
