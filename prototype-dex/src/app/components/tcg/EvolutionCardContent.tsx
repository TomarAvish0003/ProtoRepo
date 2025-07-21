import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { Fredoka } from "next/font/google";

// --- FONT IMPORTS ---
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-retro" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-fredoka" });

// --- TYPE DEFINITIONS ---
export interface EvolutionForm {
  id: number;
  name: string;
  sprite: string;
  form_type: string;
}
export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  type?: string; // Add this property for the primary type if available
  evolution_details: {
    min_level?: number | null;
    trigger_name?: string | null;
    item?: { name: string } | null;
  }[];
  forms?: EvolutionForm[];
}
export interface EvolutionChainCardProps {
  evoChain: EvolutionStage[];
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function getEvolutionLabel(detail?: {
  min_level?: number | null;
  trigger_name?: string | null;
  item?: { name: string } | null;
}): string {
  if (!detail) return "";
  if (detail.min_level) return `Level ${detail.min_level}`;
  if (detail.item?.name) return capitalize(detail.item.name.replace(/-/g, " "));
  if (detail.trigger_name) return capitalize(detail.trigger_name.replace(/-/g, " "));
  return "";
}

function getMegaLabel(form: EvolutionForm, baseName: string) {
  const t = form.form_type.toLowerCase();
  if (t.includes("mega-x")) return `Mega ${capitalize(baseName)} X`;
  if (t.includes("mega-y")) return `Mega ${capitalize(baseName)} Y`;
  if (t.includes("mega")) return `Mega ${capitalize(baseName)}`;
  return capitalize(form.form_type);
}
function formatFormType(type: string): string {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t.includes("gmax")) return "Gigantamax";
  if (t.includes("dynamax")) return "Dynamax";
  if (t.includes("alola")) return "Alolan";
  if (t.includes("galar")) return "Galarian";
  if (t.includes("hisui")) return "Hisuian";
  if (t.includes("paldea")) return "Paldean";
  return capitalize(type);
}
function groupForms(forms: EvolutionForm[] = []) {
  const mega: EvolutionForm[] = [];
  const gmax: EvolutionForm[] = [];
  const regional: EvolutionForm[] = [];
  const other: EvolutionForm[] = [];
  for (const form of forms) {
    const t = form.form_type.toLowerCase();
    if (t.includes("mega")) mega.push(form);
    else if (t.includes("gmax") || t.includes("dynamax")) gmax.push(form);
    else if (
      t.includes("alolan") ||
      t.includes("galarian") ||
      t.includes("hisui") ||
      t.includes("paldea")
    ) regional.push(form);
    else other.push(form);
  }
  return { mega, gmax, regional, other };
}

const TYPE_COLORS: Record<string, string> = {
  normal: "#9FA29F",
  fire: "#E72324",
  water: "#2481EF",
  electric: "#FAC100",
  grass: "#3DA224",
  ice: "#3DD9FF",
  fighting: "#FF8100",
  poison: "#923FCC",
  ground: "#92501B",
  flying: "#82BAEF",
  psychic: "#EF3F7A",
  bug: "#92A212",
  rock: "#B0A981",
  ghost: "#703F70",
  dragon: "#036DC5",
  dark: "#4F3F3D",
  steel: "#5FA2BA",
  fairy: "#EF70EF"
};

// --- STYLE CONSTANTS ---
const CONTAINER_WIDTH = 880;
const CARD_GAP = 32;
const CARD_MIN = 250;
const SMALL_CARD_WIDTH = (CONTAINER_WIDTH - CARD_GAP) / 2;

