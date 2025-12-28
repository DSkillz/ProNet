"use client";

import { Navbar, Footer } from "@/components/layout";
import { Card } from "@/components/ui";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Conditions d'utilisation</h1>

          <p className="text-neutral-500 mb-8">Derniere mise a jour : 28 decembre 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Acceptation des conditions</h2>
            <p className="text-neutral-700">
              En accedant et en utilisant ProNet, vous acceptez d'etre lie par ces conditions d'utilisation,
              toutes les lois et reglements applicables. Si vous n'acceptez pas ces conditions,
              vous ne devez pas utiliser ce service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Description du service</h2>
            <p className="text-neutral-700">
              ProNet est une plateforme de reseautage professionnel qui permet aux utilisateurs de :
            </p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Creer et gerer un profil professionnel</li>
              <li>Se connecter avec d'autres professionnels</li>
              <li>Publier et partager du contenu professionnel</li>
              <li>Rechercher et postuler a des offres d'emploi</li>
              <li>Participer a des groupes et evenements professionnels</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Inscription et compte</h2>
            <p className="text-neutral-700">
              Pour utiliser ProNet, vous devez creer un compte en fournissant des informations exactes
              et completes. Vous etes responsable de maintenir la confidentialite de votre mot de passe
              et de toutes les activites effectuees sous votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Contenu utilisateur</h2>
            <p className="text-neutral-700">
              Vous conservez la propriete du contenu que vous publiez sur ProNet. En publiant du contenu,
              vous nous accordez une licence mondiale, non exclusive et libre de redevances pour utiliser,
              reproduire et afficher ce contenu dans le cadre du service.
            </p>
            <p className="text-neutral-700 mt-4">
              Vous vous engagez a ne pas publier de contenu :
            </p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Illegal, diffamatoire ou frauduleux</li>
              <li>Portant atteinte aux droits de tiers</li>
              <li>Contenant des virus ou codes malveillants</li>
              <li>A caractere discriminatoire ou haineux</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Propriete intellectuelle</h2>
            <p className="text-neutral-700">
              ProNet et son contenu original, ses fonctionnalites et ses fonctionnalites sont et resteront
              la propriete exclusive de ProNet et de ses concedants de licence. Le service est protege par
              les lois sur le droit d'auteur, les marques et autres lois.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Resiliation</h2>
            <p className="text-neutral-700">
              Nous pouvons suspendre ou resilier votre compte immediatement, sans preavis ni responsabilite,
              pour quelque raison que ce soit, y compris si vous violez les presentes conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Limitation de responsabilite</h2>
            <p className="text-neutral-700">
              ProNet ne sera en aucun cas responsable des dommages indirects, accessoires, speciaux,
              consecutifs ou punitifs, y compris, sans limitation, la perte de profits, de donnees,
              d'utilisation, de clientele ou d'autres pertes intangibles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Modifications</h2>
            <p className="text-neutral-700">
              Nous nous reservons le droit de modifier ces conditions a tout moment. Les modifications
              entreront en vigueur des leur publication sur cette page. Votre utilisation continue du
              service apres la publication des modifications constitue votre acceptation de ces modifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Contact</h2>
            <p className="text-neutral-700">
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter a :
            </p>
            <p className="text-primary-600 mt-2">contact@pronet.dev</p>
          </section>

          <div className="border-t border-neutral-200 pt-8 mt-8">
            <p className="text-neutral-500 text-sm">
              Voir aussi : <Link href="/privacy" className="text-primary-600 hover:underline">Politique de confidentialite</Link>
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
