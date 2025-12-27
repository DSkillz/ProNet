"use client";

import { useState } from "react";
import { X, Globe, Users, Lock, Image as ImageIcon, Video, Smile, Loader2 } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi } from "@/lib/api";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

type Visibility = "PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE";

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
  const [error, setError] = useState("");

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError("");

    const result = await postsApi.create({ content: content.trim(), visibility });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setVisibility("PUBLIC");
    setIsSubmitting(false);
    onPostCreated();
    onClose();
  };

  if (!isOpen) return null;

  const SelectedVisibilityIcon = visibilityOptions.find(v => v.value === visibility)?.icon || Globe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Avatar name={userName} size="md" />
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
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="De quoi souhaitez-vous parler ?"
            className="w-full min-h-[200px] text-lg text-neutral-800 placeholder:text-neutral-400 outline-none resize-none"
            autoFocus
          />
          
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200">
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors" title="Ajouter une image">
              <ImageIcon className="h-5 w-5 text-neutral-500" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors" title="Ajouter une vidéo">
              <Video className="h-5 w-5 text-neutral-500" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors" title="Ajouter un emoji">
              <Smile className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
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
