"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ArrowLeftRight,
  Sword,
  MapPin,
  Sparkles,
} from "lucide-react";

// Sidebar tab definitions
const tabs = [
  { key: "about", label: "About", icon: <Home className="w-6 h-6" /> },
  { key: "evolution", label: "Evolution", icon: <ArrowLeftRight className="w-6 h-6" /> },
  { key: "moves", label: "Moves", icon: <Sword className="w-6 h-6" /> },
  { key: "locations", label: "Locations", icon: <MapPin className="w-6 h-6" /> },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.aside
      initial={{
        width: 60,
        borderRadius: 32,
        left: 32,
        top: 40,
        boxShadow: "0 4px 32px 0 #0001",
      }}
      animate={{
        width: isExpanded ? 220 : 60,
        borderRadius: 16,
        left: 32,
        top: 40,
        boxShadow: isExpanded
          ? "0 8px 32px 0 #0002,0 0 0 1px #fff2"
          : "0 4px 32px 0 #0001",
        background: "rgba(32,32,48,0.16)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed flex flex-col items-center py-7 px-2 z-50"
      style={{
        height: "94vh",
        borderRadius: "16px",
        left: 32,
        top: 40,
        border: "1.5px solid var(--border)",
        background: "rgba(32,32,48,0.16)",
        WebkitBackdropFilter: "blur(16px)",
        backdropFilter: "blur(16px)",
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Website Icon */}
      <motion.div
        className="mb-10 flex items-center justify-center w-full relative"
        layout
      >
        <motion.div
          layout
          className="text-primary"
          style={{
            fontSize: 32,
            fontWeight: "bold",
            letterSpacing: "0.08em",
            padding: "0.25em 0",
          }}
        >
          <Sparkles className="inline-block mr-1 text-yellow-400" size={24} />
          P
        </motion.div>
      </motion.div>

      {/* Navigation Tabs */}
      <nav className="flex flex-col gap-6 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex items-center gap-4 rounded-xl px-3 py-2 transition-colors duration-300 focus:outline-none cursor-pointer select-none ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              initial={false}
              animate={{
                backgroundColor: isActive
                  ? "var(--color-primary)"
                  : "transparent",
                color: isActive
                  ? "var(--color-primary-foreground)"
                  : "var(--color-muted-foreground)",
                boxShadow: isActive
                  ? "0 0 14px 0 #fff4"
                  : isExpanded
                  ? "0 0 6px 0 #fff1"
                  : "none",
              }}
              whileHover={{
                scale: 1.07,
                boxShadow: isActive
                  ? "0 0 32px 0 #fff7"
                  : "0 0 20px 0 #fff4",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.div
                layout
                className="flex-shrink-0 z-10"
                animate={{
                  scale: isExpanded || isActive ? 1.4 : 1,
                  filter: isActive
                    ? "drop-shadow(0 0 8px #fff8)"
                    : "drop-shadow(0 0 2px #fff3)",
                }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                {tab.icon}
              </motion.div>
              {(isExpanded || isActive) && (
                <motion.span
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="whitespace-nowrap font-semibold z-10 text-base"
                >
                  {tab.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
