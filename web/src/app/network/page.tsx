"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent, Input } from "@/components/ui";
import {
  Search,
  UserPlus,
  UserCheck,
  Users,
  Building2,
  MapPin,
  MoreHorizontal,
  X,
  Filter,
  ChevronDown,
  Clock,
  Check,
} from "lucide-react";
import Link from "next/link";

const tabs = [
  { id: "grow", label: "Développer", count: null },
  { id: "invitations", label: "Invitations", count: 5 },
  { id: "connections", label: "Connexions", count: 523 },
];

const suggestions = [
  {
    id: 1,
    name: "Thomas Bernard",
    title: "Senior Developer @TechCorp",
    location: "Paris, France",
    mutualConnections: 12,
    avatar: null,
    reason: "Travaille chez TechCorp",
  },
  {
    id: 2,
    name: "Sophie Martin",
    title: "Product Manager @InnovateTech",
    location: "Lyon, France",
    mutualConnections: 8,
    avatar: null,
    reason: "A étudié à École 42",
  },
  {
    id: 3,
    name: "Pierre Durand",
    title: "CTO @StartupXYZ",
    location: "Bordeaux, France",
    mutualConnections: 15,
    avatar: null,
    reason: "Dans votre secteur",
  },
  {
    id: 4,
    name: "Julie Chen",
    title: "Data Scientist @DataCorp",
    location: "Paris, France",
    mutualConnections: 5,
    avatar: null,
    reason: "Compétences similaires",
  },
  {
    id: 5,
    name: "Marc Lefebvre",
    title: "DevOps Engineer @CloudTech",
    location: "Nantes, France",
    mutualConnections: 7,
    avatar: null,
    reason: "A consulté votre profil",
  },
  {
    id: 6,
    name: "Emma Wilson",
    title: "UX Designer @DesignStudio",
    location: "Remote",
    mutualConnections: 3,
    avatar: null,
    reason: "Dans votre réseau étendu",
  },
];

const invitations = [
  {
    id: 1,
    name: "Alice Moreau",
    title: "Frontend Developer @WebAgency",
    location: "Paris, France",
    mutualConnections: 6,
    avatar: null,
    receivedAt: "Il y a 2 heures",
    message: "Bonjour Marie, j'ai beaucoup apprécié votre article sur React 19. J'aimerais échanger avec vous !",
  },
  {
    id: 2,
    name: "Lucas Martin",
    title: "Tech Lead @FinTech",
    location: "Paris, France",
    mutualConnections: 4,
    avatar: null,
    receivedAt: "Il y a 1 jour",
    message: null,
  },
  {
    id: 3,
    name: "Camille Dubois",
    title: "HR Manager @TechCorp",
    location: "Paris, France",
    mutualConnections: 8,
    avatar: null,
    receivedAt: "Il y a 2 jours",
    message: "Nous recrutons des développeurs React. Seriez-vous ouverte à une discussion ?",
  },
];

