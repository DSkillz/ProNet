import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ProNet - Le réseau professionnel open-source",
  description:
    "Rejoignez ProNet, le réseau social professionnel libre et transparent. Connectez-vous avec des professionnels, trouvez des opportunités et développez votre carrière.",
  keywords: [
    "réseau professionnel",
    "emploi",
    "carrière",
    "open source",
    "LinkedIn alternative",
  ],
  authors: [{ name: "ProNet Community" }],
  openGraph: {
    title: "ProNet - Le réseau professionnel open-source",
    description: "Le réseau social professionnel libre et transparent",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
