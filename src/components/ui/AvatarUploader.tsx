"use client";

import React, { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Camera, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploaderProps {
  currentAvatar: string;
  onUploadSuccess: (url: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onUploadSuccess,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      // Create storage ref: avatars/{uid}/{timestamp}_{filename}
      const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Callback
      onUploadSuccess(downloadURL);
      toast.success("Avatar updated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Firebase Storage Upload Error:", error);
      
      // Check if it's a permission error
      if (error?.code === "storage/unauthorized") {
        toast.error("Upload restricted. Check Storage Security Rules/Credentials", { id: toastId });
      } else {
        toast.error("Error uploading image.", { id: toastId });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700/80 bg-slate-800 flex items-center justify-center transition-all duration-300 group-hover:border-violet-500 shadow-lg relative">
          {currentAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-slate-500" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <Camera className="w-6 h-6 text-slate-100" />
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={handleTriggerUpload}
        disabled={uploading}
        className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
      >
        Change profile photo
      </button>
    </div>
  );
};
