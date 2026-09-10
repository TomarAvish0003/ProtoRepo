'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const [username, setUsername] = useState('');
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
    if (!username || !email || !password) return;

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const result = await register(username, email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Registration failed. Please check inputs.');
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
              PROTODEX // NEW TRAINER
            </span>
            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>BCRYPT SECURED</span>
            </div>
          </div>
          <h1 className="font-headline-sm text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            Create Trainer Profile
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant">
            Establish your official Pokémon researcher credentials on ProtoDex.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 font-caption-label text-[12px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="font-caption-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
            >
              Trainer Call-Sign (Username)
            </label>
            <input
              id="username"
              type="text"
              placeholder="Red_PalletTown"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className="bg-surface-container-low border border-border-crisp text-on-surface font-body-sm text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
            <span className="font-caption-label text-[10px] text-on-surface-variant">
              3-30 characters (letters, numbers, underscores only)
            </span>
          </div>

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
            <label
              htmlFor="password"
              className="font-caption-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-surface-container-low border border-border-crisp text-on-surface font-body-sm text-[14px] px-3.5 py-2.5 rounded-lg outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
            <span className="font-caption-label text-[10px] text-on-surface-variant">
              Min. 8 characters with at least one letter and one number
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-primary hover:opacity-90 text-white font-caption-label text-[12px] font-bold uppercase tracking-wider py-3 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 snappy-btn disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Registering Profile...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Trainer Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-border-crisp flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-body-sm text-[12px] text-on-surface-variant">
          <span>Already registered?</span>
          <Link
            href="/login"
            className="text-secondary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
