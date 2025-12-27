# 🌐 ProNet Web

> Le frontend web de ProNet - Le réseau professionnel open-source

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) v18.17 ou supérieur
- npm, yarn ou pnpm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
web/
├── src/
│   ├── app/                    # App Router Next.js 14
│   │   ├── page.tsx           # Page d'accueil (landing)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── globals.css        # Styles globaux
│   │   ├── feed/              # Fil d'actualités
│   │   └── profile/           # Page de profil
│   ├── components/
│   │   ├── ui/                # Composants UI réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   └── layout/            # Composants de mise en page
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   └── lib/
│       └── utils.ts           # Fonctions utilitaires
├── public/                     # Assets statiques
├── tailwind.config.ts         # Configuration Tailwind CSS
├── tsconfig.json              # Configuration TypeScript
└── package.json
```

## 🎨 Design System

### Couleurs

- **Primary** (Bleu `#0a66c2`) - Actions principales, liens
- **Secondary** (Vert `#22c55e`) - Succès, connexions
- **Accent** (Or `#eab308`) - Badges, premium
- **Neutral** - Textes et backgrounds

### Composants

Tous les composants UI sont dans `src/components/ui/` :

```tsx
import { Button, Avatar, Card, Input, Badge } from "@/components/ui";

// Button
<Button variant="primary" size="lg">Cliquer</Button>
<Button variant="secondary">Secondaire</Button>
<Button variant="ghost">Ghost</Button>

// Avatar
<Avatar name="Marie Dupont" size="lg" />

// Card
<Card hover>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>

// Badge
<Badge variant="primary">React</Badge>
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (non connecté) |
| `/feed` | Fil d'actualités |
| `/profile` | Page de profil |
| `/jobs` | Offres d'emploi (à venir) |
| `/network` | Réseau de connexions (à venir) |
| `/messages` | Messagerie (à venir) |

## 🛠️ Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linting ESLint
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir le guide de contribution dans le repo principal.

## 📄 Licence

MIT - Voir [LICENSE](../LICENSE)
