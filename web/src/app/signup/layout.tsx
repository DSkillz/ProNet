import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Inscription Gratuite - Créez Votre Profil Professionnel",
  description: "Créez gratuitement votre profil professionnel sur ProNet. Rejoignez des milliers de professionnels, développez votre réseau et trouvez votre prochain emploi.",
  keywords: [
    "inscription",
    "créer compte",
    "profil professionnel",
    "réseau professionnel",
    "gratuit",
    "carrière",
  ],
  openGraph: {
    title: "Inscription Gratuite | ProNet",
    description: "Créez votre profil professionnel gratuitement et rejoignez ProNet.",
    type: "website",
    url: "https://pronet.careers/signup",
  },
  twitter: {
    card: "summary",
    title: "Inscription Gratuite | ProNet",
    description: "Créez votre profil professionnel gratuitement.",
  },
  alternates: {
    canonical: "https://pronet.careers/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