const connections = [
  {
    id: 1,
    name: "Thomas Bernard",
    title: "Senior Developer @TechCorp",
    location: "Paris, France",
    connectedAt: "Connecté depuis 2 ans",
    avatar: null,
  },
  {
    id: 2,
    name: "Sophie Martin",
    title: "Product Manager @InnovateTech",
    location: "Lyon, France",
    connectedAt: "Connecté depuis 1 an",
    avatar: null,
  },
  {
    id: 3,
    name: "Pierre Durand",
    title: "CTO @StartupXYZ",
    location: "Bordeaux, France",
    connectedAt: "Connecté depuis 8 mois",
    avatar: null,
  },
  {
    id: 4,
    name: "Julie Chen",
    title: "Data Scientist @DataCorp",
    location: "Paris, France",
    connectedAt: "Connecté depuis 6 mois",
    avatar: null,
  },
];

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState("grow");
  const [searchQuery, setSearchQuery] = useState("");
  const [sentInvitations, setSentInvitations] = useState<number[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState<number[]>([]);
  const [declinedInvitations, setDeclinedInvitations] = useState<number[]>([]);

  const handleSendInvitation = (id: number) => {
    setSentInvitations((prev) => [...prev, id]);
  };

  const handleDismissSuggestion = (id: number) => {
    setDismissedSuggestions((prev) => [...prev, id]);
  };

  const handleAcceptInvitation = (id: number) => {
    setAcceptedInvitations((prev) => [...prev, id]);
  };

  const handleDeclineInvitation = (id: number) => {
    setDeclinedInvitations((prev) => [...prev, id]);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !dismissedSuggestions.includes(s.id)
  );

  const activeInvitations = invitations.filter(
    (i) => !acceptedInvitations.includes(i.id) && !declinedInvitations.includes(i.id)
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <h2 className="font-semibold text-neutral-900 mb-4">
                Gérer mon réseau
              </h2>
              <nav className="space-y-1">
                <Link
                  href="#"
                  className="flex items-center justify-between px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-neutral-400" />
                    Connexions
                  </span>
                  <span className="text-neutral-500">523</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-between px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-neutral-400" />
                    Invitations reçues
                  </span>
                  <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeInvitations.length}
                  </span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-between px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-neutral-400" />
                    Invitations envoyées
                  </span>
                  <span className="text-neutral-500">{sentInvitations.length}</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-between px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-neutral-400" />
                    Pages suivies
                  </span>
                  <span className="text-neutral-500">12</span>
                </Link>
              </nav>
            </Card>
          </aside>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Card padding="none">
              <div className="flex border-b border-neutral-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? "text-primary-500"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 text-neutral-400">({tab.count})</span>
                    )}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Développer le réseau */}
            {activeTab === "grow" && (
              <Card>
                <CardHeader>
                  <CardTitle>Personnes que vous pourriez connaître</CardTitle>
                  <span className="text-sm text-neutral-500">
                    Basé sur votre profil et vos connexions
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSuggestions.map((person) => (
                      <div
                        key={person.id}
                        className="relative p-4 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleDismissSuggestion(person.id)}
                          className="absolute top-2 right-2 p-1 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-neutral-400" />
                        </button>

                        <div className="text-center">
                          <Avatar
                            name={person.name}
                            size="lg"
                            className="mx-auto"
                          />
                          <Link
                            href="/profile"
                            className="mt-3 block font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
                          >
                            {person.name}
                          </Link>
                          <p className="text-sm text-neutral-500 mt-1">
                            {person.title}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {person.mutualConnections} relations en commun
                          </p>

                          <div className="mt-3 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full inline-block">
                            {person.reason}
                          </div>

                          <div className="mt-4">
                            {sentInvitations.includes(person.id) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                disabled
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Invitation envoyée
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => handleSendInvitation(person.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Se connecter
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button variant="ghost">Voir plus de suggestions</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invitations */}
            {activeTab === "invitations" && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Invitations reçues ({activeInvitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeInvitations.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                      <p>Aucune invitation en attente</p>
                    </div>
                  ) : (
                    activeInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex gap-4 p-4 border border-neutral-200 rounded-xl"
                      >
                        <Avatar name={invitation.name} size="lg" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href="/profile"
                                className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
                              >
                                {invitation.name}
                              </Link>
                              <p className="text-sm text-neutral-500">
                                {invitation.title}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                {invitation.mutualConnections} relations en commun •{" "}
                                {invitation.receivedAt}
                              </p>
                            </div>
                          </div>

                          {invitation.message && (
                            <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-700 italic">
                              "{invitation.message}"
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptInvitation(invitation.id)}
                            >
                              Accepter
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeclineInvitation(invitation.id)}
                            >
                              Ignorer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Connexions */}
            {activeTab === "connections" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 flex-1">
                    <CardTitle>Vos connexions (523)</CardTitle>
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Filter className="h-4 w-4" />
                    Filtrer
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <Avatar name={connection.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href="/profile"
                          className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
                        >
                          {connection.name}
                        </Link>
                        <p className="text-sm text-neutral-500 truncate">
                          {connection.title}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {connection.connectedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          Message
                        </Button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 text-center">
                    <Button variant="ghost">
                      Afficher toutes les connexions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
