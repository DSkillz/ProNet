import Link from "next/link";
import { Button } from "@/components/ui";
import { Footer } from "@/components/layout";
import {
  Users,
  Shield,
  Code2,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Github,
  ArrowRight,
  Check,
  Star,
  Zap,
  Globe,
  Lock,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Respect de la vie privée",
    description:
      "Vos données vous appartiennent. Pas de tracking publicitaire, pas de vente de données à des tiers.",
  },
  {
    icon: Code2,
    title: "100% Open Source",
    description:
      "Code transparent, auditable par tous. Contribuez au projet et façonnez son avenir.",
  },
  {
    icon: Users,
    title: "Réseau authentique",
    description:
      "Connectez-vous avec des professionnels qui partagent vos valeurs et vos intérêts.",
  },
  {
    icon: Briefcase,
    title: "Opportunités équitables",
    description:
      "Algorithme transparent pour les offres d'emploi. Pas de biais, pas de discrimination.",
  },
  {
    icon: MessageSquare,
    title: "Communication sans spam",
    description:
      "Messagerie respectueuse avec des filtres intelligents contre les sollicitations abusives.",
  },
  {
    icon: TrendingUp,
    title: "Croissance organique",
    description:
      "Votre visibilité dépend de la qualité de votre contenu, pas de votre budget publicitaire.",
  },
];

const stats = [
  { value: "50K+", label: "Professionnels" },
  { value: "10K+", label: "Entreprises" },
  { value: "25K+", label: "Offres d'emploi" },
  { value: "100%", label: "Open Source" },
];

const testimonials = [
  {
    quote:
      "Enfin un réseau professionnel qui respecte ma vie privée. Je peux développer mon réseau sans être bombardé de publicités.",
    author: "Sophie Martin",
    role: "Directrice Marketing",
    company: "TechStartup",
  },
  {
    quote:
      "L'aspect open-source m'a convaincu. Je sais exactement comment mes données sont utilisées et je peux contribuer au projet.",
    author: "Thomas Bernard",
    role: "Développeur Senior",
    company: "OpenTech",
  },
  {
    quote:
      "Les opportunités d'emploi sont plus pertinentes car l'algorithme est transparent. Pas de surprise, pas de biais cachés.",
    author: "Léa Dubois",
    role: "Product Manager",
    company: "InnovateCorp",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié pour la landing */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-primary-500">
                ProNet
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/features"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/pricing"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Tarifs
              </Link>
              <Link
                href="/open-source"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Open Source
              </Link>
              <Link
                href="/blog"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Blog
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link href="/signup">
                <Button>Rejoindre ProNet</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                100% Open Source & Gratuit
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Le réseau professionnel{" "}
                <span className="text-primary-500">libre</span> et{" "}
                <span className="text-secondary-500">transparent</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-neutral-600 max-w-xl mx-auto lg:mx-0">
                Développez votre carrière sur une plateforme qui respecte votre
                vie privée, valorise vos compétences et appartient à sa
                communauté.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Créer mon profil gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href="https://github.com/pronet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto gap-2"
                  >
                    <Github className="h-5 w-5" />
                    Voir sur GitHub
                  </Button>
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary-500" />
                  Données chiffrées
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-500" />
                  RGPD Compliant
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Sans publicité
                </div>
              </div>
            </div>

            {/* Hero Image / Illustration */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200">
                {/* Mock Profile Card */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    MD
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Marie Dupont
                    </h3>
                    <p className="text-neutral-500">
                      Développeuse Full Stack @TechCorp
                    </p>
                    <p className="text-sm text-neutral-400">
                      Paris, France • 500+ connexions
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      React
                    </span>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      TypeScript
                    </span>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      Node.js
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400">
                    Profil complet à 85%
                  </p>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse-soft">
                  +3 nouvelles connexions
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white border border-neutral-200 px-4 py-2 rounded-lg shadow-lg text-sm">
                  <span className="text-accent-500 font-semibold">5</span>{" "}
                  offres correspondent à votre profil
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
              Pourquoi choisir ProNet ?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              Une plateforme conçue par et pour les professionnels, avec des
              valeurs d'éthique et de transparence au cœur de chaque
              fonctionnalité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-neutral-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
              La différence ProNet
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Comparez et voyez pourquoi les professionnels nous choisissent
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div />
              <div className="font-semibold text-primary-500 text-lg">
                ProNet
              </div>
              <div className="font-semibold text-neutral-400 text-lg">
                Autres
              </div>
            </div>

            {[
              "Open Source",
              "Sans publicité",
              "Données non vendues",
              "Algorithme transparent",
              "Auto-hébergeable",
              "Gratuit à vie",
            ].map((feature, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 py-4 border-b border-neutral-200"
              >
                <div className="text-neutral-700 font-medium">{feature}</div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-500 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
                    <span className="text-lg">✕</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-neutral-50 border border-neutral-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-accent-400 text-accent-400"
                    />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Zap className="h-16 w-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à rejoindre la révolution ?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Créez votre profil en moins de 2 minutes et découvrez un réseau
            professionnel différent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary-500 hover:bg-neutral-100 gap-2"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://github.com/pronet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                <Github className="h-5 w-5" />
                Contribuer au projet
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
