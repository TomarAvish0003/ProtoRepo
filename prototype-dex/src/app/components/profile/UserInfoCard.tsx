"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { updateProfile } from "@/app/utils/api";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  ShieldCheck,
  Calendar,
  Mail,
  User as UserIcon,
  Check,
  X,
} from "lucide-react";

const DEFAULT_AVATAR = "/user.png";

export default function UserInfoCard() {
  const { user, refreshProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || DEFAULT_AVATAR);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: user?.username || "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Avatar upload service is not configured.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
        const updateRes = await updateProfile({ avatar: data.secure_url });
        if (updateRes.error) {
          toast.error(updateRes.error);
        } else {
          toast.success("Avatar updated!");
          await refreshProfile();
        }
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updates: { username?: string; password?: string } = {};
    if (form.username && form.username !== user.username) {
      updates.username = form.username;
    }
    if (form.password) {
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        setSaving(false);
        return;
      }
      updates.password = form.password;
    }

    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      setSaving(false);
      return;
    }

    const res = await updateProfile(updates);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Trainer profile updated!");
      await refreshProfile();
      setEditMode(false);
      setForm({ username: res.data?.username || form.username, password: "" });
    }
    setSaving(false);
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Trainer";

  return (
    <div className="rounded-2xl bg-charcoal-surface border border-border-crisp p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar + Trainer Name */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Avatar Well */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-surface-container-low shadow-sm flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt={user.username}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              title="Change trainer avatar"
              type="button"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-secondary" />
              ) : (
                <Camera className="w-6 h-6 text-white drop-shadow" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Trainer Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-caption-label font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Trainer</span>
              </span>
            </div>

            <h1 className="font-headline-sm text-2xl sm:text-3xl font-bold tracking-tight text-on-surface capitalize">
              {user.username}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-body-sm text-on-surface-variant mt-1">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-secondary" />
                <span>{user.email}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>Joined {formattedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Edit Button or Form */}
        <div>
          {!editMode ? (
            <button
              onClick={() => {
                setForm({ username: user.username, password: "" });
                setEditMode(true);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase tracking-wider text-on-surface transition-colors snappy-btn"
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 min-w-[280px]">
              <div>
                <label className="block text-[11px] font-caption-label font-bold uppercase text-on-surface-variant mb-1">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm bg-surface-container-low border border-border-crisp text-on-surface focus:outline-none focus:border-secondary"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-caption-label font-bold uppercase text-on-surface-variant mb-1">
                  New Password (optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-3 pr-9 py-1.5 rounded-lg text-sm bg-surface-container-low border border-border-crisp text-on-surface focus:outline-none focus:border-secondary"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-caption-label font-bold uppercase shadow-xs transition-colors snappy-btn"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-slate-panel border border-border-crisp text-xs font-caption-label font-bold uppercase text-on-surface-variant transition-colors snappy-btn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
