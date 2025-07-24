"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { logoutUser } from "@/app/utils/api"; // 1. Import the logoutUser API function

export default function ActionButtonsSection() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { logout } = useAuth();
  const router = useRouter();

  // 2. Updated handleLogout to be async and call the backend
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await logoutUser(token); // Invalidate the token on the backend
    }
    logout(); // Clear the user state from the context
    router.push("/login");
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Account deleted. Redirecting...");
        logout();
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } else {
        setError(data.error || "Failed to delete account.");
      }
    } catch {
      setError("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative p-[2px] rounded-xl mt-4"
      style={{
        background: "linear-gradient(270deg, #ef4444, #f97316, #eab308, #ef4444)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="rounded-xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto bg-blue-500/10 border-2 border-blue-400 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 duration-200 h-10 px-4 py-2"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
        
        {/* Delete Account Button */}
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto h-10 px-4 py-2"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[rgba(24,24,27,0.95)] backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h4 className="text-lg font-bold text-red-400 mb-2">Are you sure?</h4>
            <p className="text-gray-300 mb-4">This action is permanent and cannot be undone.</p>
            {msg && <div className="text-green-400 mb-2 text-sm">{msg}</div>}
            {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
            <div className="flex gap-2 mt-4">
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 h-10 px-4 py-2"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-1 h-10 px-4 py-2"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
