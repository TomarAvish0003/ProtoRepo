import React from "react";
import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["sans-serif"],
});

export default function GradientGlassyTextBg({
  text,
  gradient = "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #facc15 100%)",
  className = "",
}: {
  text: string;
  gradient?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none fixed inset-0 flex items-center justify-center z-0 ${className}`}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Optional: blurred glow behind the text for extra glassiness */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "92vw",
          height: "1.5em",
          background: gradient,
          filter: "blur(32px) opacity(0.25)",
          zIndex: 0,
        }}
      />
      <div
        className={pressStart2P.className}
        style={{
          display: "inline-block",
          padding: "0 2vw",
          textAlign: "center",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "clamp(6rem, 13vw, 13rem)",
          letterSpacing: "0.01em",
          lineHeight: 1,
          background: gradient,
          backgroundSize: "200% 100%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          filter:
            "drop-shadow(0 8px 36px rgba(0,0,0,0.20)) drop-shadow(0 0 24px rgba(255,255,255,0.10))",
          opacity: 0.93,
          userSelect: "none",
          backdropFilter: "blur(8px) saturate(1.4)",
          WebkitBackdropFilter: "blur(8px) saturate(1.4)",
          textShadow:
            "0 8px 32px rgba(0,0,0,0.25), 0 1.5px 1.5px rgba(255,255,255,0.14), 0 0.5vw 2vw rgba(255,255,255,0.11)",
          transform: "scaleY(1.38)",
          animation: "animatedTextGradient 7s ease-in-out infinite alternate",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        {text}
        <style>
          {`
            @keyframes animatedTextGradient {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
