'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    setErrorMsg(null);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
      setSubmitting(false);
    } else {
      router.push('/profile');
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-on-surface transition-colors">
      <div className="w-full max-w-md bg-charcoal-surface border border-border-crisp rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5 pb-4 border-b border-border-crisp">
          <div className="flex items-center justify-between">
            <span className="font-caption-label text-[10px] text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
              TRAINER OS // AUTH
            </span>
            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>HTTPONLY SECURED</span>
            </div>
          </div>
          <h1 className="font-headline-sm text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            Sign In to ProtoDex
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant">
            Access your caught Pokémon, priority bookmarks, and synchronized research data.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 font-caption-label text-[12px] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-600 dark:text-red-400">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-caption-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="trainer@protodex.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface-container-low border border-border-crisp text-on-surface font-body-sm text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-caption-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-surface-container-low border border-border-crisp text-on-surface font-body-sm text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-primary hover:opacity-90 text-white font-caption-label text-[12px] font-bold uppercase tracking-wider py-3 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 snappy-btn disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Field Terminal</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-border-crisp flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-body-sm text-[12px] text-on-surface-variant">
          <span>New researcher?</span>
          <Link
            href="/register"
            className="text-secondary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Create Trainer ID</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
