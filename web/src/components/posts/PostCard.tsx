"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Send,
  Smile,
  Loader2,
  Edit3,
  Trash2,
  Flag,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { Avatar, Card, Button } from "@/components/ui";
import { Post, postsApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: Post;
  currentUserName: string;
  currentUserAvatar?: string;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, currentUserName, currentUserAvatar, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.userReaction === "LIKE");
  const [likesCount, setLikesCount] = useState(post._count.reactions);
  const [isSaved, setIsSaved] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt));
  const isAuthor = user?.id === post.author.id;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (isReacting) return;
    setIsReacting(true);

    if (isLiked) {
      const result = await postsApi.removeReaction(post.id);
      if (!result.error) {
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } else {
      const result = await postsApi.react(post.id, "LIKE");
      if (!result.error) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }

    setIsReacting(false);
  };

  const handleComment = async () => {
    if (!comment.trim() || isCommenting) return;
    setIsCommenting(true);

    const result = await postsApi.comment(post.id, comment.trim());
    if (!result.error) {
      setComment("");
      setShowCommentInput(false);
      if (onPostUpdated) onPostUpdated();
    }

    setIsCommenting(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || isEditing) return;
    setIsEditing(true);

    const result = await postsApi.update(post.id, { content: editContent.trim() });
    if (!result.error) {
      setShowEditModal(false);
      if (onPostUpdated) onPostUpdated();
    }

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    const result = await postsApi.delete(post.id);
    if (!result.error) {
      setShowDeleteConfirm(false);
      if (onPostDeleted) onPostDeleted();
    }

    setIsDeleting(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${authorName}`,
          text: post.content.substring(0, 100),
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case "CONNECTIONS_ONLY":
        return <Users className="h-3 w-3" />;
      case "PRIVATE":
        return <Lock className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <>
      <Card padding="none">
        {/* Header du post */}
        <div className="flex items-start justify-between p-4">
          <div className="flex gap-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar
                name={authorName}
                src={post.author.avatarUrl}
                size="md"
              />
            </Link>
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
              >
                {authorName}
              </Link>
              <p className="text-sm text-neutral-500">{post.author.headline || "Membre ProNet"}</p>
              <p className="text-xs text-neutral-400 flex items-center gap-1">
                {timeAgo} • {getVisibilityIcon()}
              </p>
            </div>
          </div>

          {/* Menu options */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="h-5 w-5 text-neutral-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-48 z-20">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setEditContent(post.content);
                        setShowEditModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-100"
                    >
                      <Edit3 className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm">Modifier</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Supprimer</span>
                    </button>
                    <div className="border-t border-neutral-100 my-1" />
                  </>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    copyLink();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-100"
                >
                  <LinkIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">Copier le lien</span>
                </button>
                {!isAuthor && (
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-100 text-orange-600"
                  >
                    <Flag className="h-4 w-4" />
                    <span className="text-sm">Signaler</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="px-4 pb-4">
          <p className="text-neutral-800 whitespace-pre-line">{post.content}</p>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`border-y border-neutral-200 ${post.media.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
            {post.media.map((media, index) => (
              <div key={index} className={`bg-neutral-100 ${post.media!.length === 1 ? 'aspect-video' : 'aspect-square'} flex items-center justify-center`}>
                {media.type === "IMAGE" ? (
                  <Image
                    src={media.url}
                    alt={`Post media ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video src={media.url} controls className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between px-4 py-2 text-sm text-neutral-500">
          <div className="flex items-center gap-1">
            <span className="flex items-center justify-center w-5 h-5 bg-primary-500 rounded-full">
              <ThumbsUp className="h-3 w-3 text-white" />
            </span>
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="hover:text-primary-500 hover:underline"
            >
              {post._count.comments} commentaires
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-2 py-1">
          <button
            onClick={handleLike}
            disabled={isReacting}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              isLiked
                ? "text-primary-500 bg-primary-50"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {isReacting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ThumbsUp className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            )}
            <span className="font-medium">J&apos;aime</span>
          </button>
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Commenter</span>
          </button>
          <div className="relative flex-1" ref={shareMenuRef}>
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span className="font-medium">Partager</span>
            </button>
            {showShareMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 px-4 z-20">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 text-sm text-neutral-700 hover:text-primary-500"
                >
                  <LinkIcon className="h-4 w-4" />
                  {copied ? "Lien copié !" : "Copier le lien"}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              isSaved
                ? "text-accent-500 bg-accent-50"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            <span className="font-medium">Sauvegarder</span>
          </button>
        </div>

        {/* Zone commentaire */}
        {showCommentInput && (
          <div className="border-t border-neutral-100 p-4">
            <div className="flex gap-3">
              <Avatar name={currentUserName} src={currentUserAvatar} size="sm" />
              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button className="text-neutral-400 hover:text-neutral-600">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={handleComment}
                  disabled={!comment.trim() || isCommenting}
                  className="text-primary-500 hover:text-primary-600 disabled:opacity-50"
                >
                  {isCommenting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold">Modifier la publication</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[150px] text-neutral-800 outline-none resize-none border border-neutral-200 rounded-lg p-3"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-neutral-200">
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={!editContent.trim() || isEditing}>
                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">Supprimer la publication ?</h3>
            <p className="text-neutral-600 text-sm mb-6">
              Cette action est irréversible. La publication sera définitivement supprimée.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
