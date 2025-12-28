"use client";

import { Navbar, Footer } from "@/components/layout";
import { Card } from "@/components/ui";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Politique de confidentialite</h1>

          <p className="text-neutral-500 mb-8">Derniere mise a jour : 28 decembre 2024</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-700">
              Chez ProNet, nous accordons une grande importance a la protection de vos donnees personnelles.
              Cette politique de confidentialite explique comment nous collectons, utilisons, partageons
              et protegeons vos informations lorsque vous utilisez notre plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Donnees collectees</h2>
            <p className="text-neutral-700">Nous collectons les types de donnees suivants :</p>

            <h3 className="text-lg font-medium text-neutral-800 mt-4 mb-2">Informations fournies directement</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              <li>Nom, prenom et adresse email</li>
              <li>Photo de profil et informations professionnelles</li>
              <li>Experience professionnelle et formation</li>
              <li>Competences et certifications</li>
              <li>Publications et commentaires</li>
            </ul>

            <h3 className="text-lg font-medium text-neutral-800 mt-4 mb-2">Informations collectees automatiquement</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              <li>Adresse IP et informations de l'appareil</li>
              <li>Donnees de navigation et d'utilisation</li>
              <li>Cookies et technologies similaires</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Utilisation des donnees</h2>
            <p className="text-neutral-700">Nous utilisons vos donnees pour :</p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Fournir et ameliorer nos services</li>
              <li>Personnaliser votre experience utilisateur</li>
              <li>Vous mettre en relation avec d'autres professionnels</li>
              <li>Vous suggerer des offres d'emploi pertinentes</li>
              <li>Vous envoyer des notifications et communications</li>
              <li>Assurer la securite de la plateforme</li>
              <li>Respecter nos obligations legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Partage des donnees</h2>
            <p className="text-neutral-700">
              Vos informations de profil public sont visibles par les autres utilisateurs selon vos
              parametres de confidentialite. Nous pouvons partager vos donnees avec :
            </p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Les recruteurs lorsque vous postulez a une offre</li>
              <li>Nos prestataires de services (hebergement, email, etc.)</li>
              <li>Les autorites competentes si requis par la loi</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              Nous ne vendons jamais vos donnees personnelles a des tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Securite des donnees</h2>
            <p className="text-neutral-700">
              Nous mettons en oeuvre des mesures de securite techniques et organisationnelles pour
              proteger vos donnees contre l'acces non autorise, la perte ou l'alteration. Cela inclut :
            </p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Chiffrement des donnees en transit (HTTPS)</li>
              <li>Hachage securise des mots de passe</li>
              <li>Controles d'acces stricts</li>
              <li>Surveillance continue de la securite</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Vos droits</h2>
            <p className="text-neutral-700">Conformement au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li><strong>Droit d'acces :</strong> obtenir une copie de vos donnees</li>
              <li><strong>Droit de rectification :</strong> corriger vos donnees inexactes</li>
              <li><strong>Droit a l'effacement :</strong> demander la suppression de vos donnees</li>
              <li><strong>Droit a la portabilite :</strong> recevoir vos donnees dans un format structure</li>
              <li><strong>Droit d'opposition :</strong> vous opposer a certains traitements</li>
              <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement a tout moment</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              Pour exercer ces droits, contactez-nous a : <span className="text-primary-600">privacy@pronet.dev</span>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Cookies</h2>
            <p className="text-neutral-700">
              Nous utilisons des cookies pour ameliorer votre experience sur notre plateforme.
              Les cookies sont de petits fichiers texte stockes sur votre appareil qui nous permettent de :
            </p>
            <ul className="list-disc list-inside text-neutral-700 mt-2 space-y-1">
              <li>Maintenir votre session de connexion</li>
              <li>Memoriser vos preferences</li>
              <li>Analyser l'utilisation de la plateforme</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut
              affecter certaines fonctionnalites du service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. Conservation des donnees</h2>
            <p className="text-neutral-700">
              Nous conservons vos donnees aussi longtemps que votre compte est actif ou selon les
              besoins pour vous fournir nos services. Apres la suppression de votre compte, nous
              pouvons conserver certaines donnees pour des raisons legales ou de securite pendant
              une periode limitee.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. Modifications</h2>
            <p className="text-neutral-700">
              Nous pouvons mettre a jour cette politique de confidentialite periodiquement.
              Nous vous informerons de tout changement important par email ou via une notification
              sur la plateforme.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. Contact</h2>
            <p className="text-neutral-700">
              Pour toute question concernant cette politique de confidentialite ou vos donnees personnelles :
            </p>
            <ul className="list-none text-neutral-700 mt-4 space-y-2">
              <li>Email : <span className="text-primary-600">privacy@pronet.dev</span></li>
              <li>Adresse : ProNet, Paris, France</li>
            </ul>
          </section>

          <div className="border-t border-neutral-200 pt-8 mt-8">
            <p className="text-neutral-500 text-sm">
              Voir aussi : <Link href="/terms" className="text-primary-600 hover:underline">Conditions d'utilisation</Link>
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
