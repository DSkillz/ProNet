"use client";

import { useState } from "react";
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
  MessageCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfileModal } from "@/components/profile";

// Données fictives pour le design (sera remplacé par API)
const experienceData = [
  {
    id: "1",
    title: "Lead Developer Frontend",
    company: "TechCorp",
    location: "Paris, France",
    startDate: "2022-01",
    endDate: null,
    current: true,
    description:
      "Direction technique de l'équipe frontend. Migration vers Next.js. Architecture micro-frontend.",
    skills: ["React", "Next.js", "TypeScript", "GraphQL"],
  },
  {
    id: "2",
    title: "Développeur Full Stack",
    company: "StartupXYZ",
    location: "Lyon, France",
    startDate: "2019-03",
    endDate: "2021-12",
    current: false,
    description:
      "Développement de la plateforme SaaS B2B. Intégration Stripe. API REST Node.js/Express.",
    skills: ["Node.js", "React", "PostgreSQL", "AWS"],
  },
];

const educationData = [
  {
    id: "1",
    school: "École 42",
    degree: "Architecte Logiciel",
    field: "Informatique",
    startDate: "2015",
    endDate: "2017",
    description: "Formation intensive avec pédagogie peer-to-peer.",
  },
  {
    id: "2",
    school: "Université Paris-Saclay",
    degree: "Licence",
    field: "Mathématiques-Informatique",
    startDate: "2012",
    endDate: "2015",
    description: null,
  },
];

const skillsData = [
  { name: "React", endorsements: 47, verified: true },
  { name: "TypeScript", endorsements: 38, verified: true },
  { name: "Node.js", endorsements: 35, verified: true },
  { name: "Next.js", endorsements: 29, verified: false },
  { name: "GraphQL", endorsements: 22, verified: false },
  { name: "PostgreSQL", endorsements: 18, verified: false },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header du profil */}
              <Card padding="none" className="overflow-hidden">
                {/* Bannière */}
                <div
                  className="h-32 md:h-48 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 relative"
                  style={user?.bannerUrl ? { backgroundImage: `url(${user.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Infos profil */}
                <div className="px-6 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
                    <div className="relative">
                      <Avatar src={user?.avatarUrl} name={userName} size="xl" className="ring-4 ring-white" />
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 md:pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-neutral-900">{userName}</h1>
                          <p className="text-neutral-600 mt-1">
                            {user?.headline || "Membre ProNet - Ajoutez un titre professionnel"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
                            {user?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {user.location}
                              </span>
                            )}
                            <Link href="/network" className="text-primary-500 hover:underline">
                              523 connexions
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges status */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {user?.isOpenToWork && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ouvert aux opportunités
                      </Badge>
                    )}
                    {user?.isHiring && (
                      <Badge variant="primary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Recrute actuellement
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button onClick={() => setShowEditModal(true)}>
                      <Edit3 className="h-4 w-4 mr-1" />
                      Modifier le profil
                    </Button>
                    <Button variant="secondary">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une section
                    </Button>
                  </div>
                </div>
              </Card>

              {/* À propos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>À propos</CardTitle>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-neutral-500" />
                  </button>
                </CardHeader>
                <CardContent>
                  {user?.about ? (
                    <p className="text-neutral-700 whitespace-pre-line">{user.about}</p>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-500 mb-4">
                        Parlez de vous, de votre parcours et de vos aspirations professionnelles.
                      </p>
                      <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une description
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expérience */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Expérience</CardTitle>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Plus className="h-4 w-4 text-neutral-500" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experienceData.map((exp, index) => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-900">{exp.title}</h3>
                            <p className="text-neutral-600">{exp.company}</p>
                            <p className="text-sm text-neutral-500">
                              {formatDate(exp.startDate)} - {exp.current ? "Présent" : formatDate(exp.endDate!)}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Edit3 className="h-4 w-4 text-neutral-400" />
                          </button>
                        </div>
                        {exp.description && (
                          <p className="text-neutral-600 mt-2 text-sm">{exp.description}</p>
                        )}
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {exp.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Formation */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Formation</CardTitle>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Plus className="h-4 w-4 text-neutral-500" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {educationData.map((edu) => (
                    <div key={edu.id} className="flex gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-900">{edu.school}</h3>
                            <p className="text-neutral-600">
                              {edu.degree && `${edu.degree}`}
                              {edu.field && `, ${edu.field}`}
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
                          <p className="text-neutral-600 mt-2 text-sm">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Compétences */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Compétences</CardTitle>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Plus className="h-4 w-4 text-neutral-500" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillsData.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{skill.name}</span>
                          {skill.verified && (
                            <CheckCircle className="h-4 w-4 text-primary-500" />
                          )}
                        </div>
                        <span className="text-sm text-neutral-500">
                          {skill.endorsements} recommandations
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analyses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="font-semibold text-neutral-900">284</p>
                      <p className="text-sm text-neutral-500">Vues du profil</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="font-semibold text-neutral-900">1,523</p>
                      <p className="text-sm text-neutral-500">Impressions des posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="font-semibold text-neutral-900">47</p>
                      <p className="text-sm text-neutral-500">Apparitions en recherche</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ressources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ressources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/saved" className="flex items-center gap-3 text-neutral-600 hover:text-primary-500">
                    <Award className="h-5 w-5" />
                    <span className="text-sm">Publications sauvegardées</span>
                  </Link>
                  <Link href="/network" className="flex items-center gap-3 text-neutral-600 hover:text-primary-500">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Mon réseau</span>
                  </Link>
                </CardContent>
              </Card>

              {/* Profils similaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profils similaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Thomas Bernard", title: "Senior Developer @TechCorp" },
                    { name: "Sophie Martin", title: "Product Manager @InnovateTech" },
                  ].map((person, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar name={person.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 text-sm truncate">{person.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{person.title}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>

        {/* Edit Modal */}
        {user && (
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            user={user}
            onProfileUpdated={(updatedUser) => updateUser(updatedUser)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
