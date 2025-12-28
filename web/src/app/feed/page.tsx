"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Image as ImageIcon,
  FileText,
  Video,
  Calendar,
  Bookmark,
  Users,
  Briefcase,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, Post } from "@/lib/api";
import { CreatePostModal, PostCard } from "@/components/posts";

const suggestedConnections = [
  {
    name: "Léa Dubois",
    title: "UX Designer @DesignStudio",
    mutualConnections: 12,
  },
  {
    name: "Pierre Martin",
    title: "CTO @StartupXYZ",
    mutualConnections: 8,
  },
  {
    name: "Julie Chen",
    title: "Data Scientist @DataCorp",
    mutualConnections: 5,
  },
];

const trendingTopics = [
  { name: "#OpenSource", posts: "2,345 publications" },
  { name: "#TechRecrutement", posts: "1,892 publications" },
  { name: "#RemoteWork", posts: "1,456 publications" },
  { name: "#TypeScript", posts: "987 publications" },
  { name: "#GreenIT", posts: "654 publications" },
];

const newsItems = [
  {
    title: "Les tendances tech pour 2025",
    source: "ProNet Actualités",
    timeAgo: "3h",
  },
  {
    title: "L'IA générative transforme le recrutement",
    source: "Tech Insights",
    timeAgo: "6h",
  },
  {
    title: "Le remote work devient la norme en Europe",
    source: "Future of Work",
    timeAgo: "12h",
  },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";

  const fetchPosts = useCallback(async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    const result = await postsApi.getFeed(cursor);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      if (cursor) {
        setPosts((prev) => [...prev, ...result.data!.posts]);
      } else {
        setPosts(result.data.posts);
      }
      setNextCursor(result.data.nextCursor);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts(); // Refresh the feed
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar gauche - Mini profil */}
            <aside className="hidden lg:block">
              <Card padding="none" className="overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary-400 to-primary-600" />
                <div className="px-4 pb-4 -mt-8 text-center">
                  <Avatar name={userName} size="lg" className="ring-4 ring-white mx-auto" />
                  <h3 className="mt-2 font-semibold text-neutral-900">{userName}</h3>
                  <p className="text-sm text-neutral-500">{user?.headline || "Membre ProNet"}</p>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Vues du profil</span>
                      <span className="font-semibold text-primary-500">284</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-neutral-500">Connexions</span>
                      <span className="font-semibold text-primary-500">523</span>
                    </div>
                  </div>

                  <Link href="/profile" className="block mt-4">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir mon profil
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Raccourcis */}
              <Card className="mt-4">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Raccourcis</h4>
                <nav className="space-y-1">
                  <Link
                    href="/saved"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    <Bookmark className="h-4 w-4" />
                    Publications sauvegardées
                  </Link>
                  <Link
                    href="/groups"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    <Users className="h-4 w-4" />
                    Mes groupes
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    <Calendar className="h-4 w-4" />
                    Événements
                  </Link>
                </nav>
              </Card>
            </aside>

            {/* Feed principal */}
            <div className="lg:col-span-2 space-y-4">
              {/* Zone de création de post */}
              <Card>
                <div className="flex gap-3">
                  <Avatar name={userName} size="md" />
                  <button
                    className="flex-1 text-left px-4 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Commencer une publication...
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-secondary-500" />
                    <span className="hidden sm:inline text-sm font-medium">Photo</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Video className="h-5 w-5 text-primary-500" />
                    <span className="hidden sm:inline text-sm font-medium">Vidéo</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Calendar className="h-5 w-5 text-accent-500" />
                    <span className="hidden sm:inline text-sm font-medium">Événement</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="hidden sm:inline text-sm font-medium">Article</span>
                  </button>
                </div>
              </Card>

              {/* Séparateur avec tri */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-neutral-300" />
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Actualiser
                </button>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <Card className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={handleRefresh}>Réessayer</Button>
                </Card>
              )}

              {/* Empty state */}
              {!isLoading && !error && posts.length === 0 && (
                <Card className="text-center py-12">
                  <div className="text-neutral-400 mb-4">
                    <FileText className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    Aucune publication pour le moment
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    Soyez le premier à partager quelque chose !
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Créer une publication
                  </Button>
                </Card>
              )}

              {/* Posts */}
              {!isLoading && posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserName={userName}
                  currentUserAvatar={user?.avatarUrl}
                  onPostUpdated={handleRefresh}
                  onPostDeleted={handleRefresh}
                />
              ))}

              {/* Load more */}
              {nextCursor && !isLoading && (
                <div className="text-center py-4">
                  <Button
                    variant="secondary"
                    onClick={() => fetchPosts(nextCursor)}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </>
                    ) : (
                      "Charger plus de publications"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar droite */}
            <aside className="hidden lg:block space-y-4">
              {/* Actualités */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actualités ProNet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsItems.map((news, index) => (
                    <Link key={index} href={`/search?q=${encodeURIComponent(news.title)}`} className="block group">
                      <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-500 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {news.source} • {news.timeAgo}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Sujets tendances */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tendances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <Link key={index} href={`/search?q=${encodeURIComponent(topic.name)}`} className="flex items-center justify-between group">
                        <span className="font-medium text-neutral-900 group-hover:text-primary-500 transition-colors">
                          {topic.name}
                        </span>
                        <span className="text-xs text-neutral-500">{topic.posts}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions de connexions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Développez votre réseau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedConnections.map((person, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Avatar name={person.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{person.name}</p>
                        <p className="text-sm text-neutral-500 truncate">{person.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {person.mutualConnections} relations en commun
                        </p>
                        <Button size="sm" variant="secondary" className="mt-2">
                          Se connecter
                        </Button>
                      </div>
                      <button className="p-1 hover:bg-neutral-100 rounded">
                        <X className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>
                  ))}
                  <Link href="/network" className="block text-center text-sm text-primary-500 hover:underline">
                    Voir plus de suggestions
                  </Link>
                </CardContent>
              </Card>

              {/* Offres d'emploi */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Offres pour vous</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Lead Developer Frontend", company: "TechStartup", location: "Paris" },
                    { title: "Senior React Developer", company: "WebAgency", location: "Remote" },
                  ].map((job, index) => (
                    <a key={index} href="#" className="flex items-start gap-3 group">
                      <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 group-hover:text-primary-500 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {job.company} • {job.location}
                        </p>
                      </div>
                    </a>
                  ))}
                  <Link href="/jobs" className="block text-center text-sm text-primary-500 hover:underline">
                    Voir toutes les offres
                  </Link>
                </CardContent>
              </Card>

              {/* Footer sticky */}
              <div className="text-xs text-neutral-500 space-y-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <Link href="/about" className="hover:text-primary-500">À propos</Link>
                  <Link href="/privacy" className="hover:text-primary-500">Confidentialité</Link>
                  <Link href="/terms" className="hover:text-primary-500">CGU</Link>
                </div>
                <p>ProNet © 2024 - Open Source</p>
              </div>
            </aside>
          </div>
        </main>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
