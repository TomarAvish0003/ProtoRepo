import {
  StatSpread,
  DamageCalcParams,
  DamageRollResult,
  Convolution2HKOResult,
  PokemonType,
} from "./types";
import { getDefensiveMultiplier } from "./typeEngine";

// Nature Modifiers Table
export const NATURE_MODIFIERS: Record<
  string,
  { plus?: keyof StatSpread; minus?: keyof StatSpread }
> = {
  hardy: {},
  docile: {},
  serious: {},
  bashful: {},
  quirky: {},
  lonely: { plus: "atk", minus: "def" },
  brave: { plus: "atk", minus: "spe" },
  adamant: { plus: "atk", minus: "spa" },
  naughty: { plus: "atk", minus: "spd" },
  bold: { plus: "def", minus: "atk" },
  relaxed: { plus: "def", minus: "spe" },
  impish: { plus: "def", minus: "spa" },
  lax: { plus: "def", minus: "spd" },
  timid: { plus: "spe", minus: "atk" },
  hasty: { plus: "spe", minus: "def" },
  jolly: { plus: "spe", minus: "spa" },
  naive: { plus: "spe", minus: "spd" },
  modest: { plus: "spa", minus: "atk" },
  mild: { plus: "spa", minus: "def" },
  quiet: { plus: "spa", minus: "spe" },
  rash: { plus: "spa", minus: "spd" },
  calm: { plus: "spd", minus: "atk" },
  gentle: { plus: "spd", minus: "def" },
  sassy: { plus: "spd", minus: "spe" },
  careful: { plus: "spd", minus: "spa" },
};

export function getNatureMultiplier(nature: string, stat: keyof StatSpread): number {
  const norm = (nature || "").toLowerCase().trim();
  const config = NATURE_MODIFIERS[norm];
  if (!config) return 1.0;
  if (config.plus === stat) return 1.1;
  if (config.minus === stat) return 0.9;
  return 1.0;
}

/**
 * Calculates actual numerical Pokémon stat factoring Base, IV, EV, Level, and Nature.
 */
export function calcActualStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureMult: number,
  isHp: boolean,
  speciesName?: string
): number {
  if (isHp) {
    if (speciesName?.toLowerCase() === "shedinja") return 1;
    return (
      Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) +
      level +
      10
    );
  }
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) *
      natureMult
  );
}

/**
 * Computes all 6 actual stats for a specimen.
 */
export function calculateAllStats(
  baseStats: StatSpread,
  ivs: StatSpread,
  evs: StatSpread,
  nature: string,
  level: number,
  speciesName?: string
): StatSpread {
  return {
    hp: calcActualStat(baseStats.hp, ivs.hp, evs.hp, level, 1.0, true, speciesName),
    atk: calcActualStat(baseStats.atk, ivs.atk, evs.atk, level, getNatureMultiplier(nature, "atk"), false),
    def: calcActualStat(baseStats.def, ivs.def, evs.def, level, getNatureMultiplier(nature, "def"), false),
    spa: calcActualStat(baseStats.spa, ivs.spa, evs.spa, level, getNatureMultiplier(nature, "spa"), false),
    spd: calcActualStat(baseStats.spd, ivs.spd, evs.spd, level, getNatureMultiplier(nature, "spd"), false),
    spe: calcActualStat(baseStats.spe, ivs.spe, evs.spe, level, getNatureMultiplier(nature, "spe"), false),
  };
}

/**
 * Converts stat stages (-6 to +6) to mathematical multiplier.
 */
export function getStageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

/**
 * Standard competitive damage calculation engine (Gen 5+).
 */
