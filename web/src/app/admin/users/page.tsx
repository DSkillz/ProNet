"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Badge, Avatar, Input } from "@/components/ui";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Trash2,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  _count: {
    posts: number;
    comments: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminUsersContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Card className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(searchQuery && { search: searchQuery }),
      ...(roleFilter !== "all" && { role: roleFilter }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    });

    try {
      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBan = async (userId: string) => {
    const reason = prompt("Raison du bannissement :");
    if (!reason) return;

    setActionLoading(userId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchUsers(pagination?.page);
      }
    } catch (err) {
      console.error("Error banning user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment débannir cet utilisateur ?")) return;

    setActionLoading(userId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/unban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUsers(pagination?.page);
      }
    } catch (err) {
      console.error("Error unbanning user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Voulez-vous vraiment changer le rôle en ${newRole} ?`)) return;

    setActionLoading(userId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(pagination?.page);
      }
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible."))
      return;

    setActionLoading(userId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUsers(pagination?.page);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="danger">Admin</Badge>;
      case "MODERATOR":
        return <Badge variant="warning">Modérateur</Badge>;
      default:
        return <Badge variant="secondary">Utilisateur</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Gestion des utilisateurs</h1>
                <p className="text-neutral-500">
                  {pagination?.total.toLocaleString()} utilisateurs au total
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou email..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="USER">Utilisateurs</option>
                <option value="MODERATOR">Modérateurs</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="banned">Bannis</option>
              </select>
              <Button type="submit">Rechercher</Button>
            </form>
          </Card>

          {/* Users Table */}
          <Card padding="none">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                        Utilisateur
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                        Rôle
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                        Statut
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                        Activité
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                        Inscrit le
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={`${user.firstName} ${user.lastName}`}
                              src={user.avatarUrl}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-neutral-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-neutral-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3">
                          {user.isBanned ? (
                            <Badge variant="danger">Banni</Badge>
                          ) : user.emailVerified ? (
                            <Badge variant="success">Actif</Badge>
                          ) : (
                            <Badge variant="warning">Non vérifié</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {user._count.posts} posts, {user._count.comments} commentaires
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-500">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                {/* Role change dropdown */}
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="text-sm border border-neutral-200 rounded px-2 py-1"
                                  disabled={user.role === "ADMIN"}
                                >
                                  <option value="USER">User</option>
                                  <option value="MODERATOR">Mod</option>
                                  <option value="ADMIN">Admin</option>
                                </select>

                                {user.isBanned ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnban(user.id)}
                                    className="text-green-600"
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBan(user.id)}
                                    className="text-orange-600"
                                    disabled={user.role === "ADMIN"}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600"
                                  disabled={user.role === "ADMIN"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchUsers(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchUsers(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
