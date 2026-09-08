"use client";

import { useEffect, useRef, useState } from "react";
import { getProfile, updateProfile } from "@/app/utils/api";
import { Loader2, Camera } from "lucide-react"; // If using lucide icons

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const DEFAULT_AVATAR = "/user.png";

export default function AvatarUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getProfile(token).then((res) => {
      if (res.data?.avatar) setAvatarUrl(res.data.avatar);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
        await updateProfile({ avatar: data.secure_url });
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Decorative background glow */}
      <div
        className="absolute -top-8 -left-8 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-300 via-pink-200 to-yellow-100 opacity-40 blur-2xl -z-10"
        aria-hidden="true"
      />
      {/* Avatar */}
      <button
        type="button"
        className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Change avatar"
      >
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 object-cover border-4 border-primary shadow-lg transition group-hover:opacity-80"
        />
        {/* Overlay */}
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
      {uploading && <div className="text-primary mt-2 text-sm">Uploading...</div>}
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
}
