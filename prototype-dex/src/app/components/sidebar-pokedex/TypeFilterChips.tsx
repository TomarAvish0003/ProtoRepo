import { motion } from "framer-motion";
import Image from "next/image";

const TYPE_COLORS: Record<string, string> = {
  dragon: "#036DC5",
  poison: "#923FCC",
  normal: "#9FA29F",
  fighting: "#FF8100",
  flying: "#82BAEF",
  ground: "#92501B",
  rock: "#B0A981",
  bug: "#92A212",
  ghost: "#703F70",
  steel: "#5FA2BA",
  fire: "#E72324",
  water: "#2481EF",
  grass: "#3DA224",
  electric: "#FAC100",
  psychic: "#EF3F7A",
  ice: "#3DD9FF",
  dark: "#4F3F3D",
  fairy: "#EF70EF",
};

interface TypeFilterChipsProps {
  allTypes: string[];
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  collapsed?: boolean;
}

export default function TypeFilterChips({
  allTypes,
  selectedTypes,
  setSelectedTypes,
  collapsed,
}: TypeFilterChipsProps) {
  if (collapsed) return null;

  const toggleType = (type: string) => {
    setSelectedTypes(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  const resetTypes = () => setSelectedTypes([]);

  return (
    <div>
      <div
        className="font-bold mb-2 uppercase tracking-wider text-[13px] text-white/80"
        style={{
          fontFamily: "'Press Start 2P', 'Fredoka', sans-serif",
          letterSpacing: ".08em",
        }}
      >
        Type
      </div>
      <div className="flex flex-wrap gap-3 mb-3">
        {allTypes.map((type) => {
          const isSelected = selectedTypes.includes(type);
          const color = TYPE_COLORS[type] || "#888";
          return (
            <motion.button
              key={type}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleType(type)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full font-bold capitalize
                border-2 shadow-lg backdrop-blur-md
                outline-none focus:ring-2 focus:ring-white/80
                ${isSelected ? "scale-105 ring-2 ring-white/80" : "hover:scale-105"}
              `}
              style={{
                background: isSelected
                  ? `linear-gradient(120deg, ${color}cc 60%, #fff2 100%)`
                  : "rgba(24,24,27,0.45)",
                borderColor: color,
                color: "#fff",
                boxShadow: isSelected
                  ? `0 2px 12px 0 ${color}88, 0 1px 4px 0 #0003`
                  : `0 1px 4px 0 #0002`,
                filter: isSelected ? "brightness(1.15)" : "none",
                fontFamily: "'Fredoka', sans-serif",
              }}
              whileHover={{
                boxShadow: `0 0 12px 3px ${color}`,
                transition: { duration: 0.3 },
              }}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <Image
                  src={`/icons/${type}.svg`}
                  alt={type}
                  width={20}
                  height={20}
                  style={{
                    filter: "drop-shadow(0 1px 2px #0008) brightness(0) invert(1)",
                  }}
                />
              </span>
              <span
                className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                style={{
                  textShadow: isSelected
                    ? `0 2px 8px ${color}99`
                    : "0 1px 2px #0005",
                }}
              >
                {type}
              </span>
            </motion.button>
          );
        })}
      </div>
      <button
        onClick={resetTypes}
        className="text-xs underline text-slate-400 hover:text-white transition"
        type="button"
      >
        Reset Types
      </button>
    </div>
  );
}
