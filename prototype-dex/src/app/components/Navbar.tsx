"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

// External SVG URLs
const POKEBALL_SVG = "/pokeball-colored.svg";
const GAMEBOY_SVG = "/gameboy.svg";

type DropdownKey = "user" | "account" | null;

interface PokeballSVGProps {
  rotated?: boolean;
  onClick?: () => void;
}

const PokeballSVG: React.FC<PokeballSVGProps> = ({ rotated = false, onClick }) => (
  <motion.img
    src={POKEBALL_SVG}
    alt="Poké Ball"
    className="w-10 h-10 mr-2 select-none z-10 cursor-pointer"
    initial={false}
    animate={{ rotate: rotated ? 90 : 0 }}
    transition={{ type: "spring", stiffness: 180, damping: 14 }}
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-label="Go to homepage"
    style={{ filter: "drop-shadow(0 2px 8px #0006)" }}
    draggable={false}
  />
);

const GameboySVG: React.FC = () => (
  <motion.img
    src={GAMEBOY_SVG}
    alt="Game Boy"
    className="w-8 h-8 ml-4 select-none"
    initial={{ rotate: 0 }}
    animate={{ rotate: -18 }}
    transition={{ type: "spring", stiffness: 120, damping: 12 }}
    style={{
      filter:
        "drop-shadow(0 2px 8px #2228) drop-shadow(0 0px 0px #FFCB05) drop-shadow(0 0px 0px #3B4CCA)",
      display: "flex",
      alignItems: "flex-end",
      height: "40px",
    }}
    draggable={false}
  />
);

interface LucideThemeToggleProps {
  isDark: boolean;
  onClick: () => void;
}

const LucideThemeToggle: React.FC<LucideThemeToggleProps> = ({ isDark, onClick }) => (
  <motion.button
    onClick={onClick}
    className="ml-5 px-4 py-3 rounded-full bg-white/10 text-white hover:bg-yellow-400 hover:text-black transition font-bold z-10 flex items-center justify-center"
    aria-label="Toggle Light/Dark Mode"
    style={{
      boxShadow: isDark
        ? "0 0 8px #3B4CCA80"
        : "0 0 8px #FFCB0580",
    }}
    type="button"
  >
    <AnimatePresence mode="wait" initial={false}>
      {isDark ? (
        <motion.span
          key="moon"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex" }}
        >
          <Moon size={28} strokeWidth={2.2} />
        </motion.span>
      ) : (
        <motion.span
          key="sun"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex" }}
        >
          <Sun size={28} strokeWidth={2.2} />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

const Navbar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [dropdown, setDropdown] = useState<DropdownKey>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Dropdown hover logic
  const handleDropdownLeave = () => {
    closeTimeout.current = setTimeout(() => setDropdown(null), 200);
  };
  const handleDropdownEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  // Theme toggle
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <motion.div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setDropdown(null);
      }}
      className={`
        fixed top-3 left-1/2 -translate-x-1/2 z-50
        flex items-center
        transition-all duration-500
        ${expanded ? "px-16 py-5 min-w-[900px] max-w-5xl" : "px-6 py-2 min-w-[340px] max-w-lg"}
        font-fredoka
        gap-8
        relative
        bg-black/70
        backdrop-blur-xl
        shadow-lg
        border-8 border-transparent navbar-pixel
      `}
      style={{
        fontFamily: "'Fredoka', 'Montserrat', Arial, sans-serif",
        fontWeight: 500,
        borderImage: expanded
          ? "url('/pixel-border.svg') 8 repeat"
          : "none",
        borderRadius: expanded ? "36px" : "9999px",
        overflow: "visible",
      }}
      animate={{
        boxShadow: expanded
          ? "0 10px 40px 0 rgba(59,76,202,0.12), 0 0px 0px 4px #FFCB05"
          : "0 8px 32px 0 rgba(0,0,0,0.18)",
        transition: { duration: 0.4, ease: [0.68, -0.55, 0.27, 1.55] },
      }}
    >
      {/* Poké Ball SVG (rotates, clickable) */}
      <PokeballSVG
        rotated={expanded}
        onClick={() => router.push("/")}
      />

      {/* Menu Items */}
      <div className="flex gap-8 items-center flex-1 justify-center z-10">
        <Link
          href="/pokedex"
          className="px-6 py-3 rounded-full transition hover:bg-yellow-200/10 hover:text-yellow-300 text-white text-lg"
        >
          Pokedex
        </Link>

        {/* User Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => {
            handleDropdownEnter();
            setDropdown("user");
          }}
          onMouseLeave={handleDropdownLeave}
        >
          <button
            className="px-6 py-3 rounded-full transition hover:bg-blue-200/10 hover:text-blue-300 text-white text-lg"
            onClick={() => setDropdown(dropdown === "user" ? null : "user")}
            tabIndex={0}
            style={{ appearance: "none" }}
            type="button"
          >
            User
          </button>
          <AnimatePresence>
            {dropdown === "user" && expanded && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.22 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-background backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-4 px-8 flex flex-col gap-4 z-50 min-w-[210px] text-lg"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/favorites" className="hover:text-yellow-400">Favorites</Link>
                <Link href="/caught" className="hover:text-blue-400">Caught</Link>
                <Link href="/profile" className="hover:text-red-400">Profile</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Account Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => {
            handleDropdownEnter();
            setDropdown("account");
          }}
          onMouseLeave={handleDropdownLeave}
        >
          <button
            className="px-6 py-3 rounded-full transition hover:bg-red-200/10 hover:text-red-300 text-white text-lg"
            onClick={() => setDropdown(dropdown === "account" ? null : "account")}
            tabIndex={0}
            style={{ appearance: "none" }}
            type="button"
          >
            Account
          </button>
          <AnimatePresence>
            {dropdown === "account" && expanded && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.22 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-background backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-4 px-8 flex flex-col gap-4 z-50 min-w-[210px] text-lg"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link href="/login" className="hover:text-yellow-400">Login</Link>
                <Link href="/register" className="hover:text-blue-400">Register</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Light/Dark Toggle & Game Boy SVG (right side, only on expand) */}
      <AnimatePresence>
        {expanded && (
          <>
            <LucideThemeToggle isDark={isDark} onClick={toggleTheme} />
            <GameboySVG />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
