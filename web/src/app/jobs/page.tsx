"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent, Input } from "@/components/ui";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  DollarSign,
  Bookmark,
  Filter,
  ChevronDown,
  ExternalLink,
  Users,
  TrendingUp,
  Zap,
  Heart,
  X,
} from "lucide-react";
import Link from "next/link";

const jobListings = [
  {
    id: 1,
    title: "Lead Developer Frontend",
    company: "TechCorp",
    companyLogo: null,
    location: "Paris, France",
    remote: "Hybride",
    salary: "65K - 85K €",
    type: "CDI",
    experience: "5+ ans",
    postedAt: "Il y a 2 heures",
    description:
      "Nous recherchons un Lead Developer Frontend pour diriger notre équipe de 6 développeurs et piloter la refonte de notre plateforme SaaS.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL"],
    applicants: 23,
    isNew: true,
    saved: false,
  },
  {
    id: 2,
    title: "Senior Backend Engineer",
    company: "StartupXYZ",
    companyLogo: null,
    location: "Lyon, France",
    remote: "Full Remote",
    salary: "55K - 70K €",
    type: "CDI",
    experience: "3-5 ans",
    postedAt: "Il y a 1 jour",
    description:
      "Rejoignez notre équipe backend pour construire des APIs scalables et performantes avec Node.js et PostgreSQL.",
    skills: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    applicants: 45,
    isNew: false,
    saved: true,
  },
  {
    id: 3,
    title: "Product Designer",
    company: "DesignStudio",
    companyLogo: null,
    location: "Bordeaux, France",
    remote: "Sur site",
    salary: "45K - 55K €",
    type: "CDI",
    experience: "2-4 ans",
    postedAt: "Il y a 2 jours",
    description:
      "Nous cherchons un Product Designer créatif pour concevoir des expériences utilisateur exceptionnelles pour nos clients B2B.",
    skills: ["Figma", "UX Research", "Design System", "Prototyping"],
    applicants: 67,
    isNew: false,
    saved: false,
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudTech",
    companyLogo: null,
    location: "Nantes, France",
    remote: "Hybride",
    salary: "50K - 65K €",
    type: "CDI",
    experience: "3+ ans",
    postedAt: "Il y a 3 jours",
    description:
      "Venez renforcer notre équipe infrastructure et automatiser nos déploiements sur Kubernetes.",
    skills: ["Kubernetes", "Terraform", "CI/CD", "AWS"],
    applicants: 31,
    isNew: false,
    saved: false,
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "DataCorp",
    companyLogo: null,
    location: "Paris, France",
    remote: "Full Remote",
    salary: "60K - 80K €",
    type: "CDI",
    experience: "3-5 ans",
    postedAt: "Il y a 4 jours",
    description:
      "Rejoignez notre équipe data pour développer des modèles de machine learning et analyser des données massives.",
    skills: ["Python", "TensorFlow", "SQL", "Spark"],
    applicants: 89,
    isNew: false,
    saved: false,
  },
];

