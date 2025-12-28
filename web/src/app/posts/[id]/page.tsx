"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Card, CardContent } from "@/components/ui";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  ArrowLeft,
  Loader2,
  Send,
  MoreHorizontal,
  Heart,
  Bookmark,
  Flag,
} from "lucide-react";
import Link from "next/link";
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
}

interface Post {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  _count: {
    comments: number;
    reactions: number;
  };
  hasReacted?: boolean;
  hasSaved?: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setIsLoading(true);
    const response = await postsApi.getById(postId);
    if (response.data) {
      setPost(response.data as Post);
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
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <MoreHorizontal className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            {/* Content */}
            <p className="text-neutral-800 whitespace-pre-line mb-4">{post.content}</p>

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
                <span className="text-sm font-medium">J'aime</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Commenter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">Partager</span>
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
                  isLoading={isSubmitting}
                  className="rounded-full"
                >
                  <Send className="h-4 w-4" />
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
                        <button className="hover:underline">J'aime</button>
                        <button className="hover:underline">Repondre</button>
                        <span>{formatDistanceToNow(new Date(comment.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
