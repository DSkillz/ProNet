"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  DollarSign,
  Bookmark,
  Filter,
  Loader2,
  ExternalLink,
  Users,
  CheckCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { jobsApi, Job } from "@/lib/api";

const locationTypes = [
  { value: "", label: "Tous" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybride" },
  { value: "ON_SITE", label: "Sur site" },
];

const employmentTypes = [
  { value: "", label: "Tous" },
  { value: "FULL_TIME", label: "CDI" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "CONTRACT", label: "CDD" },
  { value: "INTERNSHIP", label: "Stage" },
  { value: "FREELANCE", label: "Freelance" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    const result = await jobsApi.getAll({
      q: searchQuery || undefined,
      location: location || undefined,
      locationType: locationType || undefined,
      employmentType: employmentType || undefined,
    });

    if (result.data) {
      setJobs(result.data.jobs);
      setNextCursor(result.data.nextCursor);
      if (result.data.jobs.length > 0 && !selectedJob) {
        setSelectedJob(result.data.jobs[0]);
      }
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId: string) => {
    setActionLoading(jobId);
    const result = await jobsApi.apply(jobId);
    if (!result.error) {
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, hasApplied: true } : job))
      );
      if (selectedJob?.id === jobId) {
        setSelectedJob({ ...selectedJob, hasApplied: true });
      }
    }
    setActionLoading(null);
  };

  const handleSave = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setActionLoading(jobId);
    const result = job.isSaved
      ? await jobsApi.unsave(jobId)
      : await jobsApi.save(jobId);

    if (!result.error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
      );
      if (selectedJob?.id === jobId) {
        setSelectedJob({ ...selectedJob, isSaved: !selectedJob.isSaved });
      }
    }
    setActionLoading(null);
  };

  const getLocationTypeLabel = (type: string) => {
    const found = locationTypes.find((lt) => lt.value === type);
    return found?.label || type;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const found = employmentTypes.find((et) => et.value === type);
    return found?.label || type;
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
    const curr = currency || "EUR";
    if (min && max) return `${fmt.format(min)} - ${fmt.format(max)} ${curr}`;
    if (min) return `À partir de ${fmt.format(min)} ${curr}`;
    if (max) return `Jusqu'à ${fmt.format(max)} ${curr}`;
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Header */}
          <Card className="mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titre, compétences ou entreprise"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ville, région ou 'remote'"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Button type="submit" className="md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-500"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>

                {showFilters && (
                  <>
                    <select
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {locationTypes.map((lt) => (
                        <option key={lt.value} value={lt.value}>
                          {lt.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {employmentTypes.map((et) => (
                        <option key={et.value} value={et.value}>
                          {et.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </form>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="text-center py-12">
              <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Aucune offre trouvée
              </h3>
              <p className="text-neutral-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Jobs List */}
              <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-all ${
                      selectedJob?.id === job.id
                        ? "ring-2 ring-primary-500 bg-primary-50/30"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {job.company?.logoUrl ? (
                          <img
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-neutral-600 truncate">
                          {job.company?.name || "Entreprise"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-500">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getLocationTypeLabel(job.locationType)}
                          </Badge>
                        </div>
                      </div>
                      {job.hasApplied && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Job Details */}
              <div className="lg:col-span-3">
                {selectedJob ? (
                  <Card className="sticky top-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                          {selectedJob.company?.logoUrl ? (
                            <img
                              src={selectedJob.company.logoUrl}
                              alt={selectedJob.company.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-neutral-900">
                            {selectedJob.title}
                          </h2>
                          <p className="text-neutral-600">
                            {selectedJob.company?.name || "Entreprise"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral-500">
                            {selectedJob.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {selectedJob.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(selectedJob.id)}
                        disabled={actionLoading === selectedJob.id}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedJob.isSaved
                            ? "text-accent-500 bg-accent-50"
                            : "text-neutral-400 hover:bg-neutral-100"
                        }`}
                      >
                        <Bookmark
                          className={`h-5 w-5 ${selectedJob.isSaved ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Job Info */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="primary">
                        {getEmploymentTypeLabel(selectedJob.employmentType)}
                      </Badge>
                      <Badge variant="secondary">
                        {getLocationTypeLabel(selectedJob.locationType)}
                      </Badge>
                      <Badge variant="secondary">{selectedJob.experienceLevel}</Badge>
                      {formatSalary(
                        selectedJob.salaryMin,
                        selectedJob.salaryMax,
                        selectedJob.salaryCurrency
                      ) && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatSalary(
                            selectedJob.salaryMin,
                            selectedJob.salaryMax,
                            selectedJob.salaryCurrency
                          )}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                      {selectedJob.hasApplied ? (
                        <Button disabled className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Candidature envoyée
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApply(selectedJob.id)}
                          disabled={actionLoading === selectedJob.id}
                          className="flex-1"
                        >
                          {actionLoading === selectedJob.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Briefcase className="h-4 w-4 mr-2" />
                          )}
                          Postuler
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => handleSave(selectedJob.id)}
                        disabled={actionLoading === selectedJob.id}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${selectedJob.isSaved ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Description</h3>
                      <div className="prose prose-neutral prose-sm max-w-none">
                        <p className="text-neutral-700 whitespace-pre-line">
                          {selectedJob.description}
                        </p>
                      </div>
                    </div>

                    {/* Posted by */}
                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <p className="text-sm text-neutral-500">
                        Publié par {selectedJob.poster.firstName} {selectedJob.poster.lastName}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="text-center py-12">
                    <p className="text-neutral-500">
                      Sélectionnez une offre pour voir les détails
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
