"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/context/AuthContext";
import { Menu, X, LogOut, Heart, CheckCircle2, User as UserIcon, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/pokedex?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    {
      href: "/",
      label: "Spotlight",
      kanji: "発見",
      isActive: pathname === "/",
    },
    {
      href: "/pokedex",
      label: "National Dex",
      kanji: "図鑑",
      isActive: pathname.startsWith("/pokedex"),
    },
    {
      href: "/pokemon/bulbasaur",
      label: "Master Dossier",
      kanji: "詳細",
      isActive: pathname.startsWith("/pokemon"),
    },
    {
      href: "/caught",
      label: "Caught",
      kanji: "捕獲",
      isActive: pathname.startsWith("/caught"),
    },
    {
      href: "/favorites",
      label: "Favorites",
      kanji: "保存",
      isActive: pathname.startsWith("/favorites"),
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border-crisp shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-colors duration-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 snappy-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 80"
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]"
          >
            <defs>
              <linearGradient id="navProtoGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF3355" />
                <stop offset="100%" stopColor="#FF5277" />
              </linearGradient>
              <linearGradient id="navCyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF3355" />
                <stop offset="50%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <polygon
              points="12,0 68,0 80,12 80,68 68,80 12,80 0,68 0,12"
              fill="#090D16"
              stroke="url(#navCyberBorder)"
              strokeWidth="2.5"
            />
            <circle cx="40" cy="40" r="32" fill="#111827" stroke="#1E2638" strokeWidth="2" />
            {/* Top Half (Red Accent) */}
            <path d="M 10 40 A 30 30 0 0 1 70 40 Z" fill="url(#navProtoGradDark)" />
            {/* Bottom Half (Dark Charcoal) */}
            <path d="M 10 40 A 30 30 0 0 0 70 40 Z" fill="#0B0F17" />
            {/* Divider Band */}
            <line x1="8" y1="40" x2="72" y2="40" stroke="#000000" strokeWidth="4" />
            {/* Outer Core Ring */}
            <circle cx="40" cy="40" r="10" fill="#0B0F17" stroke="#000000" strokeWidth="3" />
            {/* Center Button (Cyan Active Light) */}
            <circle cx="40" cy="40" r="5" fill="#00E5FF" />
            <circle cx="40" cy="40" r="2" fill="#FFFFFF" />
            {/* Corner Tech Ticks */}
            <line x1="3" y1="12" x2="12" y2="3" stroke="#00E5FF" strokeWidth="2" />
            <line x1="77" y1="68" x2="68" y2="77" stroke="#FF3355" strokeWidth="2" />
          </svg>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-headline-sm text-[17px] sm:text-[18px] text-on-surface tracking-tight font-black uppercase">
                Proto<span className="text-primary">Dex</span>
              </span>
              <span className="font-caption-label text-[9px] text-secondary bg-surface-container-low border border-secondary/30 px-1.5 py-0.5 rounded font-bold">
                OS v4.2
              </span>
            </div>
            <span className="font-caption-label text-[8px] sm:text-[9px] text-secondary font-bold tracking-widest opacity-85 mt-0.5 uppercase">
              RESEARCH OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low rounded-lg border border-border-crisp">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md font-body-sm text-[13px] flex items-center gap-1.5 snappy-btn transition-colors ${
                link.isActive
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span>{link.label}</span>
              <span className={`text-[10px] ${link.isActive ? "opacity-90" : "opacity-50"}`}>
                ({link.kanji})
              </span>
            </Link>
          ))}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-border-crisp shadow-xs focus-within:ring-2 focus-within:ring-secondary focus-within:border-transparent transition-all"
          >
            <span className="material-symbols-outlined text-secondary text-[18px] mr-1.5">
              search
            </span>
            <input
              id="navbarSearchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick scan species, № ID..."
              className="bg-transparent outline-none font-body-sm text-[13px] text-on-surface placeholder:text-on-surface-variant/60 w-32 lg:w-40"
            />
          </form>

          {/* Theme Switch Button */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme Mode"
            className="snappy-btn w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high border border-border-crisp text-on-surface hover:text-primary transition-all shadow-2xs cursor-pointer"
            title={mounted && resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in fade-in duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-[#BA0032] animate-in fade-in duration-200" />
              )
            ) : (
              <span className="w-4 h-4 rounded-full bg-slate-400/20" />
            )}
          </button>

          {/* User Profile / Auth Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-8 h-8 rounded-full bg-surface-container-low border border-border-crisp text-secondary flex items-center justify-center flex-shrink-0 hover:bg-surface-container-high transition-colors snappy-btn shadow-xs"
              title={user ? user.username : "Account & Options"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {user ? "account_circle" : "person"}
              </span>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-charcoal-surface border border-border-crisp rounded-xl shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-2.5 flex flex-col gap-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl">
                {user ? (
                  <>
                    <div className="px-2 py-2 border-b border-border-crisp">
                      <p className="font-caption-label text-[10px] text-secondary uppercase font-bold tracking-wider">
                        FIELD RESEARCHER
                      </p>
                      <p className="font-headline-sm text-sm text-on-surface font-bold truncate">
                        {user.username}
                      </p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container-low text-body-sm text-on-surface transition-colors snappy-btn"
                    >
                      <UserIcon className="w-4 h-4 text-primary" />
                      <span>Trainer Profile</span>
                    </Link>
                    <Link
                      href="/caught"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container-low text-body-sm text-on-surface transition-colors snappy-btn"
                    >
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span>Caught Pokémon Log</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container-low text-body-sm text-on-surface transition-colors snappy-btn"
                    >
                      <Heart className="w-4 h-4 text-primary" />
                      <span>Priority Favorites</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-500/10 text-body-sm text-red-600 dark:text-red-400 w-full text-left transition-colors snappy-btn"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-2 border-b border-border-crisp">
                      <p className="font-caption-label text-[10px] text-secondary uppercase font-bold tracking-wider">
                        GUEST RESEARCHER
                      </p>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                        Sign in to record caught Pokémon &amp; sync across devices.
                      </p>
                    </div>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary hover:opacity-90 text-white font-caption-label text-[11px] font-bold uppercase shadow-sm dark:shadow-[0_0_14px_rgba(255,51,85,0.35)] transition-all snappy-btn mt-1"
                    >
                      Sign In / Register
                    </Link>
                    <Link
                      href="/register"
                      className="text-center font-caption-label text-[10px] text-secondary hover:underline py-1 font-semibold"
                    >
                      Create Trainer Account →
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface border border-border-crisp snappy-btn"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border-crisp p-4 flex flex-col gap-3 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-border-crisp focus-within:ring-2 focus-within:ring-secondary">
            <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search species, index, type..."
              className="bg-transparent outline-none font-body-sm text-on-surface placeholder:text-on-surface-variant/60 w-full"
            />
          </form>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg font-body-sm flex items-center justify-between snappy-btn transition-colors ${
                  link.isActive
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span>{link.label} ({link.kanji})</span>
                <span className="material-symbols-outlined text-[16px] opacity-60">chevron_right</span>
              </Link>
            ))}

            {user ? (
              <Link
                href="/profile"
                className="mt-2 px-3 py-2 rounded-lg font-body-sm flex items-center justify-between snappy-btn bg-surface-container-low text-on-surface border border-border-crisp"
              >
                <span className="font-bold flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>Trainer Profile (@{user.username})</span>
                </span>
                <span className="material-symbols-outlined text-[16px] opacity-60">chevron_right</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="mt-2 px-3 py-2 rounded-lg font-body-sm flex items-center justify-between snappy-btn bg-primary text-white font-bold shadow-sm"
              >
                <span>Sign In / Register</span>
                <span className="material-symbols-outlined text-[16px] opacity-60">chevron_right</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
