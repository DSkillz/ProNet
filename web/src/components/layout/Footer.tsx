import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Fonctionnalités", href: "/features" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Open Source", href: "/open-source" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/api" },
    { label: "Blog", href: "/blog" },
    { label: "Communauté", href: "/community" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Carrières", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Presse", href: "/press" },
  ],
  legal: [
    { label: "Confidentialité", href: "/privacy" },
    { label: "CGU", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Licences", href: "/licenses" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-primary-500">ProNet</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-500">
              Le réseau professionnel open-source, transparent et respectueux de
              votre vie privée.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/pronet"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/pronet"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Produit</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Ressources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Entreprise</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Légal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} ProNet. Tous droits réservés.
          </p>
          <p className="text-sm text-neutral-500 flex items-center gap-1">
            Fait avec <Heart className="h-4 w-4 text-red-500" /> par la
            communauté open-source
          </p>
        </div>
      </div>
    </footer>
  );
}
