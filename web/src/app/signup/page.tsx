"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Github, Mail, ArrowLeft, Eye, EyeOff, User, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { id: 1, name: "Compte" },
  { id: 2, name: "Profil" },
  { id: 3, name: "Intérêts" },
];

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire étape 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Formulaire étape 2
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  // Formulaire étape 3
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    router.push("/feed");
    return null;
  }

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const validateStep1 = () => {
    if (!firstName.trim()) {
      setError("Le prénom est requis");
      return false;
    }
    if (!lastName.trim()) {
      setError("Le nom est requis");
      return false;
    }
    if (!email.trim()) {
      setError("L'email est requis");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("L'email n'est pas valide");
      return false;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return false;
    }
    return true;
  };

  const handleStep1Submit = async () => {
    setError(null);
    if (!validateStep1()) return;

    setIsLoading(true);
    const result = await register({
      email,
      password,
      firstName,
      lastName,
    });
    setIsLoading(false);

    if (result.success) {
      setCurrentStep(2);
    } else {
      setError(result.error || "Une erreur est survenue lors de l'inscription");
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  const handleFinish = () => {
    // TODO: Sauvegarder le profil et les intérêts via l'API
    router.push("/feed");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Panneau gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 p-12 flex-col justify-between">
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
            Créez votre profil en{" "}
            <span className="text-secondary-200">quelques minutes</span>
          </h1>

          <div className="space-y-4">
            {[
              "Profil professionnel complet",
              "Connexions pertinentes",
              "Opportunités d'emploi personnalisées",
              "Respect de votre vie privée",
              "100% gratuit, 100% open-source",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-secondary-200 text-sm">
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
            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      currentStep >= step.id
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:block ${
                      currentStep >= step.id
                        ? "text-neutral-900"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        currentStep > step.id
                          ? "bg-primary-500"
                          : "bg-neutral-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Étape 1 : Création de compte */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Créer votre compte
                  </h2>
                  <p className="text-neutral-500 mt-2">
                    Rejoignez la communauté ProNet
                  </p>
                </div>

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

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleStep1Submit(); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Prénom" 
                      placeholder="Jean" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <Input 
                      label="Nom" 
                      placeholder="Dupont" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

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
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
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
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength
                              ? passwordStrength <= 1
                                ? "bg-red-500"
                                : passwordStrength <= 2
                                ? "bg-orange-500"
                                : passwordStrength <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="text-sm text-neutral-600">
                      J'accepte les{" "}
                      <Link href="/terms" className="text-primary-500 hover:underline">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" className="text-primary-500 hover:underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Création du compte...
                      </>
                    ) : (
                      "Continuer"
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Étape 2 : Profil */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Complétez votre profil
                  </h2>
                  <p className="text-neutral-500 mt-2">
                    Aidez les autres à vous trouver
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }}>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                        {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Titre professionnel"
                    placeholder="ex: Développeur Full Stack"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />

                  <Input
                    label="Entreprise actuelle"
                    placeholder="ex: TechCorp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />

                  <Input
                    label="Localisation"
                    placeholder="ex: Paris, France"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Secteur d'activité
                    </label>
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="">Sélectionnez un secteur</option>
                      <option value="tech">Technologies de l'information</option>
                      <option value="finance">Finance</option>
                      <option value="health">Santé</option>
                      <option value="education">Éducation</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                      type="button"
                    >
                      Retour
                    </Button>
                    <Button
                      className="flex-1"
                      type="submit"
                    >
                      Continuer
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Étape 3 : Intérêts */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Vos centres d'intérêt
                  </h2>
                  <p className="text-neutral-500 mt-2">
                    Personnalisez votre expérience ProNet
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleFinish(); }}>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Sélectionnez vos intérêts (minimum 3)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Développement Web",
                        "Data Science",
                        "Design UX/UI",
                        "Marketing Digital",
                        "Management",
                        "Finance",
                        "Entrepreneuriat",
                        "Open Source",
                        "Intelligence Artificielle",
                        "Cloud Computing",
                        "Cybersécurité",
                        "Product Management",
                      ].map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            selectedInterests.includes(interest)
                              ? "border-primary-500 text-primary-500 bg-primary-50"
                              : "border-neutral-300 text-neutral-700 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Que cherchez-vous sur ProNet ?
                    </label>
                    <div className="space-y-2">
                      {[
                        "Trouver un emploi",
                        "Recruter des talents",
                        "Développer mon réseau",
                        "Partager mes connaissances",
                        "Apprendre de nouvelles compétences",
                      ].map((goal) => (
                        <label
                          key={goal}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedGoals.includes(goal)
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGoals.includes(goal)}
                            onChange={() => toggleGoal(goal)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-neutral-700">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setCurrentStep(2)}
                      type="button"
                    >
                      Retour
                    </Button>
                    <Button className="flex-1" type="submit">
                      Terminer l'inscription
                    </Button>
                  </div>
                </form>
              </>
            )}

            {currentStep === 1 && (
              <p className="mt-6 text-center text-sm text-neutral-500">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="text-primary-500 font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            )}
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
