import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Github, Heart, Shield, Code2, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12 text-white">
            <h1 className="text-3xl font-bold mb-4">À propos de ProNet</h1>
            <p className="text-lg text-white/90">
              Le réseau professionnel open source et respectueux de votre vie privée.
            </p>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Notre mission
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                ProNet est né d&apos;une conviction simple : les professionnels méritent un réseau social
                qui respecte leur vie privée, ne vend pas leurs données et fonctionne de manière transparente.
                Nous croyons que la technologie peut servir les utilisateurs sans les exploiter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary-500" />
                Open Source
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                ProNet est entièrement open source. Cela signifie que tout le monde peut voir comment
                l&apos;application fonctionne, contribuer à son amélioration et même héberger sa propre instance.
                La transparence est au cœur de notre projet.
              </p>
              <a
                href="https://github.com/pronet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="gap-2">
                  <Github className="h-4 w-4" />
                  Voir le code sur GitHub
                </Button>
              </a>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary-500" />
                Nos valeurs
              </h2>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <span><strong>Vie privée :</strong> Vos données vous appartiennent. Nous ne les vendons jamais.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <span><strong>Transparence :</strong> Notre code est ouvert et nos algorithmes sont documentés.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <span><strong>Équité :</strong> Pas de biais cachés dans les recommandations d&apos;emploi ou de connexions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <span><strong>Communauté :</strong> ProNet appartient à sa communauté, pas à des actionnaires.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-500" />
                L&apos;équipe
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                ProNet est développé par une communauté de contributeurs passionnés.
                Rejoignez-nous pour construire ensemble le réseau professionnel de demain !
              </p>
            </section>

            <div className="pt-6 border-t border-neutral-200">
              <p className="text-neutral-500 text-sm">
                Des questions ? Contactez-nous à{" "}
                <a href="mailto:contact@pronet.com" className="text-primary-500 hover:underline">
                  contact@pronet.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
