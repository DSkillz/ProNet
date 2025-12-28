import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteConfig = {
  name: "ProNet",
  description: "Le réseau professionnel nouvelle génération. Trouvez votre prochain emploi, développez votre réseau et boostez votre carrière avec ProNet.",
  url: "https://pronet.careers",
  ogImage: "https://pronet.careers/og-image.png",
  twitterHandle: "@pronet_careers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0052CC" },
  ],
};

export const metadata: Metadata = {
  // Titres et descriptions
  title: {
    default: "ProNet - Réseau Professionnel & Offres d'Emploi | pronet.careers",
    template: "%s | ProNet",
  },
  description: "Rejoignez ProNet, le réseau professionnel nouvelle génération. Trouvez des offres d'emploi, connectez-vous avec des recruteurs, développez votre réseau et boostez votre carrière. Alternative à LinkedIn et Indeed.",

  // Mots-clés SEO
  keywords: [
    // Mots-clés principaux
    "réseau professionnel",
    "offres d'emploi",
    "recherche emploi",
    "recrutement",
    "carrière",
    "CV en ligne",
    "profil professionnel",
    // Concurrence
    "alternative LinkedIn",
    "alternative Indeed",
    "réseau social professionnel",
    // Actions
    "trouver un emploi",
    "recruter",
    "networking professionnel",
    "développer son réseau",
    // Secteurs
    "emploi tech",
    "emploi informatique",
    "emploi cadre",
    "emploi startup",
    // Géographie
    "emploi France",
    "recrutement Paris",
    "offres emploi Lyon",
    "travail Marseille",
  ],

  // Auteurs et éditeur
  authors: [{ name: "ProNet", url: siteConfig.url }],
  creator: "ProNet",
  publisher: "ProNet",

  // Configuration du site
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "en-US": "/en",
    },
  },

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "ProNet - Le Réseau Professionnel Nouvelle Génération",
    description: "Trouvez votre prochain emploi, connectez-vous avec des professionnels et développez votre carrière sur ProNet. Rejoignez des milliers de professionnels.",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "ProNet - Réseau Professionnel",
        type: "image/png",
      },
      {
        url: "https://pronet.careers/og-image-square.png",
        width: 600,
        height: 600,
        alt: "ProNet Logo",
        type: "image/png",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: "ProNet - Réseau Professionnel & Emploi",
    description: "Trouvez votre prochain emploi et développez votre réseau professionnel sur ProNet.",
    images: [siteConfig.ogImage],
  },

  // Robots et indexation
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Vérification des moteurs de recherche (à remplir avec vos codes)
  verification: {
    google: "votre-code-google-search-console",
    yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },

  // Icônes
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0066FF" },
    ],
  },

  // Manifest PWA
  manifest: "/manifest.json",

  // App mobile
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },

  // Catégorie
  category: "business",

  // Classification
  classification: "Professional Networking, Job Search, Career Development",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "fr-FR",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/pronet_careers",
        "https://www.linkedin.com/company/pronet-careers",
        "https://github.com/pronet-careers",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["French", "English"],
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/#webapp`,
      name: siteConfig.name,
      description: "Plateforme de réseau professionnel et recherche d'emploi",
      url: siteConfig.url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      featureList: [
        "Création de profil professionnel",
        "Recherche d'emploi",
        "Networking professionnel",
        "Publication de posts",
        "Messagerie instantanée",
        "Création d'événements",
        "Groupes professionnels",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pronet-api-7mxx.onrender.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
