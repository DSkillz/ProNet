"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Users,
  CheckCircle,
  MessageCircle,
  UserPlus,
  UserCheck,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Award,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi, connectionsApi } from "@/lib/api";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  about?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  isOpenToWork?: boolean;
  isHiring?: boolean;
  experiences?: Array<{
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills?: Array<{
    id: string;
    skill: { name: string };
    _count?: { endorsements: number };
  }>;
  _count?: {
    sentConnections: number;
    receivedConnections: number;
    followers: number;
    following: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError("");

    const response = await usersApi.getProfile(userId);
    if (response.data) {
      setProfile(response.data as UserProfile);
      // Check connection status
      checkConnectionStatus();
    } else {
      setError(response.error || "Profil introuvable");
    }
    setIsLoading(false);
  };

  const checkConnectionStatus = async () => {
    const response = await connectionsApi.getStatus(userId);
    if (response.data) {
      setConnectionStatus((response.data as any).status);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    const response = await connectionsApi.send(userId);
    if (!response.error) {
      setConnectionStatus("PENDING");
    }
    setIsConnecting(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  };

  const connectionCount = profile?._count
    ? (profile._count.sentConnections || 0) + (profile._count.receivedConnections || 0)
    : 0;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Card className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Profil introuvable</h2>
              <p className="text-neutral-500 mb-6">{error || "Ce profil n'existe pas ou a été supprimé."}</p>
              <Link href="/network">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au réseau
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const userName = `${profile.firstName} ${profile.lastName}`;

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
                {/* Banniere */}
                <div
                  className="h-32 md:h-48 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 relative"
                  style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover' } : {}}
                />

                {/* Infos profil */}
                <div className="px-6 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
                    <div className="relative">
                      <Avatar
                        name={userName}
                        src={profile.avatarUrl}
                        size="xl"
                        className="ring-4 ring-white"
                      />
                    </div>

                    <div className="flex-1 md:pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-neutral-900">{userName}</h1>
                          <p className="text-neutral-600 mt-1">
                            {profile.headline || "Membre ProNet"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
                            {profile.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {profile.location}
                              </span>
                            )}
                            <span className="text-primary-500">
                              {connectionCount} connexions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges status */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.isOpenToWork && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ouvert aux opportunites
                      </Badge>
                    )}
                    {profile.isHiring && (
                      <Badge variant="primary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Recrute actuellement
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {!isOwnProfile && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      {connectionStatus === "ACCEPTED" ? (
                        <Button variant="secondary" disabled>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Connecte
                        </Button>
                      ) : connectionStatus === "PENDING" ? (
                        <Button variant="secondary" disabled>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Invitation envoyee
                        </Button>
                      ) : (
                        <Button onClick={handleConnect} isLoading={isConnecting}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Se connecter
                        </Button>
                      )}
                      <Link href={`/messages?user=${userId}`}>
                        <Button variant="secondary">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </Link>
                    </div>
                  )}

                  {isOwnProfile && (
                    <div className="mt-6">
                      <Link href="/profile">
                        <Button variant="secondary">
                          Voir mon profil complet
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* A propos */}
              {profile.about && (
                <Card>
                  <CardHeader>
                    <CardTitle>A propos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-700 whitespace-pre-line">{profile.about}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {profile.experiences && profile.experiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id} className="flex gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-neutral-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">{exp.title}</h3>
                          <p className="text-neutral-600">{exp.company}</p>
                          <p className="text-sm text-neutral-500">
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                          {exp.description && (
                            <p className="text-neutral-600 mt-2 text-sm">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Formation */}
              {profile.education && profile.education.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Formation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.education.map((edu) => (
                      <div key={edu.id} className="flex gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-6 w-6 text-neutral-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">{edu.school}</h3>
                          <p className="text-neutral-600">
                            {edu.degree && `${edu.degree}`}
                            {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                          </p>
                          {(edu.startDate || edu.endDate) && (
                            <p className="text-sm text-neutral-500">
                              {edu.startDate} - {edu.endDate}
                            </p>
                          )}
                          {edu.description && (
                            <p className="text-neutral-600 mt-2 text-sm">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Competences */}
              {profile.skills && profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Competences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((userSkill) => (
                        <Badge key={userSkill.id} variant="secondary">
                          {userSkill.skill.name}
                          {userSkill._count && userSkill._count.endorsements > 0 && (
                            <span className="ml-1 text-xs opacity-70">
                              ({userSkill._count.endorsements})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Infos de contact */}
              {profile.website && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Coordonnees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-500 hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reseau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Connexions</span>
                    <span className="font-semibold">{connectionCount}</span>
                  </div>
                  {profile._count && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Abonnes</span>
                        <span className="font-semibold">{profile._count.followers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Abonnements</span>
                        <span className="font-semibold">{profile._count.following}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
