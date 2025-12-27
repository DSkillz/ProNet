# ProNet API Backend

API REST et WebSocket pour le réseau social professionnel ProNet.

## 🚀 Technologies

- **Express.js** - Framework web
- **Prisma** - ORM pour PostgreSQL
- **Socket.IO** - Communication temps réel
- **JWT** - Authentification
- **Zod** - Validation des données
- **TypeScript** - Typage statique

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Peupler la base avec des données de test
npx prisma db seed
```

## ⚙️ Configuration

Copier `.env.example` vers `.env` et configurer les variables :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pronet"
JWT_SECRET="votre-secret-jwt-super-securise"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

## 🏃 Démarrage

```bash
# Mode développement (avec hot reload)
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

## 📚 Documentation API

### Authentication

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Utilisateur actuel |

### Users

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users/:id` | Profil utilisateur |
| PATCH | `/api/users/me` | Mettre à jour son profil |
| POST | `/api/users/me/experiences` | Ajouter une expérience |
| POST | `/api/users/me/education` | Ajouter une formation |
| POST | `/api/users/me/skills` | Ajouter une compétence |
| POST | `/api/users/:id/follow` | Suivre un utilisateur |

### Posts

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/posts` | Feed de posts |
| POST | `/api/posts` | Créer un post |
| GET | `/api/posts/:id` | Détail d'un post |
| PATCH | `/api/posts/:id` | Modifier un post |
| DELETE | `/api/posts/:id` | Supprimer un post |
| POST | `/api/posts/:id/reactions` | Réagir à un post |
| POST | `/api/posts/:id/comments` | Commenter un post |

### Jobs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/jobs` | Liste des emplois |
| POST | `/api/jobs` | Créer une offre |
| GET | `/api/jobs/:id` | Détail d'un emploi |
| POST | `/api/jobs/:id/apply` | Postuler |
| POST | `/api/jobs/:id/save` | Sauvegarder |

### Connections

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/connections` | Mes connexions |
| GET | `/api/connections/pending` | Demandes reçues |
| POST | `/api/connections` | Envoyer une demande |
| PATCH | `/api/connections/:id` | Répondre à une demande |
| GET | `/api/connections/suggestions` | Suggestions |

### Messages

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/messages/conversations` | Mes conversations |
| GET | `/api/messages/conversations/:id` | Messages d'une conversation |
| POST | `/api/messages` | Envoyer un message |
| GET | `/api/messages/unread-count` | Messages non lus |

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Mes notifications |
| GET | `/api/notifications/unread-count` | Nombre non lues |
| PATCH | `/api/notifications/:id/read` | Marquer comme lue |
| PATCH | `/api/notifications/read-all` | Tout marquer comme lu |

### Search

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/search?q=...` | Recherche globale |
| GET | `/api/search/skills?q=...` | Recherche de compétences |
| GET | `/api/search/trending` | Hashtags tendances |

## 🔌 WebSocket Events

### Client → Serveur

- `join_conversation` - Rejoindre une conversation
- `leave_conversation` - Quitter une conversation
- `typing_start` - Commencer à écrire
- `typing_stop` - Arrêter d'écrire
- `message_read` - Marquer un message comme lu

### Serveur → Client

- `new_message` - Nouveau message reçu
- `notification` - Nouvelle notification
- `user_typing` - Utilisateur en train d'écrire
- `message_read_receipt` - Confirmation de lecture

## 🗄️ Structure de la base de données

Le schéma Prisma définit les modèles suivants :

- **User** - Utilisateurs
- **Experience** - Expériences professionnelles
- **Education** - Formations
- **Skill** - Compétences
- **Connection** - Connexions entre utilisateurs
- **Post** - Publications
- **Comment** - Commentaires
- **Reaction** - Réactions (likes, etc.)
- **Job** - Offres d'emploi
- **JobApplication** - Candidatures
- **Message** - Messages privés
- **Conversation** - Conversations
- **Notification** - Notifications

## 📝 Licence

MIT
