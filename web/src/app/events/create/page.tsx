"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { Calendar, MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { eventsApi } from "@/lib/api";

const eventTypes = [
  { value: "WEBINAR", label: "Webinaire" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "MEETUP", label: "Meetup" },
  { value: "NETWORKING", label: "Networking" },
];

const eventFormats = [
  { value: "IN_PERSON", label: "En présentiel" },
  { value: "ONLINE", label: "En ligne" },
  { value: "HYBRID", label: "Hybride" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "MEETUP",
    format: "IN_PERSON",
    location: "",
    onlineUrl: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxAttendees: "",
    coverImage: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Combiner date et heure
    const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
    const endDateTime = formData.endDate && formData.endTime
      ? `${formData.endDate}T${formData.endTime}:00`
      : undefined;

    const eventData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      format: formData.format,
      location: formData.format !== "ONLINE" ? formData.location : undefined,
      onlineUrl: formData.format !== "IN_PERSON" ? formData.onlineUrl : undefined,
      startDate: startDateTime,
      endDate: endDateTime,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      coverImage: formData.coverImage || undefined,
    };

    const result = await eventsApi.create(eventData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push("/events");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/events"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Link>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    Créer un événement
                  </h1>
                  <p className="text-neutral-500">
                    Organisez un événement professionnel
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Titre de l&apos;événement *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Meetup React Paris"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                {/* Type et Format */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Type d&apos;événement *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Format *
                    </label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {eventFormats.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lieu */}
                {formData.format !== "ONLINE" && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ex: 42 rue de la Paix, Paris"
                    />
                  </div>
                )}

                {/* URL en ligne */}
                {formData.format !== "IN_PERSON" && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Lien de connexion
                    </label>
                    <input
                      type="url"
                      name="onlineUrl"
                      value={formData.onlineUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ex: https://meet.google.com/..."
                    />
                  </div>
                )}

                {/* Date et heure de début */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date et heure de fin */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Nombre max de participants */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre maximum de participants
                  </label>
                  <input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Laisser vide pour illimité"
                  />
                </div>

                {/* Image de couverture */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    URL de l&apos;image de couverture
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer l'événement"
                    )}
                  </Button>
                  <Link href="/events">
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
