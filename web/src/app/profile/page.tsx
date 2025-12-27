import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  Calendar,
  Edit3,
  Plus,
  ExternalLink,
  Award,
  Users,
  Eye,
  TrendingUp,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

// Données fictives pour le design
const profileData = {
  name: "Marie Dupont",
  headline: "Développeuse Full Stack | React, Node.js, TypeScript | Passionnée par l'open-source",
  location: "Paris, France",
  connections: 523,
  followers: 1247,
  about: `Développeuse passionnée avec 7 ans d'expérience dans la création d'applications web modernes et performantes. 

Je suis spécialisée dans l'écosystème JavaScript/TypeScript, avec une expertise particulière en React, Node.js et les architectures cloud.

🚀 Ce qui me motive :
• Contribuer à des projets open-source
• Mentorer les développeurs juniors
• Explorer les nouvelles technologies

Actuellement ouverte aux opportunités de Lead Developer ou Architecte Frontend.`,
  experience: [
    {
      id: 1,
      title: "Lead Developer Frontend",
      company: "TechCorp",
      companyLogo: null,
      location: "Paris, France",
      startDate: "2022-01",
      endDate: null,
      current: true,
      description:
        "Direction technique de l'équipe frontend (6 personnes). Migration de l'application legacy vers Next.js. Mise en place de l'architecture micro-frontend.",
      skills: ["React", "Next.js", "TypeScript", "GraphQL"],
    },
    {
      id: 2,
      title: "Développeuse Full Stack",
      company: "StartupXYZ",
      companyLogo: null,
      location: "Lyon, France",
      startDate: "2019-03",
      endDate: "2021-12",
      current: false,
      description:
        "Développement de la plateforme SaaS B2B. Intégration de paiements Stripe. API REST avec Node.js/Express.",
      skills: ["Node.js", "React", "PostgreSQL", "AWS"],
    },
    {
      id: 3,
      title: "Développeuse Web Junior",
      company: "AgenceWeb",
      companyLogo: null,
      location: "Paris, France",
      startDate: "2017-09",
      endDate: "2019-02",
      current: false,
      description:
        "Création de sites web et applications pour divers clients. WordPress, PHP, JavaScript.",
      skills: ["JavaScript", "PHP", "WordPress", "CSS"],
    },
  ],
  education: [
    {
      id: 1,
      school: "École 42",
      degree: "Architecte Logiciel",
      field: "Informatique",
      startDate: "2015",
      endDate: "2017",
      description:
        "Formation intensive en programmation avec pédagogie peer-to-peer.",
    },
    {
      id: 2,
      school: "Université Paris-Saclay",
      degree: "Licence",
      field: "Mathématiques-Informatique",
      startDate: "2012",
      endDate: "2015",
      description: null,
    },
  ],
  skills: [
    { name: "React", endorsements: 47, verified: true },
    { name: "TypeScript", endorsements: 38, verified: true },
    { name: "Node.js", endorsements: 35, verified: true },
    { name: "Next.js", endorsements: 29, verified: false },
    { name: "GraphQL", endorsements: 22, verified: false },
    { name: "PostgreSQL", endorsements: 18, verified: false },
    { name: "AWS", endorsements: 15, verified: false },
    { name: "Docker", endorsements: 12, verified: false },
  ],
  certifications: [
    {
      id: 1,
      name: "AWS Certified Developer - Associate",
      issuer: "Amazon Web Services",
      date: "2023",
      credentialUrl: "#",
    },
    {
      id: 2,
      name: "Professional Scrum Master I",
      issuer: "Scrum.org",
      date: "2022",
      credentialUrl: "#",
    },
  ],
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Courant (C1)" },
    { name: "Espagnol", level: "Intermédiaire (B1)" },
  ],
  interests: ["Open Source", "DevOps", "IA & Machine Learning", "Green IT", "Accessibilité"],
};

