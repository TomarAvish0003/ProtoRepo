import React, { useState } from "react";
import Image from "next/image";

type RemoveButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  typeColor: string;
  className?: string;
};

export default function RemoveButton({ onClick, typeColor, className = "" }: RemoveButtonProps) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      className={`remove-btn ${className}`}
      style={{
        background: typeColor,
        boxShadow: `0 2px 8px 0 ${typeColor}55`,
        // The rest is handled by global.css
      }}
      onClick={(e) => {
        setActive(true);
        onClick(e);
        setTimeout(() => setActive(false), 300);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
    >
      <span
        className="pokeball-svg-wrapper"
        style={{
          display: "inline-block",
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          transform: active ? "rotate(90deg)" : undefined,
        }}
      >
        <Image
          src="/pokeball-colored.svg"
          alt="Pokeball"
          width={22}
          height={22}
          className="pokeball-svg"
          draggable={false}
        />
      </span>
      Remove
    </button>
  );
}
