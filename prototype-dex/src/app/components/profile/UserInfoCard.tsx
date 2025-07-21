"use client";
import { useEffect, useRef, useState } from "react";
import { getProfile, updateProfile } from "@/app/utils/api";
import { Loader2, Camera, Eye, EyeOff, Pencil } from "lucide-react";
import Image from "next/image";

const DEFAULT_AVATAR = "/user.png";

export default function UserInfoCard() {
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<{ email: string; username: string } | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getProfile(token).then((res) => {
      if (res.data) {
        setProfile(res.data);
        setForm({ username: res.data.username, password: "" });
        if (res.data.avatar) setAvatarUrl(res.data.avatar);
      } else {
        setProfileError(res.error || "Failed to load profile.");
      }
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
        const token = localStorage.getItem("token");
        if (token) await updateProfile(token, { avatar: data.secure_url });
      } else {
        setAvatarError("Upload failed. Please try again.");
      }
    } catch {
      setAvatarError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setProfileError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setProfileError("You must be logged in to update your profile.");
      setLoading(false);
      return;
    }
    const updates: { username?: string; password?: string } = {};
    if (form.username !== profile?.username) updates.username = form.username;
    if (form.password) updates.password = form.password;

    const res = await updateProfile(token, updates);
    if (res.error) {
      setProfileError(res.error);
    } else {
      setMsg("Profile updated!");
      setProfile({ ...profile!, ...updates });
      setEdit(false);
      setForm({ ...form, password: "" });
    }
    setLoading(false);
  };

  if (profileError) return <div className="text-red-500">{profileError}</div>;
  if (!profile) return <div className="text-white">Loading...</div>;

  return (
    <div
      className="relative p-[3px] rounded-2xl"
      style={{
        background: "linear-gradient(270deg, #a855f7, #ec4899, #facc15, #a855f7)",
        backgroundSize: "600% 600%",
        animation: "gradient-move 6s ease infinite",
      }}
    >
      <div className="relative rounded-2xl bg-[rgba(24,24,27,0.85)] backdrop-blur-lg border border-white/10 shadow-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Avatar + Username + Email (left) */}
          <div className="flex items-center gap-6 flex-1">
            {/* Enhanced Avatar with Glowing Ring */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-300 blur-xl opacity-80 animate-pulse" />
              <button
                type="button"
                className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change avatar"
              >
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={96}
                  height={96}
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200 group-hover:opacity-80 transition"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition">
                  {uploading ? (
                    <Loader2 className="animate-spin text-white w-8 h-8" />
                  ) : (
                    <Camera className="text-white w-8 h-8" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload avatar"
              />
            </div>

            {/* Username & Email */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">
                  {profile.username}
                </h1>
                <button
                  className="ml-1 p-1 rounded hover:bg-white/10 transition"
                  title="Edit Profile"
                  onClick={() => setEdit(true)}
                >
                  <Pencil className="w-5 h-5 text-purple-400" />
                </button>
              </div>
              <p className="text-gray-300 text-lg">{profile.email}</p>
            </div>
          </div>

          {/* User Info (right) */}
          <div className="flex flex-col gap-3 min-w-[240px] items-end">
            {!edit ? (
              <>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-gray-400 font-medium">Email:</span>
                  <span className="text-white font-semibold">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-gray-400 font-medium">Password:</span>
                  <span className="text-white font-semibold">
                    {showPassword ? form.password || "•••••••••" : "•••••••••"}
                  </span>
                  <button
                    type="button"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    className="ml-2 text-xs text-purple-400 underline hover:text-purple-300"
                    onClick={() => setEdit(true)}
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 w-full">
                <div>
                  <label htmlFor="profile-username" className="block text-gray-400 text-sm mb-1">
                    Username:
                  </label>
                  <input
                    id="profile-username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="border border-white/20 px-3 py-2 rounded-lg w-full bg-black/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                    type="text"
                    required
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label htmlFor="profile-password" className="block text-gray-400 text-sm mb-1">
                    New Password:
                  </label>
                  <div className="relative">
                    <input
                      id="profile-password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="border border-white/20 px-3 py-2 rounded-lg w-full bg-black/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep current"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-white"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                    onClick={() => setEdit(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {msg && <div className="text-green-400 text-sm">{msg}</div>}
            {avatarError && <div className="text-red-400 text-sm">{avatarError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
