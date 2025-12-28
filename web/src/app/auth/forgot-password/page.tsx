"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {!isSubmitted ? (
          <>
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la connexion
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-neutral-500">
                Entrez votre adresse email et nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-neutral-600 mb-6">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
              vous recevrez un email avec les instructions pour réinitialiser
              votre mot de passe.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              N&apos;oubliez pas de vérifier vos spams si vous ne recevez pas
              l&apos;email.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Renvoyer l&apos;email
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
