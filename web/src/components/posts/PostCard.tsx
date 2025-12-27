"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { Post, postsApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  currentUserName: string;
  onPostUpdated?: () => void;
}

export function PostCard({ post, currentUserName, onPostUpdated }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.userReaction === "LIKE");
  const [likesCount, setLikesCount] = useState(post._count.reactions);
  const [isSaved, setIsSaved] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt));

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
        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5 text-neutral-400" />
        </button>
      </div>

      {/* Contenu */}
      <div className="px-4 pb-4">
        <p className="text-neutral-800 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="bg-neutral-100 aspect-video flex items-center justify-center border-y border-neutral-200">
          {post.media[0].type === "IMAGE" ? (
            <img
              src={post.media[0].url}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          ) : (
            <video src={post.media[0].url} controls className="w-full h-full" />
          )}
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
          <span className="font-medium">J'aime</span>
        </button>
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Commenter</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Partager</span>
        </button>
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
            <Avatar name={currentUserName} size="sm" />
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
  );
}
