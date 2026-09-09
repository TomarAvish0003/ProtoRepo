"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import UserInfoCard from "@/app/components/profile/UserInfoCard";
import FavoritesTab from "@/app/components/profile/FavoritesTab";
import CaughtTab from "@/app/components/profile/CaughtTab";
import ExportImportSection from "@/app/components/profile/ExportImportSection";
import DeleteAccountSection from "@/app/components/profile/DeleteAccountSection";
import { ArrowLeft, User as UserIcon, LogIn, UserPlus, Trophy, Bookmark } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, favorites, caught } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-on-surface px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
          <div className="h-40 rounded-2xl bg-charcoal-surface border border-border-crisp" />
          <div className="h-64 rounded-2xl bg-charcoal-surface border border-border-crisp" />
        </div>
      </main>
    );
  }

  // Unauthenticated / Guest View
  if (!user) {
    return (
      <main className="min-h-screen bg-background text-on-surface px-4 sm:px-6 lg:px-8 pt-24 pb-12 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Link
              href="/pokedex"
              className="inline-flex items-center gap-1 text-[12px] font-caption-label font-bold text-primary hover:underline uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Pokédex</span>
            </Link>
          </div>

          {/* Guest Status Banner */}
          <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-8 shadow-xl dark:shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
              <UserIcon className="w-8 h-8" />
            </div>

            <h1 className="font-headline-sm text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-2">
              Guest Trainer Mode
            </h1>

            <p className="max-w-md mx-auto text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              You are currently browsing ProtoDex without an active cloud account. Any favorites or caught Pokémon you mark are temporarily saved in your local browser storage.
            </p>

            {/* Guest Collection Summary */}
            <div className="flex items-center justify-center gap-4 max-w-sm mx-auto mb-8">
              <div className="flex-1 p-3 rounded-xl bg-surface-container-low border border-border-crisp text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400 mb-1">
                  <Bookmark className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
                </div>
                <div className="font-index-mono text-lg font-bold text-on-surface">{favorites.length}</div>
                <div className="font-caption-label text-[10px] text-on-surface-variant uppercase font-bold">
                  Favorites
                </div>
              </div>

              <div className="flex-1 p-3 rounded-xl bg-surface-container-low border border-border-crisp text-center">
                <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="font-index-mono text-lg font-bold text-on-surface">{caught.length}</div>
                <div className="font-caption-label text-[10px] text-on-surface-variant uppercase font-bold">
                  Caught
                </div>
              </div>
            </div>

            {/* Auth Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-caption-label font-bold uppercase tracking-wider shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-secondary hover:opacity-90 text-white text-xs font-caption-label font-bold uppercase tracking-wider shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Trainer Account</span>
              </Link>
            </div>

            <p className="text-[11px] text-on-surface-variant mt-4">
              ✨ Creating an account will automatically migrate all your local guest items to the cloud!
            </p>
          </div>

          {/* Backup & Recent Preview in Guest Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ExportImportSection />
            </div>
            <div className="md:col-span-2 flex flex-col gap-6">
              <CaughtTab />
              <FavoritesTab />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated Trainer Profile View
  return (
    <main className="min-h-screen bg-background text-on-surface px-4 sm:px-6 lg:px-8 pt-24 pb-12 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/pokedex"
            className="inline-flex items-center gap-1 text-[12px] font-caption-label font-bold text-primary hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Pokédex</span>
          </Link>

          <span className="font-index-mono text-xs text-on-surface-variant">
            ID: {user.id.slice(0, 8)}...
          </span>
        </div>

        {/* Trainer Header Card */}
        <UserInfoCard />

        {/* Collections & Backups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ExportImportSection />
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <CaughtTab />
            <FavoritesTab />
          </div>
        </div>

        {/* Security / Danger Zone */}
        <DeleteAccountSection />
      </div>
    </main>
  );
}
