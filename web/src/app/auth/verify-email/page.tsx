"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-neutral-600">Vérification en cours...</p>
      </Card>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email vérifié avec succès !");
      } else {
        setStatus("error");
        setMessage(data.error || "Erreur lors de la vérification");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-12">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Vérification en cours
            </h2>
            <p className="text-neutral-600">
              Veuillez patienter pendant que nous vérifions votre email...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Email vérifié !
            </h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <p className="text-neutral-500 mb-6">
              Votre compte est maintenant activé. Vous pouvez profiter de toutes les
              fonctionnalités de ProNet.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/feed">
                <Button className="w-full">Accéder au fil d&apos;actualité</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full">
                  Compléter mon profil
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Erreur de vérification
            </h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <p className="text-neutral-500 mb-6">
              Le lien de vérification est peut-être expiré ou invalide.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/settings">
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Renvoyer un email
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
