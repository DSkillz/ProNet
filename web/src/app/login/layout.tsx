import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Connexion - Accédez à Votre Compte",
  description: "Connectez-vous à votre compte ProNet pour accéder à votre réseau professionnel, vos messages et les offres d'emploi personnalisées.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Connexion | ProNet",
    description: "Accédez à votre compte ProNet",
    type: "website",
    url: "https://pronet.careers/login",
  },
  alternates: {
    canonical: "https://pronet.careers/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
