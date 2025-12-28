"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Camera, ImagePlus, Trash2 } from "lucide-react";
import { Button, Input, Avatar } from "@/components/ui";
import { User, usersApi, uploadApi } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: (user: User) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    headline: user.headline || "",
    location: user.location || "",
    about: user.about || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);
  const [error, setError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        headline: user.headline || "",
        location: user.location || "",
        about: user.about || "",
      });
      setAvatarUrl(user.avatarUrl || "");
      setBannerUrl(user.bannerUrl || "");
      setError("");
    }
  }, [isOpen, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    const result = await uploadApi.uploadAvatar(file);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setAvatarUrl(result.data.avatarUrl);
    }

    setIsUploadingAvatar(false);
    // Reset input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner une image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setIsUploadingBanner(true);
    setError("");

    const result = await uploadApi.uploadBanner(file);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setBannerUrl(result.data.bannerUrl);
    }

    setIsUploadingBanner(false);
    // Reset input
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    setError("");

    const result = await uploadApi.deleteAvatar();

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl("");
    }

    setIsDeletingAvatar(false);
  };

  const handleDeleteBanner = async () => {
    setIsDeletingBanner(true);
    setError("");

    const result = await uploadApi.deleteBanner();

    if (result.error) {
      setError(result.error);
    } else {
      setBannerUrl("");
    }

    setIsDeletingBanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await usersApi.updateProfile(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.data) {
      // Merge the uploaded URLs with the returned data
      onProfileUpdated({
        ...result.data,
        avatarUrl: avatarUrl || result.data.avatarUrl,
        bannerUrl: bannerUrl || result.data.bannerUrl,
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-neutral-900">Modifier le profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Banner Upload */}
          <div className="relative">
            <div
              className="h-24 rounded-lg bg-gradient-to-r from-primary-400 to-primary-600 overflow-hidden cursor-pointer group"
              onClick={() => bannerInputRef.current?.click()}
              style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4">
                {isUploadingBanner || isDeletingBanner ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
            {bannerUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBanner();
                }}
                disabled={isDeletingBanner}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                title="Supprimer la bannière"
              >
                {isDeletingBanner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 mt-1 text-center">Cliquez pour modifier la bannière</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center -mt-12 relative z-10">
            <div className="relative">
              <div
                className="cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar
                  src={avatarUrl}
                  name={`${formData.firstName} ${formData.lastName}`}
                  size="xl"
                />
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  {isUploadingAvatar || isDeletingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAvatar();
                  }}
                  disabled={isDeletingAvatar}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                  title="Supprimer la photo"
                >
                  {isDeletingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 mt-1">Cliquez pour modifier la photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Titre professionnel"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="ex: Développeur Full Stack | React, Node.js"
          />

          <Input
            label="Localisation"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="ex: Paris, France"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              À propos
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Parlez de vous, de votre parcours et de vos aspirations..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={5}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingAvatar || isUploadingBanner || isDeletingAvatar || isDeletingBanner}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
