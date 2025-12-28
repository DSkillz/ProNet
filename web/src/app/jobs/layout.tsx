import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Offres d'Emploi - Trouvez Votre Prochain Job",
  description: "Découvrez des milliers d'offres d'emploi dans tous les secteurs. CDI, CDD, freelance, remote - Trouvez le job de vos rêves sur ProNet. Postulez en un clic !",
  keywords: [
    "offres emploi",
    "recherche emploi",
    "job",
    "CDI",
    "CDD",
    "freelance",
    "remote",
    "télétravail",
    "recrutement",
    "carrière",
    "emploi tech",
    "emploi startup",
    "emploi Paris",
    "emploi Lyon",
  ],
  openGraph: {
    title: "Offres d'Emploi | ProNet",
    description: "Des milliers d'offres d'emploi vous attendent. Trouvez votre prochain job sur ProNet.",
    type: "website",
    url: "https://pronet.careers/jobs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Offres d'Emploi | ProNet",
    description: "Trouvez votre prochain emploi parmi des milliers d'offres sur ProNet.",
  },
  alternates: {
    canonical: "https://pronet.careers/jobs",
  },
};

// JSON-LD pour les offres d'emploi
const jobsJsonLd = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://pronet.careers/jobs"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://pronet.careers/jobs?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsJsonLd) }}
      />
      {children}
    </>
  );
}