export function calculateDamage(params: DamageCalcParams): DamageRollResult {
  const { attacker, defender, move, field } = params;

  // Calculate actual raw stats
  const atkStats = calculateAllStats(
    attacker.baseStats,
    attacker.ivs,
    attacker.evs,
    attacker.nature,
    attacker.level,
    attacker.speciesName
  );

  const defStats = calculateAllStats(
    defender.baseStats,
    defender.ivs,
    defender.evs,
    defender.nature,
    defender.level,
    defender.speciesName
  );

  const isSpecial = move.category.toLowerCase() === "special";
  const isStatus = move.category.toLowerCase() === "status";

  if (isStatus || move.power <= 0) {
    return {
      rolls: new Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      defenderMaxHp: defStats.hp,
      effectiveMoveType: move.type.toLowerCase(),
      typeMultiplier: 0,
      isStab: false,
      koChanceText: "Status move (No direct damage)",
      stealthRockDamage: 0,
      spikesDamage: 0,
    };
  }

  // Determine effective move type (considering Tera)
  const effectiveMoveType = move.type.toLowerCase();
  let movePower = move.power;

  // Ability modifiers on move power
  const atkAbility = (attacker.ability || "").toLowerCase().replace(/[\s-_]/g, "");
  const defAbility = (defender.ability || "").toLowerCase().replace(/[\s-_]/g, "");
  const atkItem = (attacker.item || "").toLowerCase().replace(/[\s-_]/g, "");
  const defItem = (defender.item || "").toLowerCase().replace(/[\s-_]/g, "");

  // Technician (Boosts moves with base power <= 60 by 1.5x)
  if (atkAbility === "technician" && movePower <= 60) {
    movePower = Math.floor(movePower * 1.5);
  }

  // Terrain boosts
  if (field.terrain === "electric" && effectiveMoveType === "electric") {
    movePower = Math.floor(movePower * 1.3);
  } else if (field.terrain === "grassy" && effectiveMoveType === "grass") {
    movePower = Math.floor(movePower * 1.3);
  } else if (field.terrain === "psychic" && effectiveMoveType === "psychic") {
    movePower = Math.floor(movePower * 1.3);
  } else if (field.terrain === "misty" && effectiveMoveType === "dragon") {
    movePower = Math.floor(movePower * 0.5);
  }

  if (field.terrain === "grassy" && (move.name.toLowerCase() === "earthquake" || move.name.toLowerCase() === "bulldoze")) {
    movePower = Math.floor(movePower * 0.5);
  }

  // Effective Attack & Defense
  let effA = isSpecial ? atkStats.spa : atkStats.atk;
  let effD = isSpecial ? defStats.spd : defStats.def;

  // Stat stages (Unaware ignores opponent's stat stages)
  const attackerStage = isSpecial ? attacker.stages.spa : attacker.stages.atk;
  const defenderStage = isSpecial ? defender.stages.spd : defender.stages.def;

  if (defAbility !== "unaware") {
    effA = Math.floor(effA * getStageMultiplier(attackerStage));
  }
  if (atkAbility !== "unaware") {
    effD = Math.floor(effD * getStageMultiplier(defenderStage));
  }

  // Attacker stat boosts (Abilities & Items)
  if (!isSpecial && atkAbility === "hugepower") effA *= 2;
  if (!isSpecial && atkItem === "choiceband") effA = Math.floor(effA * 1.5);
  if (isSpecial && atkItem === "choicespecs") effA = Math.floor(effA * 1.5);

  if (atkAbility === "protosynthesis" || atkAbility === "quarkdrive") {
    effA = Math.floor(effA * 1.3);
  }

  if (!isSpecial && attacker.isBurned && atkAbility !== "guts" && move.name.toLowerCase() !== "facade") {
    effA = Math.floor(effA * 0.5);
  }

  // Defender stat boosts
  if (isSpecial && defItem === "assaultvest") effD = Math.floor(effD * 1.5);
  if (defItem === "eviolite") effD = Math.floor(effD * 1.5);

  if (field.weather === "snow" && defender.types.map((t) => t.toLowerCase()).includes("ice") && !isSpecial) {
    effD = Math.floor(effD * 1.5);
  }
  if (field.weather === "sand" && defender.types.map((t) => t.toLowerCase()).includes("rock") && isSpecial) {
    effD = Math.floor(effD * 1.5);
  }

  // Base Damage Formula
  const levelTerm = Math.floor((2 * attacker.level) / 5) + 2;
  const baseDamage = Math.floor(Math.floor((levelTerm * movePower * effA) / effD) / 50) + 2;

  // Multipliers
  let multiplier = 1.0;

  // Targets (Doubles spread)
  if (field.format === "doubles") {
    multiplier *= 0.75;
  }

  // Weather
  if (field.weather === "sun") {
    if (effectiveMoveType === "fire") multiplier *= 1.5;
    if (effectiveMoveType === "water") multiplier *= 0.5;
  } else if (field.weather === "rain") {
    if (effectiveMoveType === "water") multiplier *= 1.5;
    if (effectiveMoveType === "fire") multiplier *= 0.5;
  }

  // Critical Hit
  if (field.isCritical) {
    multiplier *= 1.5;
  }

  // Screens (Ignored on critical hits)
  if (!field.isCritical) {
    if (!isSpecial && (field.isReflect || field.isAuroraVeil)) {
      multiplier *= field.format === "doubles" ? 0.66 : 0.5;
    } else if (isSpecial && (field.isLightScreen || field.isAuroraVeil)) {
      multiplier *= field.format === "doubles" ? 0.66 : 0.5;
    }
  }

  // STAB (Same-Type Attack Bonus)
  const attackerTypes = attacker.types.map((t) => t.toLowerCase());
  const isOriginalStab = attackerTypes.includes(effectiveMoveType);
  let isStab = isOriginalStab;

  if (attacker.isTeraActive && attacker.teraType) {
    const tera = attacker.teraType.toLowerCase();
    if (tera === effectiveMoveType) {
      isStab = true;
      multiplier *= isOriginalStab ? 2.0 : 1.5; // Tera-boosted original STAB gives 2.0x
    } else if (isOriginalStab) {
      multiplier *= 1.5; // retains base STAB
    }
  } else if (isOriginalStab) {
    multiplier *= atkAbility === "adaptability" ? 2.0 : 1.5;
  }

  // Type Effectiveness
  const { multiplier: typeMultiplier } = getDefensiveMultiplier(
    effectiveMoveType as PokemonType,
    defender.types,
    defender.ability,
    defender.item,
    defender.isTeraActive ? defender.teraType : undefined
  );
  multiplier *= typeMultiplier;

  // Item Modifiers
  if (atkItem === "lifeorb") multiplier *= 1.3;
  if (atkItem === "expertbelt" && typeMultiplier > 1.0) multiplier *= 1.2;

  // Defender Ability Damage Reduction (Multiscale / Shadow Shield)
  if (defender.currentHpPercent >= 100 && (defAbility === "multiscale" || defAbility === "shadowshield")) {
    multiplier *= 0.5;
  }

  // 16 Discrete Rolls ([85..100] / 100)
  const rolls: number[] = [];
  for (let r = 85; r <= 100; r++) {
    if (typeMultiplier === 0) {
      rolls.push(0);
    } else {
      const dmg = Math.max(1, Math.floor(Math.floor(baseDamage * multiplier) * (r / 100)));
      rolls.push(dmg);
    }
  }

  const minDamage = rolls[0];
  const maxDamage = rolls[15];
  const defenderMaxHp = defStats.hp;
  const minPercent = Number(((minDamage / defenderMaxHp) * 100).toFixed(1));
  const maxPercent = Number(((maxDamage / defenderMaxHp) * 100).toFixed(1));

  // Entry Hazard Calculations
  let stealthRockDamage = 0;
  if (field.isStealthRock && defItem !== "heavydutyboots") {
    const rockDefMult = getDefensiveMultiplier(
      "rock",
      defender.types,
      defender.ability,
      defender.item,
      defender.isTeraActive ? defender.teraType : undefined
    ).multiplier;
    stealthRockDamage = Math.floor(defenderMaxHp * 0.125 * rockDefMult);
  }

  let spikesDamage = 0;
  if (field.spikesLayers > 0 && defItem !== "heavydutyboots" && !defender.types.map((t) => t.toLowerCase()).includes("flying") && defAbility !== "levitate") {
    const fraction = field.spikesLayers === 1 ? 0.125 : field.spikesLayers === 2 ? 0.1667 : 0.25;
    spikesDamage = Math.floor(defenderMaxHp * fraction);
  }

  // KO Chance Inference
  let koChanceText = "";
  if (typeMultiplier === 0) {
    koChanceText = "Does not affect the target (0% damage)";
  } else {
    const ohkoRolls = rolls.filter((r) => r >= defenderMaxHp).length;
    if (ohkoRolls === 16) {
      koChanceText = "Guaranteed OHKO";
    } else if (ohkoRolls > 0) {
      const pct = ((ohkoRolls / 16) * 100).toFixed(1);
      koChanceText = `${pct}% chance to OHKO`;
    } else {
      const twoHkoRolls = rolls.filter((r) => r * 2 >= defenderMaxHp).length;
      if (twoHkoRolls === 16) {
        koChanceText = "Guaranteed 2HKO";
      } else if (twoHkoRolls > 0) {
        const pct = ((twoHkoRolls / 16) * 100).toFixed(1);
        koChanceText = `${pct}% chance to 2HKO`;
      } else {
        const threeHkoRolls = rolls.filter((r) => r * 3 >= defenderMaxHp).length;
        if (threeHkoRolls === 16) {
          koChanceText = "Guaranteed 3HKO";
        } else {
          koChanceText = "Possible 3HKO or 4HKO";
        }
      }
    }

    // Check if stealth rock secures the OHKO
    if (stealthRockDamage > 0 && ohkoRolls < 16) {
      const srOhkoRolls = rolls.filter((r) => r + stealthRockDamage >= defenderMaxHp).length;
      if (srOhkoRolls === 16) {
        koChanceText += " (Guaranteed OHKO after Stealth Rock)";
      } else if (srOhkoRolls > 0 && ohkoRolls === 0) {
        const srPct = ((srOhkoRolls / 16) * 100).toFixed(1);
        koChanceText += ` (${srPct}% chance to OHKO after Stealth Rock)`;
      }
    }
  }

  // Calculate passive recovery for defender (Leftovers, Grassy Terrain)
  let passiveRecovery = 0;
  const defenderItemClean = (defender.item || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (defenderItemClean === "leftovers" || (defenderItemClean === "blacksludge" && defender.types.map((t) => t.toLowerCase()).includes("poison"))) {
    passiveRecovery += Math.floor(defenderMaxHp / 16);
  }
  if (field.terrain === "grassy") {
    // Grounded defender check
    const isFlying = defender.types.map((t) => t.toLowerCase()).includes("flying");
    const isLevitate = (defender.ability || "").toLowerCase().includes("levitate");
    if (!isFlying && !isLevitate && defenderItemClean !== "airballoon") {
      passiveRecovery += Math.floor(defenderMaxHp / 16);
    }
  }

  const convolution = compute2HKOConvolution(
    rolls,
    defenderMaxHp,
    stealthRockDamage + spikesDamage,
    passiveRecovery
  );

  return {
    rolls,
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    defenderMaxHp,
    effectiveMoveType,
    typeMultiplier,
    isStab,
    koChanceText,
    stealthRockDamage,
    spikesDamage,
    convolution,
  };
}

/**
 * Discrete 256-cell convolution calculating exact 2HKO survival distributions
 * taking into account entry hazards and end-of-turn recovery.
 */
export function compute2HKOConvolution(
  rolls: number[],
  defenderMaxHp: number,
  hazardChip: number = 0,
  passiveRecovery: number = 0
): Convolution2HKOResult {
  if (defenderMaxHp <= 0 || rolls.length === 0) {
    return {
      oneHitKoPercent: 0,
      twoHitKoPercent: 0,
      hazardChip: 0,
      passiveRecovery: 0,
      distribution1Hit: [],
      distribution2Hit: [],
      guaranteedSurvive: true,
      guaranteed2HKO: false,
    };
  }

  // 1-Hit distribution (16 discrete outcomes)
  let oneHitKOCount = 0;
  const dist1Hit: { damagePct: number; probability: number }[] = [];
  for (const r of rolls) {
    const totalDmg = r + hazardChip;
    if (totalDmg >= defenderMaxHp) oneHitKOCount++;
    dist1Hit.push({
      damagePct: Math.round((totalDmg / defenderMaxHp) * 100),
      probability: 1 / 16,
    });
  }

  // 2-Hit discrete convolution (16 x 16 = 256 outcomes)
  let twoHitKOCount = 0;
  const convMap = new Map<number, number>();

  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const hit1 = rolls[i] + hazardChip;
      if (hit1 >= defenderMaxHp) {
        twoHitKOCount++;
        const pct = Math.min(150, Math.round((hit1 / defenderMaxHp) * 100));
        convMap.set(pct, (convMap.get(pct) || 0) + 1);
      } else {
        const afterTurn1 = Math.max(0, hit1 - passiveRecovery);
        const totalAfterTurn2 = afterTurn1 + rolls[j];
        if (totalAfterTurn2 >= defenderMaxHp) {
          twoHitKOCount++;
        }
        const pct = Math.min(150, Math.round((totalAfterTurn2 / defenderMaxHp) * 100));
        convMap.set(pct, (convMap.get(pct) || 0) + 1);
      }
    }
  }

  const dist2Hit: { damagePct: number; probability: number }[] = [];
  const sortedPcts = Array.from(convMap.keys()).sort((a, b) => a - b);
  for (const pct of sortedPcts) {
    dist2Hit.push({
      damagePct: pct,
      probability: (convMap.get(pct) || 0) / 256,
    });
  }

  const oneHitKoPercent = Math.round((oneHitKOCount / 16) * 1000) / 10;
  const twoHitKoPercent = Math.round((twoHitKOCount / 256) * 1000) / 10;

  return {
    oneHitKoPercent,
    twoHitKoPercent,
    hazardChip,
    passiveRecovery,
    distribution1Hit: dist1Hit,
    distribution2Hit: dist2Hit,
    guaranteedSurvive: twoHitKoPercent === 0,
    guaranteed2HKO: twoHitKoPercent === 100,
  };
}

