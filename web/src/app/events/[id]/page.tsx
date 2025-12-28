"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ArrowLeft,
  Loader2,
  Share2,
  CalendarPlus,
  ExternalLink,
  User,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  coverUrl?: string;
  attendeeCount: number;
  maxAttendees?: number;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    headline?: string;
  };
  isRegistered?: boolean;
}

// Mock data - replace with API call
const mockEvent: Event = {
  id: "1",
  title: "Meetup React Paris - Janvier 2025",
  description: "Rejoignez-nous pour le premier meetup React de l'annee ! Au programme : presentations sur React Server Components, discussion sur les nouveautes de React 19, et networking.\n\nProgramme :\n- 18h30 : Accueil et networking\n- 19h00 : Introduction aux React Server Components\n- 19h45 : Pause\n- 20h00 : Retour d'experience : Migration vers React 19\n- 20h45 : Q&A et cloture",
  date: "2025-01-25",
  time: "18:30",
  endTime: "21:00",
  location: "Station F, Paris",
  isOnline: false,
  attendeeCount: 89,
  maxAttendees: 150,
  organizer: {
    id: "1",
    firstName: "Thomas",
    lastName: "Bernard",
    headline: "Lead Developer @ TechCorp",
  },
  isRegistered: false,
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvent(mockEvent);
      setIsLoading(false);
    }, 500);
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;
    setActionLoading(true);
    setTimeout(() => {
      setEvent({
        ...event,
        isRegistered: true,
        attendeeCount: event.attendeeCount + 1,
      });
      setActionLoading(false);
    }, 500);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  if (error || !event) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <Card className="text-center py-20">
              <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Evenement introuvable</h2>
              <p className="text-neutral-500 mb-6">{error || "Cet evenement n'existe pas ou a ete supprime."}</p>
              <Link href="/events">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux evenements
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendeeCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button */}
          <Link href="/events" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux evenements
          </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Event header */}
              <Card padding="none" className="overflow-hidden">
                {/* Cover */}
                <div
                  className="h-48 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400"
                  style={event.coverUrl ? { backgroundImage: `url(${event.coverUrl})`, backgroundSize: 'cover' } : {}}
                />

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={event.isOnline ? "secondary" : "primary"}>
                      {event.isOnline ? (
                        <><Video className="h-3 w-3 mr-1" /> En ligne</>
                      ) : (
                        <><MapPin className="h-3 w-3 mr-1" /> Presentiel</>
                      )}
                    </Badge>
                    {isFull && <Badge variant="danger">Complet</Badge>}
                  </div>

                  <h1 className="text-2xl font-bold text-neutral-900 mb-4">{event.title}</h1>

                  <div className="space-y-2 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-neutral-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-neutral-400" />
                      <span>{event.time}{event.endTime && ` - ${event.endTime}`}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-neutral-400" />
                      <span>
                        {event.attendeeCount} participants
                        {event.maxAttendees && ` / ${event.maxAttendees} places`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>A propos de cet evenement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Registration */}
              <Card>
                <CardContent className="space-y-4">
                  {event.isRegistered ? (
                    <>
                      <div className="text-center py-2">
                        <Badge variant="success" size="md">
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          Inscrit
                        </Badge>
                      </div>
                      {event.isOnline && event.meetingUrl && (
                        <a
                          href={event.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full">
                            <Video className="h-4 w-4 mr-2" />
                            Rejoindre la reunion
                          </Button>
                        </a>
                      )}
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleRegister}
                      isLoading={actionLoading}
                      disabled={isFull}
                    >
                      {isFull ? "Complet" : "S'inscrire"}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 20 && (
                    <p className="text-sm text-orange-600 text-center">
                      Plus que {spotsLeft} places disponibles !
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organisateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/profile/${event.organizer.id}`}
                    className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <Avatar
                      name={`${event.organizer.firstName} ${event.organizer.lastName}`}
                      src={event.organizer.avatarUrl}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-neutral-900">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                      {event.organizer.headline && (
                        <p className="text-sm text-neutral-500">{event.organizer.headline}</p>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
