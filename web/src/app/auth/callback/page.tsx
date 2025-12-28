"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    if (token && refreshToken) {
      // Sauvegarder les tokens et rediriger vers le feed
      setTokens(token, refreshToken);
      router.push("/feed");
    } else {
      router.push("/login?error=missing_tokens");
    }
  }, [searchParams, router, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-700">
          Connexion en cours...
        </h2>
        <p className="text-neutral-500 mt-2">
          Veuillez patienter pendant que nous vous connectons.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
