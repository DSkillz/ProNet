import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Groupes Professionnels - Communautés & Networking",
  description: "Rejoignez des groupes professionnels sur ProNet. Échangez avec des experts, partagez vos connaissances et développez votre réseau dans votre domaine.",
  keywords: [
    "groupes professionnels",
    "communautés",
    "networking",
    "experts",
    "discussions",
    "partage",
    "entraide professionnelle",
  ],
  openGraph: {
    title: "Groupes Professionnels | ProNet",
    description: "Rejoignez des communautés professionnelles et échangez avec des experts.",
    type: "website",
    url: "https://pronet.careers/groups",
  },
  twitter: {
    card: "summary_large_image",
    title: "Groupes Professionnels | ProNet",
    description: "Rejoignez des communautés professionnelles sur ProNet.",
  },
  alternates: {
    canonical: "https://pronet.careers/groups",
  },
};

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
