"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { Users, ArrowLeft, Loader2, Globe, Lock, EyeOff } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { groupsApi } from "@/lib/api";

const groupTypes = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Tout le monde peut voir et rejoindre le groupe",
    icon: Globe,
  },
  {
    value: "PRIVATE",
    label: "Privé",
    description: "Visible mais les membres doivent être approuvés",
    icon: Lock,
  },
  {
    value: "SECRET",
    label: "Secret",
    description: "Invisible et accessible uniquement sur invitation",
    icon: EyeOff,
  },
];

const categories = [
  { value: "TECHNOLOGY", label: "Technologie" },
  { value: "BUSINESS", label: "Business" },
  { value: "DESIGN", label: "Design" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HR", label: "Ressources Humaines" },
  { value: "FINANCE", label: "Finance" },
  { value: "OTHER", label: "Autre" },
];

export default function CreateGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PUBLIC",
    category: "TECHNOLOGY",
    rules: "",
    avatarUrl: "",
    bannerUrl: "",
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

    const groupData = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      category: formData.category,
      rules: formData.rules || undefined,
      avatarUrl: formData.avatarUrl || undefined,
      bannerUrl: formData.bannerUrl || undefined,
    };

    const result = await groupsApi.create(groupData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push("/groups");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/groups"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux groupes
          </Link>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    Créer un groupe
                  </h1>
                  <p className="text-neutral-500">
                    Rassemblez des professionnels autour d&apos;un sujet commun
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom du groupe */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom du groupe *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Développeurs React France"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Décrivez votre groupe et son objectif..."
                  />
                </div>

                {/* Type de groupe */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Type de groupe *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {groupTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.type === type.value
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              className={`h-5 w-5 ${
                                formData.type === type.value
                                  ? "text-primary-600"
                                  : "text-neutral-400"
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                formData.type === type.value
                                  ? "text-primary-700"
                                  : "text-neutral-700"
                              }`}
                            >
                              {type.label}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">{type.description}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Règles */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Règles du groupe
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Définissez les règles de comportement dans votre groupe..."
                  />
                </div>

                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      URL de l&apos;avatar
                    </label>
                    <input
                      type="url"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      URL de la bannière
                    </label>
                    <input
                      type="url"
                      name="bannerUrl"
                      value={formData.bannerUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
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
                      "Créer le groupe"
                    )}
                  </Button>
                  <Link href="/groups">
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
