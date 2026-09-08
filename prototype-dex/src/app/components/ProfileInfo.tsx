"use client";
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/app/utils/api";

interface Profile {
  email: string;
  username: string;
}

export default function ProfileInfo({ className = "" }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view your profile.");
      return;
    }
    getProfile(token).then((res) => {
      if (res.data) {
        setProfile(res.data as Profile);
        setForm({ email: res.data.email, username: res.data.username, password: "" });
      } else {
        setError(res.error || "Failed to load profile.");
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    const updates: { email?: string; username?: string; password?: string } = {};
    if (form.email !== profile?.email) updates.email = form.email;
    if (form.username !== profile?.username) updates.username = form.username;
    if (form.password) updates.password = form.password;

    const res = await updateProfile(updates);
    if (res.error) {
      setError(res.error);
    } else {
      setMsg("Profile updated!");
      setProfile({ ...profile!, ...updates });
      setEdit(false);
      setForm({ ...form, password: "" });
    }
    setLoading(false);
  };

  if (error) {
    return <div className="mb-4 text-red-500">{error}</div>;
  }

  if (!profile) return <div>Loading profile...</div>;

  return (
    <section className={`bg-gray-50 dark:bg-gray-800 rounded-xl shadow p-4 mb-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
      {msg && <div className="mb-2 text-green-600">{msg}</div>}
      {!edit ? (
        <div className="space-y-2">
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          <div>
            <strong>Username:</strong> {profile.username}
          </div>
          <button
            className="mt-2 px-4 py-1 rounded bg-purple-600 text-white"
            onClick={() => setEdit(true)}
          >
            Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label htmlFor="profile-email" className="block">Email:</label>
            <input
              id="profile-email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
              type="email"
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="profile-username" className="block">Username:</label>
            <input
              id="profile-username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
              type="text"
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="profile-password" className="block">New Password:</label>
            <input
              id="profile-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
              type="password"
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-1 rounded bg-green-600 text-white"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="ml-2 px-4 py-1 rounded bg-gray-300"
            onClick={() => setEdit(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      )}
    </section>
  );
}