const filters = {
  remote: ["Tous", "Full Remote", "Hybride", "Sur site"],
  experience: ["Tous", "Junior (0-2 ans)", "Confirmé (2-5 ans)", "Senior (5+ ans)"],
  type: ["Tous", "CDI", "CDD", "Freelance", "Stage"],
  salary: ["Tous", "30-45K €", "45-60K €", "60-80K €", "80K+ €"],
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    remote: "Tous",
    experience: "Tous",
    type: "Tous",
    salary: "Tous",
  });
  const [jobs, setJobs] = useState(jobListings);
  const [selectedJob, setSelectedJob] = useState(jobListings[0]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSave = (jobId: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, saved: !job.saved } : job
      )
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      {/* Hero recherche */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Trouvez votre prochain emploi
          </h1>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Titre, compétences ou entreprise"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Ville ou région"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button size="lg" className="md:w-auto">
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
            </div>

            {/* Filtres rapides */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filtres
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              {Object.entries(activeFilters).map(
                ([key, value]) =>
                  value !== "Tous" && (
                    <span
                      key={key}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg"
                    >
                      {value}
                      <button
                        onClick={() =>
                          setActiveFilters((prev) => ({ ...prev, [key]: "Tous" }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
              )}
            </div>

            {/* Panneau filtres */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Télétravail
                  </label>
                  <select
                    value={activeFilters.remote}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({ ...prev, remote: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {filters.remote.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Expérience
                  </label>
                  <select
                    value={activeFilters.experience}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {filters.experience.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Type de contrat
                  </label>
                  <select
                    value={activeFilters.type}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {filters.type.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Salaire
                  </label>
                  <select
                    value={activeFilters.salary}
                    onChange={(e) =>
                      setActiveFilters((prev) => ({ ...prev, salary: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {filters.salary.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            <span className="font-semibold text-neutral-900">{jobs.length} emplois</span> correspondent à votre recherche
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Trier par :</span>
            <select className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Pertinence</option>
              <option>Date</option>
              <option>Salaire croissant</option>
              <option>Salaire décroissant</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Liste des offres */}
          <div className="lg:col-span-2 space-y-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                hover
                className={`cursor-pointer ${
                  selectedJob?.id === job.id ? "ring-2 ring-primary-500" : ""
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">
                          {job.title}
                        </h3>
                        {job.isNew && (
                          <Badge variant="success" size="sm">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-neutral-600">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span>{job.remote}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(job.id);
                    }}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Bookmark
                      className={`h-5 w-5 ${
                        job.saved
                          ? "fill-primary-500 text-primary-500"
                          : "text-neutral-400"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="neutral" size="sm">
                      +{job.skills.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-secondary-600 font-medium">
                    {job.salary}
                  </span>
                  <span className="text-neutral-400">{job.postedAt}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Détail de l'offre */}
          <div className="lg:col-span-3">
            {selectedJob && (
              <Card className="sticky top-20">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">
                        {selectedJob.title}
                      </h2>
                      <Link
                        href="#"
                        className="text-primary-500 hover:underline font-medium"
                      >
                        {selectedJob.company}
                      </Link>
                      <p className="text-neutral-500 mt-1">
                        {selectedJob.location} • {selectedJob.remote}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSave(selectedJob.id)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Bookmark
                      className={`h-6 w-6 ${
                        selectedJob.saved
                          ? "fill-primary-500 text-primary-500"
                          : "text-neutral-400"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Button size="lg" className="gap-2">
                    <Zap className="h-5 w-5" />
                    Postuler maintenant
                  </Button>
                  <Button variant="secondary" size="lg">
                    Candidature simplifiée
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                      <DollarSign className="h-4 w-4" />
                      Salaire
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {selectedJob.salary}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                      <Briefcase className="h-4 w-4" />
                      Type
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {selectedJob.type}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                      <Clock className="h-4 w-4" />
                      Expérience
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {selectedJob.experience}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                      <Users className="h-4 w-4" />
                      Candidats
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {selectedJob.applicants}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">
                    Description du poste
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedJob.description}
                  </p>
                  <div className="mt-4 space-y-2 text-neutral-700">
                    <p>
                      <strong>Responsabilités :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Diriger et mentorer une équipe de développeurs</li>
                      <li>Définir l'architecture technique des projets</li>
                      <li>Assurer la qualité du code et les bonnes pratiques</li>
                      <li>Collaborer avec les équipes produit et design</li>
                      <li>Participer au recrutement technique</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">
                    Compétences requises
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} variant="primary" size="md">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    <span className="font-medium text-primary-900">
                      Votre profil correspond à 85%
                    </span>
                  </div>
                  <p className="text-sm text-primary-700">
                    Vous avez 4 compétences sur 4 demandées. Excellente
                    correspondance !
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500">
                  <span>Publié {selectedJob.postedAt}</span>
                  <button className="flex items-center gap-1 text-primary-500 hover:underline">
                    Voir l'entreprise <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
