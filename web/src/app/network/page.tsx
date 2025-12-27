"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent, Input } from "@/components/ui";
import {
  Search,
  UserPlus,
  UserCheck,
  Users,
  MapPin,
  MoreHorizontal,
  X,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { connectionsApi } from "@/lib/api";

type TabId = "suggestions" | "pending" | "connections";

interface Connection {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    avatarUrl?: string;
    location?: string;
  };
  createdAt: string;
  message?: string;
}

interface Suggestion {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  avatarUrl?: string;
  location?: string;
  mutualConnections: number;
}

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<TabId>("suggestions");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [pending, setPending] = useState<Connection[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const [suggestionsRes, pendingRes, connectionsRes] = await Promise.all([
      connectionsApi.getSuggestions(),
      connectionsApi.getPending(),
      connectionsApi.getAll(),
    ]);

    if (suggestionsRes.data) {
      setSuggestions(suggestionsRes.data as any);
    }
    if (pendingRes.data) {
      setPending(pendingRes.data as any);
    }
    if (connectionsRes.data) {
      setConnections(connectionsRes.data as any);
    }

    setIsLoading(false);
  };

  const handleSendConnection = async (userId: string) => {
    setActionLoading(userId);
    const result = await connectionsApi.send(userId);
    if (!result.error) {
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    }
    setActionLoading(null);
  };

  const handleAcceptConnection = async (connectionId: string) => {
    setActionLoading(connectionId);
    const result = await connectionsApi.respond(connectionId, "ACCEPTED");
    if (!result.error) {
      setPending((prev) => prev.filter((p) => p.id !== connectionId));
      fetchData(); // Refresh to update connections list
    }
    setActionLoading(null);
  };

  const handleDeclineConnection = async (connectionId: string) => {
    setActionLoading(connectionId);
    const result = await connectionsApi.respond(connectionId, "DECLINED");
    if (!result.error) {
      setPending((prev) => prev.filter((p) => p.id !== connectionId));
    }
    setActionLoading(null);
  };

  const handleRemoveConnection = async (connectionId: string) => {
    setActionLoading(connectionId);
    const result = await connectionsApi.remove(connectionId);
    if (!result.error) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    }
    setActionLoading(null);
  };

  const tabs = [
    { id: "suggestions" as TabId, label: "Suggestions", count: suggestions.length },
    { id: "pending" as TabId, label: "Invitations", count: pending.length },
    { id: "connections" as TabId, label: "Connexions", count: connections.length },
  ];

  const filteredConnections = connections.filter((conn) => {
    const name = `${conn.user.firstName} ${conn.user.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <Card className="mb-6">
            <h1 className="text-xl font-bold text-neutral-900 mb-4">Mon réseau</h1>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200 -mx-4 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-500"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <Badge
                      variant={activeTab === tab.id ? "primary" : "secondary"}
                      className="text-xs"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Suggestions Tab */}
              {activeTab === "suggestions" && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500 mb-4">
                    Personnes que vous pourriez connaître
                  </p>

                  {suggestions.length === 0 ? (
                    <Card className="text-center py-12">
                      <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                        Aucune suggestion pour le moment
                      </h3>
                      <p className="text-neutral-500">
                        Complétez votre profil pour obtenir des suggestions.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {suggestions.map((person) => (
                        <Card key={person.id} className="relative">
                          <button className="absolute top-2 right-2 p-1 hover:bg-neutral-100 rounded">
                            <X className="h-4 w-4 text-neutral-400" />
                          </button>
                          <div className="text-center">
                            <Avatar
                              name={`${person.firstName} ${person.lastName}`}
                              src={person.avatarUrl}
                              size="lg"
                              className="mx-auto"
                            />
                            <h3 className="mt-3 font-semibold text-neutral-900">
                              {person.firstName} {person.lastName}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">
                              {person.headline || "Membre ProNet"}
                            </p>
                            {person.location && (
                              <p className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {person.location}
                              </p>
                            )}
                            <p className="text-xs text-neutral-400 mt-2">
                              {person.mutualConnections} connexions en commun
                            </p>
                            <Button
                              size="sm"
                              className="mt-4"
                              onClick={() => handleSendConnection(person.id)}
                              disabled={actionLoading === person.id}
                            >
                              {actionLoading === person.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Se connecter
                                </>
                              )}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pending Tab */}
              {activeTab === "pending" && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500 mb-4">
                    Invitations reçues ({pending.length})
                  </p>

                  {pending.length === 0 ? (
                    <Card className="text-center py-12">
                      <UserPlus className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                        Aucune invitation en attente
                      </h3>
                      <p className="text-neutral-500">
                        Les demandes de connexion apparaîtront ici.
                      </p>
                    </Card>
                  ) : (
                    pending.map((invitation) => (
                      <Card key={invitation.id}>
                        <div className="flex items-start gap-4">
                          <Avatar
                            name={`${invitation.user.firstName} ${invitation.user.lastName}`}
                            src={invitation.user.avatarUrl}
                            size="lg"
                          />
                          <div className="flex-1">
                            <Link
                              href={`/profile/${invitation.user.id}`}
                              className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
                            >
                              {invitation.user.firstName} {invitation.user.lastName}
                            </Link>
                            <p className="text-sm text-neutral-500">
                              {invitation.user.headline || "Membre ProNet"}
                            </p>
                            {invitation.user.location && (
                              <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {invitation.user.location}
                              </p>
                            )}
                            {invitation.message && (
                              <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                                "{invitation.message}"
                              </div>
                            )}
                            <div className="flex gap-3 mt-4">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptConnection(invitation.id)}
                                disabled={actionLoading === invitation.id}
                              >
                                {actionLoading === invitation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Accepter
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeclineConnection(invitation.id)}
                                disabled={actionLoading === invitation.id}
                              >
                                Ignorer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === "connections" && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher dans vos connexions..."
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <p className="text-sm text-neutral-500">
                    {filteredConnections.length} connexion{filteredConnections.length > 1 ? "s" : ""}
                  </p>

                  {filteredConnections.length === 0 ? (
                    <Card className="text-center py-12">
                      <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                        {searchQuery ? "Aucun résultat" : "Aucune connexion"}
                      </h3>
                      <p className="text-neutral-500">
                        {searchQuery
                          ? "Essayez avec d'autres termes."
                          : "Commencez à développer votre réseau !"}
                      </p>
                    </Card>
                  ) : (
                    filteredConnections.map((connection) => (
                      <Card key={connection.id}>
                        <div className="flex items-center gap-4">
                          <Avatar
                            name={`${connection.user.firstName} ${connection.user.lastName}`}
                            src={connection.user.avatarUrl}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/profile/${connection.user.id}`}
                              className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline truncate block"
                            >
                              {connection.user.firstName} {connection.user.lastName}
                            </Link>
                            <p className="text-sm text-neutral-500 truncate">
                              {connection.user.headline || "Membre ProNet"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/messages?user=${connection.user.id}`}>
                              <Button size="sm" variant="secondary">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveConnection(connection.id)}
                              disabled={actionLoading === connection.id}
                            >
                              {actionLoading === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
