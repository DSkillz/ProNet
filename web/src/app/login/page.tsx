"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Github, Mail, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    router.push("/feed");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/feed");
    } else {
      setError(result.error || "Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Panneau gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <span className="text-3xl font-bold text-white">ProNet</span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Rejoignez le réseau professionnel{" "}
            <span className="text-primary-200">open-source</span>
          </h1>
          <p className="text-xl text-primary-100">
            Connectez-vous avec des milliers de professionnels qui partagent vos
            valeurs de transparence et de respect de la vie privée.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-primary-200">Professionnels</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-primary-200">Open Source</div>
            </div>
          </div>
        </div>

        <div className="text-primary-200 text-sm">
          © 2024 ProNet - Le réseau professionnel libre
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-primary-500">ProNet</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">
                Bon retour parmi nous
              </h2>
              <p className="text-neutral-500 mt-2">
                Connectez-vous à votre compte ProNet
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Boutons OAuth */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-neutral-700">
                  Continuer avec Google
                </span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                <Github className="h-5 w-5" />
                <span className="font-medium text-neutral-700">
                  Continuer avec GitHub
                </span>
              </button>
            </div>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">
                  ou avec votre email
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Adresse email"
                type="email"
                placeholder="vous@exemple.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-700">
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-500 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="remember" className="text-sm text-neutral-600">
                  Se souvenir de moi
                </label>
              </div>

              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="text-primary-500 font-medium hover:underline"
              >
                Créer un compte gratuitement
              </Link>
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
