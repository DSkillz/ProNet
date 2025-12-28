"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
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
  Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import { groupsApi, Group } from "@/lib/api";

const categories = [
  { value: "", label: "Toutes" },
  { value: "TECHNOLOGY", label: "Technologie" },
  { value: "BUSINESS", label: "Business" },
  { value: "DESIGN", label: "Design" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HR", label: "RH" },
  { value: "FINANCE", label: "Finance" },
  { value: "OTHER", label: "Autre" },
];

const groupTypes = [
  { value: "", label: "Tous les types" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Privé" },
];

type TabType = "my-groups" | "discover";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    fetchGroups();
    fetchMyGroups();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [selectedCategory, selectedType]);

  const fetchGroups = async () => {
    setIsLoading(true);
    const params: any = { limit: 20 };
    if (selectedCategory) params.category = selectedCategory;
    if (selectedType) params.type = selectedType;

    const result = await groupsApi.getAll(params);
    if (result.data) {
      setGroups(result.data.groups);
    }
    setIsLoading(false);
  };

  const fetchMyGroups = async () => {
    const result = await groupsApi.getMy();
    if (result.data) {
      setMyGroups(result.data.groups);
    }
  };

  const handleJoin = async (groupId: string) => {
    const result = await groupsApi.join(groupId);
    if (result.data) {
      fetchGroups();
      fetchMyGroups();
    }
  };

  const handleLeave = async (groupId: string) => {
    await groupsApi.leave(groupId);
    fetchGroups();
    fetchMyGroups();
  };

  const displayedGroups = activeTab === "my-groups" ? myGroups : groups;

  const filteredGroups = searchQuery
    ? displayedGroups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayedGroups;

  // Pour la sidebar: groupes suggérés (non rejoints)
  const suggestedGroups = groups.filter((g) => !g.isJoined).slice(0, 3);
  const ownedGroupsCount = myGroups.filter((g) => g.memberRole === "OWNER").length;

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
                <Link href="/groups/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un groupe
                  </Button>
                </Link>
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
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {groupTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 border-b border-neutral-200 -mx-4 px-4">
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
                </div>
              </Card>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.value
                        ? "bg-primary-500 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Groups List */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : (
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
                            {group.avatarUrl ? (
                              <img
                                src={group.avatarUrl}
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
                              <Link href={`/groups/${group.id}`}>
                                <h3 className="font-semibold text-neutral-900 hover:text-primary-500">
                                  {group.name}
                                </h3>
                              </Link>
                              {group.type === "PRIVATE" || group.type === "SECRET" ? (
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
                                {group.membersCount?.toLocaleString() || 0} membres
                              </span>
                              {group.category && (
                                <Badge variant="secondary">{group.category}</Badge>
                              )}
                            </div>
                            {group.postsCount && group.postsCount > 0 && (
                              <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {group.postsCount} publications
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col justify-center">
                            {group.isJoined ? (
                              <div className="flex flex-col gap-2">
                                <Link href={`/groups/${group.id}`}>
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Ouvrir
                                  </Button>
                                </Link>
                                {group.memberRole !== "OWNER" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLeave(group.id)}
                                    className="text-neutral-500 hover:text-red-500"
                                  >
                                    Quitter
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => handleJoin(group.id)}>
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
              )}
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
                    <span className="font-semibold text-neutral-900">{ownedGroupsCount}</span>
                  </div>
                </div>
              </Card>

              {/* Suggested Groups */}
              {suggestedGroups.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-neutral-900 mb-4">Groupes suggérés</h3>
                  <div className="space-y-4">
                    {suggestedGroups.map((group) => (
                      <div key={group.id} className="flex items-center gap-3">
                        {group.avatarUrl ? (
                          <img
                            src={group.avatarUrl}
                            alt={group.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/groups/${group.id}`}>
                            <p className="font-medium text-neutral-900 text-sm truncate hover:text-primary-500">
                              {group.name}
                            </p>
                          </Link>
                          <p className="text-xs text-neutral-500">
                            {group.membersCount?.toLocaleString() || 0} membres
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleJoin(group.id)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
                  >
                    Voir plus
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Card>
              )}

              {/* Group Guidelines */}
              <Card className="bg-primary-50 border-primary-100">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary-900">Créez votre groupe</h4>
                    <p className="text-sm text-primary-700 mt-1">
                      Rassemblez des professionnels autour d&apos;un sujet qui vous passionne
                    </p>
                    <Link href="/groups/create">
                      <Button size="sm" className="mt-3">
                        Créer un groupe
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
