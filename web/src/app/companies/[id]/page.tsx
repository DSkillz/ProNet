"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Calendar,
  Briefcase,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Bell,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  logoUrl?: string;
  bannerUrl?: string;
  location?: string;
  foundedYear?: number;
  _count?: {
    jobs: number;
    experiences: number;
  };
}

const sizeLabels: Record<string, string> = {
  SOLO: "1 employe",
  SMALL: "2-10 employes",
  MEDIUM: "11-50 employes",
  LARGE: "51-200 employes",
  ENTERPRISE: "200+ employes",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const fetchCompany = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_URL}/api/companies/${companyId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else {
        setError("Entreprise introuvable");
      }
    } catch (err) {
      setError("Impossible de charger l'entreprise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !company) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <Building2 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Entreprise introuvable</h2>
              <p className="text-neutral-500 mb-6">{error}</p>
              <Link href="/jobs">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux offres
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

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button */}
          <Link href="/jobs" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Company header */}
              <Card padding="none" className="overflow-hidden">
                {/* Banner */}
                <div
                  className="h-32 md:h-48 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400"
                  style={company.bannerUrl ? { backgroundImage: `url(${company.bannerUrl})`, backgroundSize: 'cover' } : {}}
                />

                <div className="p-6">
                  <div className="flex items-start gap-4 -mt-16">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-24 h-24 rounded-xl border-4 border-white bg-white object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl border-4 border-white bg-neutral-100 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
                    {company.industry && (
                      <p className="text-neutral-600 mt-1">{company.industry}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
                      {company.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {company.location}
                        </span>
                      )}
                      {company.size && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {sizeLabels[company.size] || company.size}
                        </span>
                      )}
                      {company.foundedYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fondee en {company.foundedYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200">
                    <Button onClick={handleFollow} variant={isFollowing ? "secondary" : "primary"}>
                      {isFollowing ? (
                        <><BellOff className="h-4 w-4 mr-2" /> Suivi</>
                      ) : (
                        <><Bell className="h-4 w-4 mr-2" /> Suivre</>
                      )}
                    </Button>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <Globe className="h-4 w-4 mr-2" />
                          Site web
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>

              {/* About */}
              {company.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>A propos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-700 whitespace-pre-line">{company.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Jobs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Offres d'emploi</CardTitle>
                  {company._count && company._count.jobs > 0 && (
                    <Badge variant="primary">{company._count.jobs} offres</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {company._count && company._count.jobs > 0 ? (
                    <Link href={`/jobs?company=${company.id}`}>
                      <Button variant="outline" className="w-full">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Voir toutes les offres
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-neutral-500 text-center py-4">
                      Aucune offre d'emploi pour le moment
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Offres d'emploi</span>
                    <span className="font-semibold">{company._count?.jobs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Employes sur ProNet</span>
                    <span className="font-semibold">{company._count?.experiences || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Website */}
              {company.website && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Liens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-500 hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
