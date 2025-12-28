"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Badge, Avatar } from "@/components/ui";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Search,
  Trash2,
  Eye,
  Flag,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Post {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  _count: {
    comments: number;
    reactions: number;
  };
}

export default function AdminPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_URL}/api/admin/posts?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Supprimer cette publication ?")) return;

    setActionLoading(postId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user && (user as any).role !== "ADMIN" && (user as any).role !== "MODERATOR") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-12">
            <Card className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Acces refuse</h1>
              <p className="text-neutral-500">Cette page est reservee aux administrateurs.</p>
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

        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Moderation des publications</h1>
                <p className="text-neutral-500">{posts.length} publications au total</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par contenu ou auteur..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </Card>

          {/* Posts list */}
          {isLoading ? (
            <Card className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Aucune publication trouvee</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={`${post.author.firstName} ${post.author.lastName}`}
                      src={post.author.avatarUrl}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {post.author.firstName} {post.author.lastName}
                        </Link>
                        <Badge variant="neutral" size="sm">
                          {post.visibility}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-500 mb-2">
                        {formatDistanceToNow(new Date(post.createdAt))}
                      </p>
                      <p className="text-neutral-700 line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                        <span>{post._count.reactions} reactions</span>
                        <span>{post._count.comments} commentaires</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        disabled={actionLoading === post.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
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
