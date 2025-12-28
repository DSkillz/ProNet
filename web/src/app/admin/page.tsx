"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Badge, Avatar } from "@/components/ui";
import {
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Shield,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Stats {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    totalPosts: number;
    postsToday: number;
    totalJobs: number;
    activeJobs: number;
    totalMessages: number;
    bannedUsers: number;
  };
  last7Days: Array<{
    date: string;
    users: number;
    posts: number;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors du chargement des statistiques");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur est admin
  if (user && (user as any).role !== "ADMIN" && (user as any).role !== "MODERATOR") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-12">
            <Card className="text-center py-12">
              <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Accès refusé</h1>
              <p className="text-neutral-500">
                Cette page est réservée aux administrateurs.
              </p>
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

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Administration</h1>
                <p className="text-neutral-500">Tableau de bord et gestion de la plateforme</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Card className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          ) : error ? (
            <Card className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </Card>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Utilisateurs</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {stats.overview.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        +{stats.overview.newUsersToday} aujourd&apos;hui
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Publications</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {stats.overview.totalPosts.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        +{stats.overview.postsToday} aujourd&apos;hui
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Offres d&apos;emploi</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {stats.overview.totalJobs.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {stats.overview.activeJobs} actives
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Messages</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {stats.overview.totalMessages.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Quick Actions */}
                <Card>
                  <h3 className="font-semibold text-neutral-900 mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Gérer les utilisateurs
                      </Button>
                    </Link>
                    <Link href="/admin/posts">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Modérer les publications
                      </Button>
                    </Link>
                    <Link href="/admin/jobs">
                      <Button variant="outline" className="w-full justify-start">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Gérer les offres
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">Utilisateurs bannis</span>
                      <Badge variant={stats.overview.bannedUsers > 0 ? "danger" : "success"}>
                        {stats.overview.bannedUsers}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Activity Chart */}
                <Card className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900">Activité des 7 derniers jours</h3>
                    <BarChart3 className="h-5 w-5 text-neutral-400" />
                  </div>

                  <div className="space-y-4">
                    {stats.last7Days.map((day, index) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500 w-24">
                          {new Date(day.date).toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex-1">
                          <div className="flex gap-2">
                            <div
                              className="h-6 bg-blue-500 rounded"
                              style={{
                                width: `${Math.max(
                                  (day.users / Math.max(...stats.last7Days.map((d) => d.users), 1)) * 100,
                                  2
                                )}%`,
                              }}
                            />
                            <div
                              className="h-6 bg-green-500 rounded"
                              style={{
                                width: `${Math.max(
                                  (day.posts / Math.max(...stats.last7Days.map((d) => d.posts), 1)) * 100,
                                  2
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-neutral-600 w-20 text-right">
                          {day.users}u / {day.posts}p
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span className="text-sm text-neutral-500">Utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm text-neutral-500">Publications</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Alerts */}
              {stats.overview.bannedUsers > 0 && (
                <Card className="bg-red-50 border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">
                        {stats.overview.bannedUsers} utilisateur(s) banni(s)
                      </p>
                      <p className="text-sm text-red-700">
                        Vérifiez la liste des utilisateurs bannis dans la section de gestion.
                      </p>
                    </div>
                    <Link href="/admin/users?status=banned" className="ml-auto">
                      <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                        Voir
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}
