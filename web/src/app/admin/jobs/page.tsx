"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  Search,
  Trash2,
  Eye,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  locationType: string;
  employmentType: string;
  isActive: boolean;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  poster: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    applications: number;
  };
}

export default function AdminJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_URL}/api/admin/jobs?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (jobId: string, isActive: boolean) => {
    setActionLoading(jobId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, isActive: !isActive } : j))
        );
      }
    } catch (err) {
      console.error("Failed to update job:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Supprimer cette offre d'emploi ?")) return;

    setActionLoading(jobId);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && job.isActive) ||
      (statusFilter === "inactive" && !job.isActive);
    return matchesSearch && matchesStatus;
  });

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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Gestion des offres d'emploi</h1>
                <p className="text-neutral-500">{jobs.length} offres au total</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre ou entreprise..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>
          </Card>

          {/* Jobs list */}
          {isLoading ? (
            <Card className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card className="text-center py-12">
              <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Aucune offre trouvee</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id}>
                  <div className="flex items-start gap-4">
                    {job.company?.logoUrl ? (
                      <img
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-neutral-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {job.title}
                        </Link>
                        <Badge variant={job.isActive ? "success" : "neutral"} size="sm">
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {job.company && (
                        <p className="text-neutral-600">{job.company.name}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        <span>{job._count.applications} candidatures</span>
                        <span>{formatDistanceToNow(new Date(job.createdAt))}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(job.id, job.isActive)}
                        disabled={actionLoading === job.id}
                        title={job.isActive ? "Desactiver" : "Activer"}
                      >
                        {job.isActive ? (
                          <XCircle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === job.id ? (
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
