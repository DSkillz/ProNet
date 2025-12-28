import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Événements Professionnels - Conférences, Meetups, Webinaires",
  description: "Découvrez des événements professionnels près de chez vous : conférences, meetups, webinaires, ateliers. Développez votre réseau et vos compétences sur ProNet.",
  keywords: [
    "événements professionnels",
    "conférences",
    "meetups",
    "webinaires",
    "networking",
    "ateliers",
    "formation",
    "séminaires",
  ],
  openGraph: {
    title: "Événements Professionnels | ProNet",
    description: "Participez à des événements professionnels et développez votre réseau.",
    type: "website",
    url: "https://pronet.careers/events",
  },
  twitter: {
    card: "summary_large_image",
    title: "Événements Professionnels | ProNet",
    description: "Découvrez des conférences, meetups et webinaires sur ProNet.",
  },
  alternates: {
    canonical: "https://pronet.careers/events",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
