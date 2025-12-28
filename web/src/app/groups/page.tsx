"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Avatar, Badge, Input } from "@/components/ui";
import {
  Users,
  Search,
  Plus,
  Globe,
  Lock,
  MessageSquare,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl?: string;
  isPrivate: boolean;
  category: string;
  isJoined: boolean;
  recentActivity?: string;
}

// Mock data - à remplacer par API
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Développeurs React France",
    description: "Communauté des développeurs React en France. Partagez vos connaissances, posez vos questions.",
    memberCount: 12500,
    isPrivate: false,
    category: "Technologie",
    isJoined: true,
    recentActivity: "5 nouvelles publications aujourd'hui",
  },
  {
    id: "2",
    name: "Entrepreneurs Tech",
    description: "Réseau d'entrepreneurs dans le secteur technologique. Échangez sur vos expériences et opportunités.",
    memberCount: 8300,
    isPrivate: false,
    category: "Entrepreneuriat",
    isJoined: true,
    recentActivity: "Discussion active sur le financement",
  },
  {
    id: "3",
    name: "UX/UI Designers",
    description: "Pour tous les designers UX et UI. Critiques de designs, ressources et opportunités.",
    memberCount: 5200,
    isPrivate: false,
    category: "Design",
    isJoined: false,
  },
  {
    id: "4",
    name: "Data Science & ML",
    description: "Machine Learning, Data Science, IA. Discussions techniques et partage de projets.",
    memberCount: 9800,
    isPrivate: false,
    category: "Technologie",
    isJoined: false,
  },
  {
    id: "5",
    name: "Recruteurs IT",
    description: "Groupe privé pour les recruteurs du secteur IT.",
    memberCount: 1200,
    isPrivate: true,
    category: "Recrutement",
    isJoined: false,
  },
];

const categories = [
  "Tous",
  "Technologie",
  "Entrepreneuriat",
  "Design",
  "Marketing",
  "Recrutement",
  "Finance",
];

type TabType = "my-groups" | "discover";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const myGroups = mockGroups.filter((g) => g.isJoined);
  const discoverGroups = mockGroups.filter((g) => !g.isJoined);

  const filteredGroups = (activeTab === "my-groups" ? myGroups : discoverGroups).filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Groupes</h1>
                    <p className="text-neutral-500">Rejoignez des communautés professionnelles</p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </div>

              {/* Search and Tabs */}
              <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un groupe..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 border-b border-neutral-200 -mx-4 px-4">
                  <button
                    onClick={() => setActiveTab("my-groups")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "my-groups"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Mes groupes ({myGroups.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "discover"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Découvrir
                  </button>
                </div>
              </Card>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-primary-500 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Groups List */}
              <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                  <Card className="text-center py-12">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                      Aucun groupe trouvé
                    </h3>
                    <p className="text-neutral-500">
                      {activeTab === "my-groups"
                        ? "Vous n'avez pas encore rejoint de groupe"
                        : "Essayez une autre recherche ou catégorie"}
                    </p>
                  </Card>
                ) : (
                  filteredGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Group Image */}
                        <div className="flex-shrink-0">
                          {group.imageUrl ? (
                            <img
                              src={group.imageUrl}
                              alt={group.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                              <Users className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900">{group.name}</h3>
                            {group.isPrivate ? (
                              <Lock className="h-4 w-4 text-neutral-400" />
                            ) : (
                              <Globe className="h-4 w-4 text-neutral-400" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-neutral-500">
                              {group.memberCount.toLocaleString()} membres
                            </span>
                            <Badge variant="secondary">{group.category}</Badge>
                          </div>
                          {group.recentActivity && (
                            <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {group.recentActivity}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col justify-center">
                          {group.isJoined ? (
                            <Link href={`/groups/${group.id}`}>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Ouvrir
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Rejoindre
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Vos groupes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Groupes rejoints</span>
                    <span className="font-semibold text-neutral-900">{myGroups.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Groupes gérés</span>
                    <span className="font-semibold text-neutral-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Invitations en attente</span>
                    <span className="font-semibold text-neutral-900">0</span>
                  </div>
                </div>
              </Card>

              {/* Suggested Groups */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Groupes suggérés</h3>
                <div className="space-y-4">
                  {discoverGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 text-sm truncate">{group.name}</p>
                        <p className="text-xs text-neutral-500">
                          {group.memberCount.toLocaleString()} membres
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1">
                  Voir plus
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Card>

              {/* Group Guidelines */}
              <Card className="bg-primary-50 border-primary-100">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary-900">Créez votre groupe</h4>
                    <p className="text-sm text-primary-700 mt-1">
                      Rassemblez des professionnels autour d&apos;un sujet qui vous passionne
                    </p>
                    <Button size="sm" className="mt-3">
                      Créer un groupe
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
