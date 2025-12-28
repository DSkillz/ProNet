"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Card } from "@/components/ui";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  ArrowLeft,
  Loader2,
  Send,
  MoreHorizontal,
  Heart,
  Edit3,
  Trash2,
  Link as LinkIcon,
  Flag,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  parentId?: string | null;
  replies?: Comment[];
  _count?: {
    replies: number;
    reactions: number;
  };
}

interface Media {
  url: string;
  type: string;
}

interface Post {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  media?: Media[];
  _count: {
    comments: number;
    reactions: number;
  };
  userReaction?: string | null;
  hasReacted?: boolean;
  hasSaved?: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?.id === post?.author.id;

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPost = async () => {
    setIsLoading(true);
    const response = await postsApi.getById(postId);
    if (response.data) {
      const postData = response.data as Post;
      setPost({
        ...postData,
        hasReacted: postData.userReaction === "LIKE",
      });
    } else {
      setError(response.error || "Publication introuvable");
    }
    setIsLoading(false);
  };

  const handleReact = async () => {
    if (!post) return;
    setActionLoading("react");

    const response = post.hasReacted
      ? await postsApi.unreact(post.id)
      : await postsApi.react(post.id, "LIKE");

    if (!response.error) {
      setPost({
        ...post,
        hasReacted: !post.hasReacted,
        _count: {
          ...post._count,
          reactions: post.hasReacted ? post._count.reactions - 1 : post._count.reactions + 1,
        },
      });
    }
    setActionLoading(null);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    setIsSubmitting(true);
    const response = await postsApi.comment(post.id, commentText);
    if (response.data) {
      setPost({
        ...post,
        comments: [response.data as Comment, ...post.comments],
        _count: {
          ...post._count,
          comments: post._count.comments + 1,
        },
      });
      setCommentText("");
    }
    setIsSubmitting(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !replyingTo || !replyText.trim()) return;

    setIsReplying(true);
    const response = await postsApi.comment(post.id, replyText, replyingTo.id);
    if (response.data) {
      // Add reply to the parent comment
      const updatedComments = post.comments.map((c) =>
        c.id === replyingTo.id
          ? {
              ...c,
              replies: [...(c.replies || []), response.data as Comment],
              _count: {
                ...c._count,
                replies: (c._count?.replies || 0) + 1,
                reactions: c._count?.reactions || 0,
              },
            }
          : c
      );
      setPost({
        ...post,
        comments: updatedComments,
        _count: {
          ...post._count,
          comments: post._count.comments + 1,
        },
      });
      setReplyText("");
      setReplyingTo(null);
    }
    setIsReplying(false);
  };

  const handleEdit = async () => {
    if (!post || !editContent.trim() || isEditing) return;
    setIsEditing(true);

    const result = await postsApi.update(post.id, { content: editContent.trim() });
    if (!result.error) {
      setPost({ ...post, content: editContent.trim() });
      setShowEditModal(false);
    }

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!post || isDeleting) return;
    setIsDeleting(true);

    const result = await postsApi.delete(post.id);
    if (!result.error) {
      router.push("/feed");
    }

