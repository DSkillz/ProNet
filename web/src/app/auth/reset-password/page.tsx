"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-neutral-600">Chargement...</p>
      </Card>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        setError(data.error || "Une erreur est survenue");
        if (data.error?.includes("expiré") || data.error?.includes("invalide")) {
          setStatus("error");
        }
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Lien invalide
          </h2>
          <p className="text-neutral-600 mb-6">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link href="/auth/forgot-password">
            <Button>Demander un nouveau lien</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {status === "form" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-neutral-500">
                Créez un nouveau mot de passe sécurisé pour votre compte.
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
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                  required
                />
              </div>

              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-600 font-medium mb-2">
                  Votre mot de passe doit contenir :
                </p>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    {password.length >= 8 ? "✓" : "○"} Au moins 8 caractères
                  </li>
                  <li
                    className={
                      password && password === confirmPassword
                        ? "text-green-600"
                        : ""
                    }
                  >
                    {password && password === confirmPassword ? "✓" : "○"}{" "}
                    Correspondance des mots de passe
                  </li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>
            </form>
          </>
        )}

        {status === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Mot de passe réinitialisé !
            </h2>
            <p className="text-neutral-600 mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant
              vous connecter avec votre nouveau mot de passe.
            </p>
            <Link href="/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Lien expiré
            </h2>
            <p className="text-neutral-600 mb-6">
              Le lien de réinitialisation a expiré ou est invalide.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/forgot-password">
                <Button className="w-full">Demander un nouveau lien</Button>
              </Link>
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
