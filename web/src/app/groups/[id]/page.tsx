"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Users,
  Globe,
  Lock,
  Calendar,
  ArrowLeft,
  Loader2,
  UserPlus,
  UserCheck,
  Settings,
  MessageCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { formatDistanceToNow } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  coverUrl?: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  admins: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }>;
  isMember?: boolean;
  isPending?: boolean;
}

// Mock data - replace with API call
const mockGroup: Group = {
  id: "1",
  name: "Developpeurs React France",
  description: "Communaute des developpeurs React en France. Partagez vos connaissances, posez vos questions et restez informes des dernieres actualites de l'ecosysteme React.",
  isPrivate: false,
  memberCount: 2453,
  postCount: 847,
  createdAt: "2023-01-15T00:00:00Z",
  admins: [
    { id: "1", firstName: "Jean", lastName: "Dupont" },
    { id: "2", firstName: "Marie", lastName: "Martin" },
  ],
  isMember: false,
  isPending: false,
};

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGroup(mockGroup);
      setIsLoading(false);
    }, 500);
  }, [groupId]);

  const handleJoinGroup = async () => {
    if (!group) return;
    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      setGroup({
        ...group,
        isMember: !group.isPrivate,
        isPending: group.isPrivate,
        memberCount: group.memberCount + 1,
      });
      setActionLoading(false);
    }, 500);
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

  if (error || !group) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Groupe introuvable</h2>
              <p className="text-neutral-500 mb-6">{error || "Ce groupe n'existe pas ou a ete supprime."}</p>
              <Link href="/groups">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux groupes
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
          <Link href="/groups" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux groupes
          </Link>

          {/* Group header */}
          <Card padding="none" className="overflow-hidden mb-6">
            {/* Cover */}
            <div
              className="h-40 md:h-56 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400"
              style={group.coverUrl ? { backgroundImage: `url(${group.coverUrl})`, backgroundSize: 'cover' } : {}}
            />

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-neutral-900">{group.name}</h1>
                    <Badge variant={group.isPrivate ? "neutral" : "secondary"}>
                      {group.isPrivate ? (
                        <><Lock className="h-3 w-3 mr-1" /> Prive</>
                      ) : (
                        <><Globe className="h-3 w-3 mr-1" /> Public</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-neutral-600 mb-4">{group.description}</p>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.memberCount.toLocaleString()} membres
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {group.postCount} publications
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Cree {formatDistanceToNow(new Date(group.createdAt))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200">
                {group.isMember ? (
                  <>
                    <Button variant="secondary">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Membre
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Discussions
                    </Button>
                  </>
                ) : group.isPending ? (
                  <Button variant="secondary" disabled>
                    <Loader2 className="h-4 w-4 mr-2" />
                    Demande en attente
                  </Button>
                ) : (
                  <Button onClick={handleJoinGroup} isLoading={actionLoading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {group.isPrivate ? "Demander a rejoindre" : "Rejoindre le groupe"}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publications recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {group.isMember ? (
                    <p className="text-neutral-500 text-center py-8">
                      Aucune publication recente
                    </p>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">
                        Rejoignez ce groupe pour voir les publications
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Admins */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Administrateurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.admins.map((admin) => (
                    <Link
                      key={admin.id}
                      href={`/profile/${admin.id}`}
                      className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Avatar name={`${admin.firstName} ${admin.lastName}`} src={admin.avatarUrl} size="sm" />
                      <span className="font-medium text-sm text-neutral-900">
                        {admin.firstName} {admin.lastName}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Regles du groupe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>1. Restez respectueux et courtois</li>
                    <li>2. Pas de spam ni de publicite</li>
                    <li>3. Partagez du contenu pertinent</li>
                    <li>4. Citez vos sources</li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
