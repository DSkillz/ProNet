"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Avatar } from "@/components/ui";
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Loader2,
  ArrowLeft,
  Users,
  CheckCircle,
  Calendar,
  ExternalLink,
  Share2,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { jobsApi, Job } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "CDI",
  PART_TIME: "Temps partiel",
  CONTRACT: "CDD",
  TEMPORARY: "Temporaire",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
};

const locationTypeLabels: Record<string, string> = {
  ON_SITE: "Sur site",
  HYBRID: "Hybride",
  REMOTE: "Teletravail",
};

const experienceLevelLabels: Record<string, string> = {
  ENTRY: "Debutant",
  ASSOCIATE: "Junior",
  MID_SENIOR: "Confirme",
  DIRECTOR: "Directeur",
  EXECUTIVE: "Executif",
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setIsLoading(true);
    setError("");

    const response = await jobsApi.getById(jobId);
    if (response.data) {
      setJob(response.data);
    } else {
      setError(response.error || "Offre introuvable");
    }
    setIsLoading(false);
  };

  const handleApply = async () => {
    if (!job) return;
    setActionLoading("apply");
    const result = await jobsApi.apply(job.id);
    if (!result.error) {
      setJob({ ...job, hasApplied: true });
    }
    setActionLoading(null);
  };

  const handleSave = async () => {
    if (!job) return;
    setActionLoading("save");

    const result = job.isSaved
      ? await jobsApi.unsave(job.id)
      : await jobsApi.save(job.id);

    if (!result.error) {
      setJob({ ...job, isSaved: !job.isSaved });
    }
    setActionLoading(null);
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

  if (error || !job) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <Briefcase className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Offre introuvable</h2>
              <p className="text-neutral-500 mb-6">{error || "Cette offre n'existe pas ou a ete supprimee."}</p>
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
            Retour aux offres
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job header */}
              <Card>
                <div className="flex gap-4">
                  {job.company?.logoUrl ? (
                    <img
                      src={job.company.logoUrl}
                      alt={job.company.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-neutral-900">{job.title}</h1>
                    {job.company && (
                      <Link
                        href={`/companies/${job.company.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {job.company.name}
                      </Link>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(job.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">
                    {locationTypeLabels[job.locationType] || job.locationType}
                  </Badge>
                  <Badge variant="neutral">
                    {employmentTypeLabels[job.employmentType] || job.employmentType}
                  </Badge>
                  <Badge variant="neutral">
                    {experienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                  </Badge>
                </div>

                {/* Salary */}
                {job.salaryMin && job.salaryMax && (
                  <div className="flex items-center gap-2 mt-4 text-neutral-700">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">
                      {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency || "EUR"}/an
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200">
                  {job.hasApplied ? (
                    <Button disabled variant="secondary">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Candidature envoyee
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApply}
                      isLoading={actionLoading === "apply"}
                    >
                      Postuler maintenant
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    isLoading={actionLoading === "save"}
                  >
                    {job.isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Sauvegardee
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  <Button variant="ghost">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Job description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description du poste</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral max-w-none">
                    <p className="whitespace-pre-line text-neutral-700">{job.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Company info */}
              {job.company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">A propos de l'entreprise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="flex items-center gap-3 hover:bg-neutral-50 -mx-4 -my-2 px-4 py-2 rounded-lg transition-colors"
                    >
                      {job.company.logoUrl ? (
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
                      <div>
                        <p className="font-medium text-neutral-900">{job.company.name}</p>
                        <p className="text-sm text-primary-600">Voir le profil</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Poster info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Publiee par</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/profile/${job.poster.id}`}
                    className="flex items-center gap-3 hover:bg-neutral-50 -mx-4 -my-2 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Avatar
                      name={`${job.poster.firstName} ${job.poster.lastName}`}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-neutral-900">
                        {job.poster.firstName} {job.poster.lastName}
                      </p>
                      <p className="text-sm text-primary-600">Voir le profil</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              {/* Report */}
              <Card>
                <CardContent className="py-4">
                  <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 text-sm">
                    <Flag className="h-4 w-4" />
                    Signaler cette offre
                  </button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