// --- MAIN COMPONENT ---
const EvolutionHZCard: React.FC<EvolutionChainCardProps> = ({ evoChain }) => {
  const lastStage = evoChain[evoChain.length - 1];
  const allForms = lastStage?.forms || [];
  const { mega, gmax, regional } = groupForms(allForms);

  // Get the primary type color from the first stage or fallback
  const primaryType = evoChain[0]?.type || "water";
  const gradientColor = TYPE_COLORS[primaryType.toLowerCase()] || "#2481EF";
  const accentColor =
    primaryType !== "normal"
      ? TYPE_COLORS[primaryType.toLowerCase()] + "99"
      : "#ffffff99";

  return (
    <main
      className={`
        ${pressStart2P.variable}
        ${fredoka.variable}
        flex flex-col items-center min-h-screen py-10 px-2 bg-background
      `}
      style={{
        background: "var(--background)"
      }}
    >
      {/* Shared Parent */}
      <div
        className="flex flex-col items-center w-full"
        style={{
          maxWidth: `${CONTAINER_WIDTH}px`
        }}
      >
        {/* Evolution Chain Card */}
        <div
          className="mx-auto my-8 rounded-3xl shadow-2xl animate-gradient-x"
          style={{
            maxWidth: `${CONTAINER_WIDTH}px`,
            background: `linear-gradient(90deg, ${gradientColor}, #fff, ${gradientColor})`,
            backgroundSize: "300% 300%",
            borderRadius: "2rem",
            padding: 4,
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <div
            className="rounded-[1.85rem] bg-background/80 backdrop-blur-2xl w-full h-full p-10"
            style={{ minHeight: 0 }}
          >
            <div className="flex justify-center gap-10 w-full">
              {evoChain.map((stage, idx) => (
                <React.Fragment key={stage.id}>
                  <Link
                    href={`/pokemon/${stage.name}`}
                    className="flex flex-col items-center min-w-[90px] group"
                    scroll={false}
                  >
                    <div
                      className="rounded-full shadow-lg group-hover:scale-105 transition-transform"
                      style={{
                        padding: 14,
                        border: `2px solid ${gradientColor}`,
                        background: "radial-gradient(circle at 60% 40%, var(--muted), var(--background) 98%)"
                      }}
                    >
                      <Image
                        src={stage.sprite}
                        alt={stage.name}
                        width={144}
                        height={144}
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <span
                      className="capitalize mt-3"
                      style={{
                        fontFamily: fredoka.style.fontFamily,
                        fontWeight: 700,
                        fontSize: 17,
                        color: "var(--foreground)"
                      }}
                    >
                      {capitalize(stage.name)}
                    </span>
                    {idx > 0 && (
                      <span
                        className="text-xs mt-1"
                        style={{
                          color: "var(--muted-foreground)",
                          fontFamily: fredoka.style.fontFamily
                        }}
                      >
                        {getEvolutionLabel(stage.evolution_details?.[0])}
                      </span>
                    )}
                  </Link>
                  {idx < evoChain.length - 1 && (
                    <div className="flex items-center mx-1 sm:mx-2">
                      <Image src="/arrow-right.svg" alt="arrow" width={30} height={30} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom Cards Row */}
        <div
          className="flex flex-col sm:flex-row justify-center items-stretch w-full"
          style={{
            gap: `${CARD_GAP}px`,
            maxWidth: `${CONTAINER_WIDTH}px`
          }}
        >
          {/* Mega Card */}
          <div
            className="rounded-2xl shadow-xl animate-gradient-x"
            style={{
              minWidth: CARD_MIN,
              width: SMALL_CARD_WIDTH,
              background: `linear-gradient(90deg, ${gradientColor}, #fff, ${gradientColor})`,
              backgroundSize: "300% 300%",
              borderRadius: "1.5rem",
              padding: 3,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start"
            }}
          >
            <div className="bg-background/80 backdrop-blur-xl w-full rounded-xl h-full py-8 flex flex-col items-center">
              <h3
                className="mb-4 uppercase tracking-wider text-lg text-center"
                style={{
                  fontFamily: pressStart2P.style.fontFamily,
                  color: gradientColor
                }}
              >
                Mega Evolutions
              </h3>
              {mega.length ? (
                <div className="flex flex-row gap-4 flex-wrap justify-center">
                  {mega.map(form => (
                    <Link
                      key={form.id}
                      href={`/pokemon/${form.name}`}
                      className="flex flex-col items-center min-w-[50px] group"
                      scroll={false}
                    >
                      <div
                        className="rounded-full shadow group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(120deg, var(--background) 65%, ${gradientColor}33 100%)`,
                          padding: 7,
                          border: `2px solid ${gradientColor}`
                        }}
                      >
                        <Image
                          src={form.sprite}
                          alt={form.name}
                          width={90}
                          height={90}
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <span
                        className="font-fredoka text-xs mt-2 capitalize"
                        style={{
                          fontFamily: fredoka.style.fontFamily,
                          color: gradientColor
                        }}
                      >
                        {getMegaLabel(form, lastStage.name)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span
                  className="text-xs mt-2"
                  style={{
                    fontFamily: fredoka.style.fontFamily,
                    color: "var(--muted-foreground)"
                  }}
                >
                  None
                </span>
              )}
            </div>
          </div>
          {/* Regional/Dynamax Card */}
          <div
            className="rounded-2xl shadow-xl animate-gradient-x"
            style={{
              minWidth: CARD_MIN,
              width: SMALL_CARD_WIDTH,
              background: `linear-gradient(90deg, #fff, ${accentColor}, #fff)`,
              backgroundSize: "300% 300%",
              borderRadius: "1.5rem",
              padding: 3,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start"
            }}
          >
            <div className="bg-background/80 backdrop-blur-xl w-full rounded-xl h-full py-8 flex flex-col items-center">
              <h3
                className="mb-4 uppercase tracking-wider text-lg text-center"
                style={{
                  fontFamily: pressStart2P.style.fontFamily,
                  color: accentColor
                }}
              >
                Regional & Dynamax
              </h3>
              {regional.length || gmax.length ? (
                <div className="flex flex-row gap-3 flex-wrap justify-center">
                  {[...regional, ...gmax].map(form => (
                    <Link
                      key={form.id}
                      href={`/pokemon/${form.name}`}
                      className="flex flex-col items-center min-w-[50px] group"
                      scroll={false}
                    >
                      <div
                        className="rounded-full shadow group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(110deg, var(--background) 68%, ${accentColor}44 100%)`,
                          padding: 7,
                          border: `2px solid ${accentColor}`
                        }}
                      >
                        <Image
                          src={form.sprite}
                          alt={form.name}
                          width={90}
                          height={90}
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <span
                        className="font-fredoka text-xs mt-2 capitalize"
                        style={{
                          fontFamily: fredoka.style.fontFamily,
                          color: accentColor
                        }}
                      >
                        {formatFormType(form.form_type)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span
                  className="text-xs mt-2"
                  style={{
                    fontFamily: fredoka.style.fontFamily,
                    color: "var(--muted-foreground)"
                  }}
                >
                  None
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* For gradient border animation, add to your global CSS or Tailwind config:
        @keyframes gradient-x {
          0%,100% {background-position:0% 50%;}
          50% {background-position:100% 50%;}
        }
        .animate-gradient-x {
          animation: gradient-x 7s ease-in-out infinite;
          background-size: 300% 300%;
        }
      */}
    </main>
  );
};

export default EvolutionHZCard;
