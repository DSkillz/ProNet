"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Image as ImageIcon,
  FileText,
  Video,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  Globe,
  Bookmark,
  TrendingUp,
  Users,
  Briefcase,
  X,
  Smile,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, Post } from "@/lib/api";

// Données fictives pour le feed
const posts = [
  {
    id: 1,
    author: {
      name: "Thomas Bernard",
      title: "Senior Developer @TechCorp",
      avatar: null,
    },
    timeAgo: "2h",
    content: `🚀 Très heureux d'annoncer le lancement de notre nouvelle API open-source !

Après 6 mois de travail, nous publions aujourd'hui une solution complète pour gérer l'authentification dans vos applications.

✅ OAuth 2.0 & OpenID Connect
✅ Multi-factor authentication
✅ Rate limiting intégré
✅ 100% TypeScript

Le repo est disponible sur GitHub. N'hésitez pas à contribuer ou à donner une ⭐ !

#OpenSource #TypeScript #Authentication #DevCommunity`,
    image: null,
    likes: 234,
    comments: 45,
    shares: 12,
    liked: false,
    saved: false,
  },
  {
    id: 2,
    author: {
      name: "Sophie Martin",
      title: "Product Manager @InnovateTech",
      avatar: null,
    },
    timeAgo: "5h",
    content: `J'ai récemment lu "Inspired" de Marty Cagan et je le recommande à tous les PMs ! 📚

Les points clés que j'ai retenus :
• L'importance de la discovery continue
• Pourquoi les roadmaps figées sont contre-productives
• Comment responsabiliser les équipes produit

Quel livre a le plus influencé votre façon de travailler ? 👇`,
    image: null,
    likes: 156,
    comments: 67,
    shares: 8,
    liked: true,
    saved: true,
  },
  {
    id: 3,
    author: {
      name: "Marie Dupont",
      title: "Développeuse Full Stack @TechCorp",
      avatar: null,
    },
    timeAgo: "1j",
    content: `🎉 Fière d'avoir contribué à React 19 !

Ma PR pour améliorer les performances du Suspense vient d'être mergée. C'est incroyable de voir son code dans un projet utilisé par des millions de développeurs.

Un grand merci à la communauté React pour le review et les feedbacks constructifs.

Si vous hésitez à contribuer à l'open-source, lancez-vous ! 💪`,
    image: "/images/react-contribution.png",
    likes: 892,
    comments: 124,
    shares: 56,
    liked: true,
    saved: false,
  },
];

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
  const [postContent, setPostContent] = useState("");
  const [postsState, setPostsState] = useState(posts);

  const toggleLike = (postId: number) => {
    setPostsState((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const toggleSave = (postId: number) => {
    setPostsState((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";
  const userInitials = user 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";

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
                  onClick={() => {}}
                >
                  Commencer une publication...
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                <button className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <ImageIcon className="h-5 w-5 text-secondary-500" />
                  <span className="hidden sm:inline text-sm font-medium">Photo</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Video className="h-5 w-5 text-primary-500" />
                  <span className="hidden sm:inline text-sm font-medium">Vidéo</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Calendar className="h-5 w-5 text-accent-500" />
                  <span className="hidden sm:inline text-sm font-medium">Événement</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <FileText className="h-5 w-5 text-red-500" />
                  <span className="hidden sm:inline text-sm font-medium">Article</span>
                </button>
              </div>
            </Card>

            {/* Séparateur avec tri */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-300" />
              <button className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
                Trier par : <span className="font-medium">Pertinence</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="flex-1 h-px bg-neutral-300" />
            </div>

            {/* Posts */}
            {postsState.map((post) => (
              <Card key={post.id} padding="none">
                {/* Header du post */}
                <div className="flex items-start justify-between p-4">
                  <div className="flex gap-3">
                    <Link href="/profile">
                      <Avatar name={post.author.name} size="md" />
                    </Link>
                    <div>
                      <Link href="/profile" className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline">
                        {post.author.name}
                      </Link>
                      <p className="text-sm text-neutral-500">{post.author.title}</p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        {post.timeAgo} • <Globe className="h-3 w-3" />
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

                {/* Image (si présente) */}
                {post.image && (
                  <div className="bg-neutral-100 aspect-video flex items-center justify-center border-y border-neutral-200">
                    <span className="text-neutral-400">📷 Image</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between px-4 py-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center justify-center w-5 h-5 bg-primary-500 rounded-full">
                      <ThumbsUp className="h-3 w-3 text-white" />
                    </span>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{post.comments} commentaires</span>
                    <span>{post.shares} partages</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-neutral-100 px-2 py-1">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      post.liked
                        ? "text-primary-500 bg-primary-50"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <ThumbsUp className={`h-5 w-5 ${post.liked ? "fill-current" : ""}`} />
                    <span className="font-medium">J'aime</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Commenter</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="font-medium">Partager</span>
                  </button>
                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                      post.saved
                        ? "text-accent-500 bg-accent-50"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${post.saved ? "fill-current" : ""}`} />
                    <span className="font-medium">Sauvegarder</span>
                  </button>
                </div>

                {/* Zone commentaire rapide */}
                <div className="border-t border-neutral-100 p-4">
                  <div className="flex gap-3">
                    <Avatar name="Marie Dupont" size="sm" />
                    <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full">
                      <input
                        type="text"
                        placeholder="Ajouter un commentaire..."
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                      <button className="text-neutral-400 hover:text-neutral-600">
                        <Smile className="h-5 w-5" />
                      </button>
                      <button className="text-primary-500 hover:text-primary-600">
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Loader */}
            <div className="text-center py-8">
              <Button variant="secondary">Charger plus de publications</Button>
            </div>
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
                  <a
                    key={index}
                    href="#"
                    className="block group"
                  >
                    <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-500 transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {news.source} • {news.timeAgo}
                    </p>
                  </a>
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
                    <a
                      key={index}
                      href="#"
                      className="flex items-center justify-between group"
                    >
                      <span className="font-medium text-neutral-900 group-hover:text-primary-500 transition-colors">
                        {topic.name}
                      </span>
                      <span className="text-xs text-neutral-500">{topic.posts}</span>
                    </a>
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
                      <p className="font-medium text-neutral-900 truncate">
                        {person.name}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {person.title}
                      </p>
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
                  <a
                    key={index}
                    href="#"
                    className="flex items-start gap-3 group"
                  >
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
                <a href="#" className="hover:text-primary-500">À propos</a>
                <a href="#" className="hover:text-primary-500">Accessibilité</a>
                <a href="#" className="hover:text-primary-500">Aide</a>
                <a href="#" className="hover:text-primary-500">Confidentialité</a>
                <a href="#" className="hover:text-primary-500">CGU</a>
              </div>
              <p>ProNet © 2024 - Open Source</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
