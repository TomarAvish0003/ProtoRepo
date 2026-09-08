"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { deleteAccountApi } from "@/app/utils/api";
import { toast } from "sonner";
import { LogOut, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await deleteAccountApi();
      if (res.error) {
        toast.error(res.error);
        setDeleting(false);
        return;
      }

      toast.success("Trainer account permanently deleted.");
      await logout();
      router.push("/register");
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Session & Account Security
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Safely end your current session or manage permanent account deletion.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase tracking-wider text-on-surface transition-colors snappy-btn"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <LogOut className="w-4 h-4 text-primary" />
              )}
              <span>Log Out</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-caption-label font-bold uppercase tracking-wider text-red-600 dark:text-red-400 transition-colors snappy-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-charcoal-surface border border-border-crisp p-6 shadow-2xl text-on-surface">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">Delete Trainer Account?</h3>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              This action is permanent and cannot be undone. All your favorited Pokémon, caught field records, and personal account data will be permanently wiped from the database.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase text-on-surface-variant transition-colors snappy-btn"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-caption-label font-bold uppercase shadow-sm transition-colors snappy-btn"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
