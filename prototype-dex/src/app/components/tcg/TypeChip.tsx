import Image from "next/image";

// Use the same color mapping as in your main codebase
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
  fairy: "#EF70EF",
};

interface TypeChipProps {
  type: string; // e.g., "fire"
  className?: string;
}

export default function TypeChip({ type, className = "" }: TypeChipProps) {
  // Normalize type to lowercase and trim spaces
  const normalizedType = type.trim().toLowerCase();
  const color = TYPE_COLORS[normalizedType] ?? "#ccc";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-retro text-xs shadow-sm border-2 backdrop-blur-md ${className}`}
      style={{
        borderColor: color,
        background: "rgba(255,255,255,0.15)",
        color: "#fff",
        textShadow: "1px 1px 2px #222",
        boxShadow: `0 2px 8px 0 ${color}44`,
      }}
    >
      <Image
        src={`/icons/${normalizedType}.svg`}
        alt={normalizedType}
        width={18}
        height={18}
        className="filter-white-svg"
        style={{ marginRight: 4 }}
      />
      {normalizedType}
    </span>
  );
}
