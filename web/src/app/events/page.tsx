"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout";
import { Card, Button, Avatar, Badge } from "@/components/ui";
import {
  Calendar,
  Search,
  Plus,
  MapPin,
  Clock,
  Users,
  Video,
  ExternalLink,
  Filter,
  ChevronRight,
  Ticket,
  Star,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  imageUrl?: string;
  attendeeCount: number;
  maxAttendees?: number;
  organizer: {
    name: string;
    avatarUrl?: string;
  };
  category: string;
  isRegistered: boolean;
  isFree: boolean;
  price?: number;
}

// Mock data - à remplacer par API
const mockEvents: Event[] = [
  {
    id: "1",
    title: "React Paris Meetup #42",
    description: "Rejoignez-nous pour une soirée de talks sur React 19, Server Components et les dernières tendances.",
    date: "2025-01-15",
    time: "19:00",
    location: "Station F, Paris",
    isOnline: false,
    attendeeCount: 156,
    maxAttendees: 200,
    organizer: { name: "React Paris" },
    category: "Meetup",
    isRegistered: true,
    isFree: true,
  },
  {
    id: "2",
    title: "Webinar: IA & Productivité",
    description: "Découvrez comment l'IA peut transformer votre quotidien professionnel avec des outils pratiques.",
    date: "2025-01-20",
    time: "14:00",
    isOnline: true,
    attendeeCount: 423,
    organizer: { name: "Tech Insights" },
    category: "Webinar",
    isRegistered: false,
    isFree: true,
  },
  {
    id: "3",
    title: "Conférence DevOps France 2025",
    description: "La plus grande conférence DevOps francophone. 2 jours de talks, workshops et networking.",
    date: "2025-02-05",
    time: "09:00",
    location: "Centre de Conférences, Lyon",
    isOnline: false,
    attendeeCount: 850,
    maxAttendees: 1000,
    organizer: { name: "DevOps France" },
    category: "Conférence",
    isRegistered: false,
    isFree: false,
    price: 299,
  },
  {
    id: "4",
    title: "Workshop UX Research",
    description: "Apprenez les méthodologies de recherche UX avec des exercices pratiques.",
    date: "2025-01-25",
    time: "10:00",
    isOnline: true,
    attendeeCount: 45,
    maxAttendees: 50,
    organizer: { name: "UX Academy" },
    category: "Workshop",
    isRegistered: true,
    isFree: false,
    price: 49,
  },
  {
    id: "5",
    title: "Networking Entrepreneurs Tech",
    description: "Soirée de networking pour les entrepreneurs du secteur tech. Pitch sessions et échanges.",
    date: "2025-01-28",
    time: "18:30",
    location: "La Felicità, Paris",
    isOnline: false,
    attendeeCount: 89,
    maxAttendees: 150,
    organizer: { name: "Startup Network" },
    category: "Networking",
    isRegistered: false,
    isFree: true,
  },
];

const categories = ["Tous", "Meetup", "Webinar", "Conférence", "Workshop", "Networking"];

type TabType = "upcoming" | "my-events" | "past";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const myEvents = mockEvents.filter((e) => e.isRegistered);
  const upcomingEvents = mockEvents;

  const filteredEvents = (activeTab === "my-events" ? myEvents : upcomingEvents).filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || event.category === selectedCategory;
    const matchesOnline = !showOnlineOnly || event.isOnline;
    return matchesSearch && matchesCategory && matchesOnline;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Événements</h1>
                    <p className="text-neutral-500">Découvrez et participez à des événements professionnels</p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un événement..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      showOnlineOnly
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-white border-neutral-200 text-neutral-600"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    En ligne
                  </button>
                </div>

                <div className="flex gap-2 border-b border-neutral-200 -mx-4 px-4">
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "upcoming"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    À venir
                  </button>
                  <button
                    onClick={() => setActiveTab("my-events")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "my-events"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Mes événements ({myEvents.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("past")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "past"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Passés
                  </button>
                </div>
              </Card>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-primary-500 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <Card className="text-center py-12">
                    <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                      Aucun événement trouvé
                    </h3>
                    <p className="text-neutral-500">
                      {activeTab === "my-events"
                        ? "Vous n'êtes inscrit à aucun événement"
                        : "Essayez une autre recherche ou catégorie"}
                    </p>
                  </Card>
                ) : (
                  filteredEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
                          <div className="bg-primary-500 text-white px-3 py-2 rounded-lg text-center min-w-[60px]">
                            <div className="text-2xl font-bold">{new Date(event.date).getDate()}</div>
                            <div className="text-xs uppercase">
                              {new Date(event.date).toLocaleDateString("fr-FR", { month: "short" })}
                            </div>
                          </div>
                          <div className="text-sm text-neutral-500 sm:mt-2 sm:text-center">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {event.time}
                          </div>
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                              <p className="text-sm text-neutral-500 mt-1">{event.organizer.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {event.isOnline ? (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  En ligne
                                </Badge>
                              ) : (
                                <Badge variant="neutral">{event.category}</Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{event.description}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.attendeeCount}
                              {event.maxAttendees && ` / ${event.maxAttendees}`} participants
                            </span>
                            {!event.isFree && (
                              <span className="flex items-center gap-1 text-primary-600 font-medium">
                                <Ticket className="h-4 w-4" />
                                {event.price} EUR
                              </span>
                            )}
                            {event.isFree && (
                              <Badge variant="success">Gratuit</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-4">
                            {event.isRegistered ? (
                              <>
                                <Badge variant="success" className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Inscrit
                                </Badge>
                                <Link href={`/events/${event.id}`}>
                                  <Button size="sm" variant="outline">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Voir les détails
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <Button size="sm">
                                S&apos;inscrire
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Calendar Widget */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Ce mois-ci</h3>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-primary-600">{upcomingEvents.length}</p>
                  <p className="text-neutral-500">événements à venir</p>
                </div>
                <div className="space-y-2">
                  {myEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary-600">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 text-sm truncate">{event.title}</p>
                        <p className="text-xs text-neutral-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Featured Event */}
              <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Événement vedette</h4>
                    <p className="text-sm text-primary-100 mt-1">
                      Conférence DevOps France 2025 - La plus grande conférence DevOps francophone
                    </p>
                    <Button size="sm" variant="secondary" className="mt-3 bg-white text-primary-700 hover:bg-primary-50">
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Create Event CTA */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-2">Organisez un événement</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Créez votre propre événement et rassemblez votre communauté professionnelle
                </p>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
