"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Card, Avatar, Badge, Button } from "@/components/ui";
import {
  Bookmark,
  Briefcase,
  FileText,
  MapPin,
  Building2,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { jobsApi, Job } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

type TabType = "jobs" | "posts";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "jobs") {
      fetchSavedJobs();
    }
  }, [activeTab]);

  const fetchSavedJobs = async () => {
    setIsLoading(true);
    // Note: Backend needs a savedJobs endpoint - for now using jobs with isSaved filter
    const result = await jobsApi.getAll();
    if (result.data) {
      // Filter saved jobs
      const saved = result.data.jobs.filter((job) => job.isSaved);
      setSavedJobs(saved);
    }
    setIsLoading(false);
  };

  const handleUnsaveJob = async (jobId: string) => {
    const result = await jobsApi.unsave(jobId);
    if (!result.error) {
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
  };

  const tabs = [
    { id: "jobs" as TabType, label: "Emplois", icon: Briefcase, count: savedJobs.length },
    { id: "posts" as TabType, label: "Publications", icon: FileText, count: 0 },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Bookmark className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Mes éléments sauvegardés</h1>
              <p className="text-neutral-500">Retrouvez tous vos emplois et publications sauvegardés</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id ? "bg-white/20" : "bg-neutral-100"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              {isLoading ? (
                <Card className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </Card>
              ) : savedJobs.length === 0 ? (
                <Card className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    Aucun emploi sauvegardé
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    Sauvegardez des offres d&apos;emploi pour les retrouver facilement
                  </p>
                  <Link href="/jobs">
                    <Button>Parcourir les offres</Button>
                  </Link>
                </Card>
              ) : (
                savedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        {job.company?.logoUrl ? (
                          <img
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-neutral-400" />
                          </div>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/jobs/${job.id}`}>
                          <h3 className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-neutral-600">{job.company?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                          )}
                          <Badge variant="secondary">
                            {job.locationType === "REMOTE"
                              ? "Télétravail"
                              : job.locationType === "HYBRID"
                              ? "Hybride"
                              : "Sur site"}
                          </Badge>
                          <Badge variant="neutral">{job.employmentType}</Badge>
                        </div>
                        {job.salaryMin && job.salaryMax && (
                          <p className="text-sm text-neutral-600 mt-2">
                            {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}{" "}
                            {job.salaryCurrency || "EUR"}/an
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 mt-2">
                          Sauvegardé {formatDistanceToNow(new Date(job.createdAt))}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnsaveJob(job.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <Card className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Fonctionnalité à venir
              </h3>
              <p className="text-neutral-500">
                La sauvegarde de publications sera bientôt disponible
              </p>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
