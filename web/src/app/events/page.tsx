"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, CardContent, Avatar } from "@/components/ui";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { eventsApi, Event } from "@/lib/api";

const eventTypes = [
  { value: "", label: "Tous les types" },
  { value: "WEBINAR", label: "Webinaire" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "MEETUP", label: "Meetup" },
  { value: "NETWORKING", label: "Networking" },
];

const eventFormats = [
  { value: "", label: "Tous les formats" },
  { value: "IN_PERSON", label: "En présentiel" },
  { value: "ONLINE", label: "En ligne" },
  { value: "HYBRID", label: "Hybride" },
];

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"discover" | "my">("discover");
  const [typeFilter, setTypeFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, formatFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    const params: any = { limit: 20 };
    if (typeFilter) params.type = typeFilter;
    if (formatFilter) params.format = formatFilter;

    const result = await eventsApi.getAll(params);
    if (result.data) {
      setEvents(result.data.events);
    }
    setIsLoading(false);
  };

  const fetchMyEvents = async () => {
    const result = await eventsApi.getMy("registered");
    if (result.data) {
      setMyEvents(result.data.events);
    }
  };

  const handleRegister = async (eventId: string) => {
    const result = await eventsApi.register(eventId);
    if (result.data) {
      fetchEvents();
      fetchMyEvents();
    }
  };

  const handleUnregister = async (eventId: string) => {
    await eventsApi.unregister(eventId);
    fetchEvents();
    fetchMyEvents();
  };

  const displayedEvents = activeTab === "my" ? myEvents : events;

  const filteredEvents = searchQuery
    ? displayedEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayedEvents;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Événements</h1>
              <p className="text-neutral-600">
                Découvrez des événements professionnels près de chez vous
              </p>
            </div>
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "discover"
                  ? "bg-primary-500 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Découvrir
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "my"
                  ? "bg-primary-500 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Mes événements ({myEvents.length})
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {eventFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {activeTab === "my"
                  ? "Vous n'êtes inscrit à aucun événement"
                  : "Aucun événement trouvé"}
              </h3>
              <p className="text-neutral-600">
                {activeTab === "my"
                  ? "Explorez les événements disponibles et inscrivez-vous !"
                  : "Soyez le premier à créer un événement !"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.coverImage ? (
                    <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 relative">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {event.type}
                      </span>
                      {event.format === "ONLINE" && (
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" /> En ligne
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 hover:text-primary-500">
                        {event.title}
                      </h3>
                    </Link>
                    <div className="space-y-1 text-sm text-neutral-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatEventDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendeesCount} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={`${event.organizer.firstName} ${event.organizer.lastName}`}
                          src={event.organizer.avatarUrl}
                          size="sm"
                        />
                        <span className="text-sm text-neutral-600">
                          {event.organizer.firstName}
                        </span>
                      </div>
                      {event.isRegistered ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnregister(event.id)}
                        >
                          Se désinscrire
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleRegister(event.id)}>
                          S'inscrire
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