    setIsDeleting(false);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/posts/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;
    const authorName = post ? `${post.author.firstName} ${post.author.lastName}` : "Utilisateur";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${authorName}`,
          text: post?.content.substring(0, 100),
          url,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-6">
            <Card className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !post) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <MessageCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Publication introuvable</h2>
              <p className="text-neutral-500 mb-6">{error}</p>
              <Link href="/feed">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au fil
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 py-6">
          {/* Back button */}
          <Link href="/feed" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au fil
          </Link>

          {/* Post */}
          <Card className="mb-6">
            {/* Author */}
            <div className="flex items-start gap-3 mb-4">
              <Link href={`/profile/${post.author.id}`}>
                <Avatar
                  name={`${post.author.firstName} ${post.author.lastName}`}
                  src={post.author.avatarUrl}
                  size="md"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-semibold text-neutral-900 hover:underline"
                >
                  {post.author.firstName} {post.author.lastName}
                </Link>
                {post.author.headline && (
                  <p className="text-sm text-neutral-500 truncate">{post.author.headline}</p>
                )}
                <p className="text-xs text-neutral-400">
                  {formatDistanceToNow(new Date(post.createdAt))}
                </p>
              </div>

              {/* Menu */}
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
                      <span className="text-sm">{copied ? "Lien copié !" : "Copier le lien"}</span>
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

            {/* Content */}
            <p className="text-neutral-800 whitespace-pre-line mb-4">{post.content}</p>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className={`mb-4 rounded-lg overflow-hidden ${post.media.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
                {post.media.map((media, index) => (
                  <div key={index} className={`bg-neutral-100 ${post.media!.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                    {media.type === "IMAGE" ? (
                      <Image
                        src={media.url}
                        alt={`Media ${index + 1}`}
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
            {(post._count.reactions > 0 || post._count.comments > 0) && (
              <div className="flex items-center gap-4 text-sm text-neutral-500 pb-3 border-b border-neutral-200">
                {post._count.reactions > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    {post._count.reactions}
                  </span>
                )}
                {post._count.comments > 0 && (
                  <span>{post._count.comments} commentaires</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2">
              <button
                onClick={handleReact}
                disabled={actionLoading === "react"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  post.hasReacted
                    ? "text-primary-600 bg-primary-50"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <ThumbsUp className={`h-5 w-5 ${post.hasReacted ? "fill-primary-600" : ""}`} />
                <span className="text-sm font-medium">J&apos;aime</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Commenter</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">{copied ? "Copié !" : "Partager"}</span>
              </button>
            </div>
          </Card>

          {/* Comment form */}
          <Card className="mb-6">
            <form onSubmit={handleComment} className="flex gap-3">
              <Avatar
                name={user ? `${user.firstName} ${user.lastName}` : "User"}
                src={user?.avatarUrl}
                size="sm"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="rounded-full"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </Card>

          {/* Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <Card key={comment.id}>
                  <div className="flex gap-3">
                    <Link href={`/profile/${comment.author.id}`}>
                      <Avatar
                        name={`${comment.author.firstName} ${comment.author.lastName}`}
                        src={comment.author.avatarUrl}
                        size="sm"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="bg-neutral-50 rounded-lg px-4 py-2">
                        <Link
                          href={`/profile/${comment.author.id}`}
                          className="font-medium text-sm text-neutral-900 hover:underline"
                        >
                          {comment.author.firstName} {comment.author.lastName}
                        </Link>
                        <p className="text-neutral-700 text-sm mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                        <button className="hover:underline hover:text-primary-500">J&apos;aime</button>
                        <button
                          onClick={() => setReplyingTo(replyingTo?.id === comment.id ? null : comment)}
                          className="hover:underline hover:text-primary-500"
                        >
                          Répondre
                        </button>
                        <span>{formatDistanceToNow(new Date(comment.createdAt))}</span>
                      </div>

                      {/* Reply form */}
                      {replyingTo?.id === comment.id && (
                        <form onSubmit={handleReply} className="flex gap-2 mt-3">
                          <Avatar
                            name={user ? `${user.firstName} ${user.lastName}` : "User"}
                            src={user?.avatarUrl}
                            size="xs"
                          />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Répondre à ${comment.author.firstName}...`}
                              className="flex-1 px-3 py-1.5 text-sm border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                              autoFocus
                            />
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!replyText.trim() || isReplying}
                              className="rounded-full"
                            >
                              {isReplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                            </Button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-neutral-100">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Link href={`/profile/${reply.author.id}`}>
                                <Avatar
                                  name={`${reply.author.firstName} ${reply.author.lastName}`}
                                  src={reply.author.avatarUrl}
                                  size="xs"
                                />
                              </Link>
                              <div className="flex-1">
                                <div className="bg-neutral-50 rounded-lg px-3 py-1.5">
                                  <Link
                                    href={`/profile/${reply.author.id}`}
                                    className="font-medium text-xs text-neutral-900 hover:underline"
                                  >
                                    {reply.author.firstName} {reply.author.lastName}
                                  </Link>
                                  <p className="text-neutral-700 text-xs mt-0.5">{reply.content}</p>
                                </div>
                                <span className="text-xs text-neutral-400 mt-0.5 block">
                                  {formatDistanceToNow(new Date(reply.createdAt))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

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
    </ProtectedRoute>
  );
}