const analytics = {
  profileViews: 284,
  postImpressions: 1523,
  searchAppearances: 47,
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header du profil */}
            <Card padding="none" className="overflow-hidden">
              {/* Bannière */}
              <div className="h-32 md:h-48 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 relative">
                <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Infos profil */}
              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
                  <div className="relative">
                    <Avatar name={profileData.name} size="xl" className="ring-4 ring-white" />
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 md:pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                          {profileData.name}
                        </h1>
                        <p className="text-neutral-600 mt-1">
                          {profileData.headline}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profileData.location}
                          </span>
                          <Link href="/network" className="text-primary-500 hover:underline">
                            {profileData.connections} connexions
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Se connecter
                  </Button>
                  <Button variant="secondary">Message</Button>
                  <Button variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Statut ouvert aux opportunités */}
                <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">
                        Ouverte aux opportunités
                      </p>
                      <p className="text-sm text-primary-700">
                        Lead Developer, Architecte Frontend • CDI • Paris, Remote
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques du profil</CardTitle>
                <Link href="/analytics" className="text-primary-500 text-sm hover:underline flex items-center gap-1">
                  Voir tout <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-neutral-900">
                      <Eye className="h-5 w-5 text-neutral-400" />
                      {analytics.profileViews}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">Vues du profil</p>
                  </div>
                  <div className="text-center p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-neutral-900">
                      <TrendingUp className="h-5 w-5 text-neutral-400" />
                      {analytics.postImpressions}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">Impressions</p>
                  </div>
                  <div className="text-center p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-neutral-900">
                      <Users className="h-5 w-5 text-neutral-400" />
                      {analytics.searchAppearances}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">Apparitions recherche</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* À propos */}
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Edit3 className="h-4 w-4 text-neutral-500" />
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 whitespace-pre-line">
                  {profileData.about}
                </p>
              </CardContent>
            </Card>

            {/* Expérience */}
            <Card>
              <CardHeader>
                <CardTitle>Expérience</CardTitle>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Plus className="h-4 w-4 text-neutral-500" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.experience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className={`flex gap-4 ${
                      index !== profileData.experience.length - 1
                        ? "pb-6 border-b border-neutral-100"
                        : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            {exp.title}
                          </h4>
                          <p className="text-neutral-700">{exp.company}</p>
                          <p className="text-sm text-neutral-500">
                            {exp.startDate} - {exp.current ? "Présent" : exp.endDate} •{" "}
                            {exp.location}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-neutral-400" />
                        </button>
                      </div>
                      <p className="text-neutral-600 mt-3">{exp.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exp.skills.map((skill) => (
                          <Badge key={skill} variant="primary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Formation */}
            <Card>
              <CardHeader>
                <CardTitle>Formation</CardTitle>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Plus className="h-4 w-4 text-neutral-500" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.education.map((edu, index) => (
                  <div
                    key={edu.id}
                    className={`flex gap-4 ${
                      index !== profileData.education.length - 1
                        ? "pb-6 border-b border-neutral-100"
                        : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            {edu.school}
                          </h4>
                          <p className="text-neutral-700">
                            {edu.degree} - {edu.field}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {edu.startDate} - {edu.endDate}
                          </p>
                        </div>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-neutral-400" />
                        </button>
                      </div>
                      {edu.description && (
                        <p className="text-neutral-600 mt-3">{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Licences et certifications</CardTitle>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Plus className="h-4 w-4 text-neutral-500" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.certifications.map((cert) => (
                  <div key={cert.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{cert.name}</h4>
                      <p className="text-neutral-600">{cert.issuer}</p>
                      <p className="text-sm text-neutral-500">Délivré en {cert.date}</p>
                      <a
                        href={cert.credentialUrl}
                        className="text-sm text-primary-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        Voir le certificat <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compétences */}
            <Card>
              <CardHeader>
                <CardTitle>Compétences</CardTitle>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Plus className="h-4 w-4 text-neutral-500" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.skills.slice(0, 6).map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">
                          {skill.name}
                        </span>
                        {skill.verified && (
                          <CheckCircle className="h-4 w-4 text-secondary-500" />
                        )}
                      </div>
                      <span className="text-sm text-neutral-500">
                        {skill.endorsements} recommandations
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-primary-500 hover:underline text-sm">
                  Voir les {profileData.skills.length} compétences
                </button>
              </CardContent>
            </Card>

            {/* Langues */}
            <Card>
              <CardHeader>
                <CardTitle>Langues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.languages.map((lang) => (
                    <div key={lang.name} className="flex justify-between">
                      <span className="font-medium text-neutral-900">{lang.name}</span>
                      <span className="text-sm text-neutral-500">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Centres d'intérêt */}
            <Card>
              <CardHeader>
                <CardTitle>Centres d'intérêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest) => (
                    <Badge key={interest} variant="neutral" size="md">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions de personnes */}
            <Card>
              <CardHeader>
                <CardTitle>Personnes similaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Thomas Bernard", title: "Senior Developer @TechCorp" },
                    { name: "Léa Martin", title: "Frontend Lead @StartupABC" },
                    { name: "Pierre Durand", title: "CTO @InnovateTech" },
                  ].map((person) => (
                    <div key={person.name} className="flex items-center gap-3">
                      <Avatar name={person.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {person.name}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {person.title}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