/**
 * Computes Stealth Rock damage percentage (3.125% to 50%) based on type effectiveness.
 */
export function getStealthRockDamagePercent(
  defendingTypes: string[],
  ability?: string,
  item?: string
): { percent: number; damageMultiplier: number; isImmune: boolean; alertSeverity: "none" | "low" | "high" | "critical" } {
  const normItem = (item || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normAbility = (ability || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normItem === "heavydutyboots" || normAbility === "magicguard") {
    return { percent: 0, damageMultiplier: 0, isImmune: true, alertSeverity: "none" };
  }

  const multData = getDefensiveMultiplier("rock", defendingTypes, ability, item);
  const mult = multData.multiplier;
  const percent = mult * 12.5;

  let alertSeverity: "none" | "low" | "high" | "critical" = "none";
  if (percent >= 50) alertSeverity = "critical";
  else if (percent >= 25) alertSeverity = "high";
  else if (percent >= 12.5) alertSeverity = "low";

  return { percent, damageMultiplier: mult, isImmune: mult === 0, alertSeverity };
}

/**
 * Dynamically evaluates which stat is highest for Protosynthesis / Quark Drive
 * taking into account Level, IVs, EVs, and Nature modifiers.
 */
export function getProtosynthesisBoostedStat(
  baseStats: StatSpread,
  ivs: StatSpread,
  evs: StatSpread,
  nature: string,
  level: number = 100
): { stat: "atk" | "def" | "spa" | "spd" | "spe"; statName: string; rawValue: number; boostedValue: number; multiplier: number } {
  const stats: ("atk" | "def" | "spa" | "spd" | "spe")[] = ["atk", "def", "spa", "spd", "spe"];
  let highestStat: "atk" | "def" | "spa" | "spd" | "spe" = "atk";
  let highestVal = -1;

  for (const s of stats) {
    const mult = getNatureMultiplier(nature, s);
    const val = calcActualStat(baseStats[s], ivs[s], evs[s], level, mult, false);
    if (val > highestVal) {
      highestVal = val;
      highestStat = s;
    }
  }

  const multiplier = highestStat === "spe" ? 1.5 : 1.3;
  const boostedValue = Math.floor(highestVal * multiplier);

  const labels: Record<string, string> = {
    atk: "Attack",
    def: "Defense",
    spa: "Sp. Atk",
    spd: "Sp. Def",
    spe: "Speed",
  };

  return {
    stat: highestStat,
    statName: labels[highestStat],
    rawValue: highestVal,
    boostedValue,
    multiplier,
  };
}
