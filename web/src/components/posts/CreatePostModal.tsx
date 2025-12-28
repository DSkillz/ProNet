"use client";

import { useState, useRef } from "react";
import { X, Globe, Users, Lock, Image as ImageIcon, Video, Loader2, XCircle } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, uploadApi } from "@/lib/api";
import Image from "next/image";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

type Visibility = "PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
  file?: File;
}

const visibilityOptions = [
  { value: "PUBLIC" as Visibility, label: "Tout le monde", icon: Globe, description: "Visible par tous" },
  { value: "CONNECTIONS_ONLY" as Visibility, label: "Connexions uniquement", icon: Users, description: "Vos connexions seulement" },
  { value: "PRIVATE" as Visibility, label: "Privé", icon: Lock, description: "Seulement vous" },
];

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "VIDEO") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxFiles = 10 - mediaItems.length;
    const selectedFiles = Array.from(files).slice(0, maxFiles);

    if (selectedFiles.length === 0) {
      setError("Vous avez atteint le maximum de 10 médias");
      return;
    }

    // Validate file sizes
    const maxSize = type === "IMAGE" ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
    const invalidFiles = selectedFiles.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Fichiers trop volumineux (max ${type === "IMAGE" ? "5 Mo" : "100 Mo"})`);
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const result = await uploadApi.uploadPostMedia(selectedFiles);

      if (result.error) {
        setError(result.error);
      } else if (result.data?.media) {
        const newMedia: MediaItem[] = result.data.media.map((m) => ({
          url: m.url,
          type: m.type as "IMAGE" | "VIDEO",
        }));
        setMediaItems([...mediaItems, ...newMedia]);
      }
    } catch {
      setError("Erreur lors de l'upload des fichiers");
    }

    setIsUploading(false);

    // Reset input
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) return;

    setIsSubmitting(true);
    setError("");

    const media = mediaItems.length > 0
      ? mediaItems.map(m => ({ url: m.url, type: m.type }))
      : undefined;

    const result = await postsApi.create({
      content: content.trim(),
      visibility,
      media,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setVisibility("PUBLIC");
    setMediaItems([]);
    setIsSubmitting(false);
    onPostCreated();
    onClose();
  };

  const handleClose = () => {
    setContent("");
    setVisibility("PUBLIC");
    setMediaItems([]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const SelectedVisibilityIcon = visibilityOptions.find(v => v.value === visibility)?.icon || Globe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={userName} size="md" />
            <div>
              <p className="font-semibold text-neutral-900">{userName}</p>
              <div className="relative">
                <button
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 px-2 py-0.5 rounded"
                >
                  <SelectedVisibilityIcon className="h-3.5 w-3.5" />
                  <span>{visibilityOptions.find(v => v.value === visibility)?.label}</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Visibility dropdown */}
                {showVisibilityMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-48 z-10">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value);
                          setShowVisibilityMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-100 ${
                          visibility === option.value ? "bg-primary-50" : ""
                        }`}
                      >
                        <option.icon className="h-4 w-4 text-neutral-500" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{option.label}</p>
                          <p className="text-xs text-neutral-500">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-auto">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="De quoi souhaitez-vous parler ?"
            className="w-full min-h-[120px] text-lg text-neutral-800 placeholder:text-neutral-400 outline-none resize-none"
            autoFocus
          />

          {/* Media Preview */}
          {mediaItems.length > 0 && (
            <div className={`grid gap-2 mt-4 ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {mediaItems.map((media, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden bg-neutral-100">
                  {media.type === "IMAGE" ? (
                    <Image
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-48 object-cover"
                      controls
                    />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Upload en cours...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200">
          <div className="flex items-center gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => handleMediaSelect(e, "IMAGE")}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              multiple
              onChange={(e) => handleMediaSelect(e, "VIDEO")}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading || mediaItems.length >= 10}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50"
              title="Ajouter une image"
            >
              <ImageIcon className="h-5 w-5 text-neutral-500" />
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading || mediaItems.length >= 10}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50"
              title="Ajouter une vidéo"
            >
              <Video className="h-5 w-5 text-neutral-500" />
            </button>
            {mediaItems.length > 0 && (
              <span className="text-xs text-neutral-500 ml-2">
                {mediaItems.length}/10 fichiers
              </span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && mediaItems.length === 0) || isSubmitting || isUploading}
            className="min-w-24"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Publier"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
