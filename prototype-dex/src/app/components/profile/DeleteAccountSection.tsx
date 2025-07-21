"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        localStorage.removeItem("token");
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
      className="relative p-[2px] rounded-xl"
      style={{
        background: "linear-gradient(270deg, #ef4444, #f97316, #eab308, #ef4444)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="rounded-xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-xl p-6">
        {msg && <div className="text-green-400 mb-2">{msg}</div>}
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button
          className="w-full bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-red-700 transition font-medium"
          onClick={() => setShowModal(true)}
        >
          Delete my account
        </button>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[rgba(24,24,27,0.95)] backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
              <h4 className="text-lg font-bold text-red-400 mb-2">Are you sure?</h4>
              <p className="text-gray-300 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
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
    </div>
  );
}
