import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // Nettoyer la base de données
  console.log("🗑️ Nettoyage des données existantes...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.experienceSkill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.userLanguage.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Créer les compétences
  console.log("🔧 Création des compétences...");
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: "React", category: "Frontend" } }),
    prisma.skill.create({ data: { name: "TypeScript", category: "Frontend" } }),
    prisma.skill.create({ data: { name: "Node.js", category: "Backend" } }),
    prisma.skill.create({ data: { name: "Next.js", category: "Frontend" } }),
    prisma.skill.create({ data: { name: "Python", category: "Backend" } }),
    prisma.skill.create({ data: { name: "PostgreSQL", category: "Database" } }),
    prisma.skill.create({ data: { name: "AWS", category: "Cloud" } }),
    prisma.skill.create({ data: { name: "Docker", category: "DevOps" } }),
    prisma.skill.create({ data: { name: "GraphQL", category: "API" } }),
    prisma.skill.create({ data: { name: "Tailwind CSS", category: "Frontend" } }),
    prisma.skill.create({ data: { name: "Java", category: "Backend" } }),
    prisma.skill.create({ data: { name: "Machine Learning", category: "AI" } }),
    prisma.skill.create({ data: { name: "UX Design", category: "Design" } }),
    prisma.skill.create({ data: { name: "Figma", category: "Design" } }),
    prisma.skill.create({ data: { name: "Scrum", category: "Management" } }),
  ]);

  // Créer les entreprises
  console.log("🏢 Création des entreprises...");
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "TechCorp France",
        slug: "techcorp-france",
        description: "TechCorp est une entreprise leader dans le développement de solutions logicielles innovantes. Innovating for tomorrow.",
        industry: "Software Development",
        size: "LARGE",
        location: "Paris, France",
        website: "https://techcorp.example.com",
      },
    }),
    prisma.company.create({
      data: {
        name: "StartupXYZ",
        slug: "startupxyz",
        description: "StartupXYZ révolutionne le secteur de la fintech avec des solutions de paiement innovantes. Disrupting the market.",
        industry: "Fintech",
        size: "SMALL",
        location: "Lyon, France",
        website: "https://startupxyz.example.com",
      },
    }),
    prisma.company.create({
      data: {
        name: "DataCorp",
        slug: "datacorp",
        description: "DataCorp fournit des solutions d'analyse de données et d'intelligence artificielle. Data-driven decisions.",
        industry: "Data Analytics",
        size: "MEDIUM",
        location: "Bordeaux, France",
        website: "https://datacorp.example.com",
      },
    }),
    prisma.company.create({
      data: {
        name: "DesignStudio",
        slug: "designstudio",
        description: "DesignStudio crée des expériences utilisateur exceptionnelles pour les marques mondiales. Beautiful by design.",
        industry: "Design Agency",
        size: "SMALL",
        location: "Nantes, France",
        website: "https://designstudio.example.com",
      },
    }),
    prisma.company.create({
      data: {
        name: "CloudTech Solutions",
        slug: "cloudtech-solutions",
        description: "CloudTech propose des services d'infrastructure cloud et de DevOps. Your cloud partner.",
        industry: "Cloud Services",
        size: "MEDIUM",
        location: "Toulouse, France",
        website: "https://cloudtech.example.com",
      },
    }),
  ]);

  // Hacher le mot de passe par défaut
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // Créer les utilisateurs
  console.log("👥 Création des utilisateurs...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "marie.dupont@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Marie",
        lastName: "Dupont",
        headline: "Lead Developer Frontend | React, TypeScript | Open Source Enthusiast",
        about: "Développeuse passionnée avec 7 ans d'expérience dans la création d'applications web modernes. Spécialisée dans React et l'écosystème JavaScript/TypeScript. Contributrice active à des projets open-source. Actuellement ouverte aux opportunités de Lead Developer.",
        location: "Paris, France",
        isOpenToWork: true,
        isHiring: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "thomas.bernard@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Thomas",
        lastName: "Bernard",
        headline: "Senior Developer @TechCorp | Node.js, AWS, Architecture Cloud",
        about: "Architecte logiciel avec 10 ans d'expérience. Expert en systèmes distribués et microservices. J'aime partager mes connaissances et mentorer les développeurs juniors.",
        location: "Paris, France",
        isOpenToWork: false,
        isHiring: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "sophie.martin@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Sophie",
        lastName: "Martin",
        headline: "Product Manager @StartupXYZ | Stratégie Produit & Growth",
        about: "Product Manager passionnée par la création de produits qui résolvent de vrais problèmes. 6 ans d'expérience en startup et scale-up. Certifiée Scrum Master.",
        location: "Lyon, France",
        isOpenToWork: false,
        isHiring: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "pierre.durand@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Pierre",
        lastName: "Durand",
        headline: "CTO @StartupXYZ | Tech Leadership & Innovation",
        about: "CTO avec 15 ans d'expérience dans le développement logiciel. Passionné par le leadership technique et l'innovation. Speaker régulier dans des conférences tech.",
        location: "Lyon, France",
        isOpenToWork: false,
        isHiring: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "julie.chen@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Julie",
        lastName: "Chen",
        headline: "Data Scientist @DataCorp | Machine Learning & AI",
        about: "Data Scientist spécialisée en Machine Learning et NLP. PhD en Intelligence Artificielle. Passionnée par l'éthique de l'IA.",
        location: "Bordeaux, France",
        isOpenToWork: true,
        isHiring: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "lea.dubois@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Léa",
        lastName: "Dubois",
        headline: "UX Designer @DesignStudio | Design System & Accessibility",
        about: "UX Designer avec une passion pour l'accessibilité et les design systems. 5 ans d'expérience en création d'interfaces utilisateur intuitives.",
        location: "Nantes, France",
        isOpenToWork: false,
        isHiring: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "marc.lefebvre@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Marc",
        lastName: "Lefebvre",
        headline: "DevOps Engineer @CloudTech | Kubernetes, Terraform, CI/CD",
        about: "DevOps Engineer passionné par l'automatisation et l'infrastructure as code. Certifié AWS et Google Cloud.",
        location: "Toulouse, France",
        isOpenToWork: false,
        isHiring: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "emma.wilson@example.com",
        password: hashedPassword,
        emailVerified: true,
        firstName: "Emma",
        lastName: "Wilson",
        headline: "Full Stack Developer | React, Node.js, GraphQL",
        about: "Développeuse full stack avec 4 ans d'expérience. Passionnée par les nouvelles technologies et le développement durable.",
        location: "Remote",
        isOpenToWork: true,
        isHiring: false,
      },
    }),
  ]);

  // Créer les expériences
  console.log("💼 Création des expériences...");
  await Promise.all([
    prisma.experience.create({
      data: {
        userId: users[0].id,
        title: "Lead Developer Frontend",
        company: "TechCorp",
        companyId: companies[0].id,
        location: "Paris, France",
        startDate: new Date("2022-01-01"),
        current: true,
        description: "Direction de l'équipe frontend (6 personnes). Migration de l'application legacy vers Next.js. Mise en place de l'architecture micro-frontend.",
      },
    }),
    prisma.experience.create({
      data: {
        userId: users[0].id,
        title: "Développeuse Full Stack",
        company: "StartupXYZ",
        companyId: companies[1].id,
        location: "Lyon, France",
        startDate: new Date("2019-03-01"),
        endDate: new Date("2021-12-31"),
        current: false,
        description: "Développement de la plateforme SaaS B2B. Intégration Stripe. API REST Node.js/Express.",
      },
    }),
    prisma.experience.create({
      data: {
        userId: users[1].id,
        title: "Senior Developer",
        company: "TechCorp",
        companyId: companies[0].id,
        location: "Paris, France",
        startDate: new Date("2020-06-01"),
        current: true,
        description: "Développement de l'architecture microservices. Mise en place de Kubernetes. Optimisation des performances.",
      },
    }),
    prisma.experience.create({
      data: {
        userId: users[2].id,
        title: "Product Manager",
        company: "StartupXYZ",
        companyId: companies[1].id,
        location: "Lyon, France",
        startDate: new Date("2021-01-01"),
        current: true,
        description: "Gestion du backlog produit. Définition de la roadmap. Coordination avec les équipes techniques et commerciales.",
      },
    }),
  ]);

  // Créer les formations
  console.log("🎓 Création des formations...");
  await Promise.all([
    prisma.education.create({
      data: {
        userId: users[0].id,
        school: "École 42",
        degree: "Architecte Logiciel",
        fieldOfStudy: "Informatique",
        startDate: new Date("2015-01-01"),
        endDate: new Date("2017-12-31"),
        description: "Formation intensive en programmation avec pédagogie peer-to-peer.",
      },
    }),
    prisma.education.create({
      data: {
        userId: users[1].id,
        school: "EPITA",
        degree: "Ingénieur",
        fieldOfStudy: "Informatique",
        startDate: new Date("2010-09-01"),
        endDate: new Date("2015-06-30"),
      },
    }),
    prisma.education.create({
      data: {
        userId: users[4].id,
        school: "Université Paris-Saclay",
        degree: "PhD",
        fieldOfStudy: "Intelligence Artificielle",
        startDate: new Date("2016-09-01"),
        endDate: new Date("2020-06-30"),
        description: "Thèse sur le traitement automatique du langage naturel.",
      },
    }),
  ]);

  // Créer les compétences utilisateur
  console.log("🎯 Attribution des compétences...");
  await Promise.all([
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[0].id } }),
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[1].id } }),
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[3].id } }),
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[9].id } }),
    prisma.userSkill.create({ data: { userId: users[1].id, skillId: skills[2].id } }),
    prisma.userSkill.create({ data: { userId: users[1].id, skillId: skills[6].id } }),
    prisma.userSkill.create({ data: { userId: users[1].id, skillId: skills[7].id } }),
    prisma.userSkill.create({ data: { userId: users[4].id, skillId: skills[4].id } }),
    prisma.userSkill.create({ data: { userId: users[4].id, skillId: skills[11].id } }),
    prisma.userSkill.create({ data: { userId: users[5].id, skillId: skills[12].id } }),
    prisma.userSkill.create({ data: { userId: users[5].id, skillId: skills[13].id } }),
  ]);

  // Créer les connexions
  console.log("🤝 Création des connexions...");
  await Promise.all([
    prisma.connection.create({ data: { senderId: users[0].id, receiverId: users[1].id, status: "ACCEPTED" } }),
    prisma.connection.create({ data: { senderId: users[0].id, receiverId: users[2].id, status: "ACCEPTED" } }),
    prisma.connection.create({ data: { senderId: users[0].id, receiverId: users[5].id, status: "ACCEPTED" } }),
    prisma.connection.create({ data: { senderId: users[1].id, receiverId: users[3].id, status: "ACCEPTED" } }),
    prisma.connection.create({ data: { senderId: users[2].id, receiverId: users[3].id, status: "ACCEPTED" } }),
    prisma.connection.create({ data: { senderId: users[4].id, receiverId: users[0].id, status: "PENDING" } }),
    prisma.connection.create({ data: { senderId: users[6].id, receiverId: users[0].id, status: "PENDING" } }),
  ]);

  // Créer les posts
  console.log("📝 Création des publications...");
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content: `🚀 Excité d'annoncer que nous avons finalement migré notre application vers Next.js 15 !

Le processus a pris 3 mois mais les résultats sont incroyables :
- ⚡ 60% de réduction du temps de chargement
- 📦 Bundle size réduit de 40%
- 🔄 Hot reload instantané avec Turbopack

Un grand merci à toute l'équipe pour leur travail acharné ! 🙌

#NextJS #React #WebPerformance #OpenSource`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[1].id,
        content: `💡 Conseil du jour pour les développeurs : 

Prenez le temps de documenter votre code. Pas juste pour les autres, mais pour vous-même dans 6 mois quand vous aurez oublié pourquoi vous avez fait ce choix d'architecture.

Les commentaires "évidents" aujourd'hui ne le seront plus demain !

Qui d'autre a déjà relu son propre code en se demandant "qui a écrit ça ?" 😅

#CleanCode #DevTips #SoftwareEngineering`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[2].id,
        content: `📊 Retour d'expérience sur notre dernier lancement produit :

Nous avons adopté une approche "build in public" et les résultats ont dépassé nos attentes :
- 2000+ utilisateurs en early access
- NPS de 67
- 150+ retours utilisateurs actionnables

La transparence paie ! Merci à tous ceux qui nous ont fait confiance 🙏

#ProductManagement #StartupLife #CustomerSuccess`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[3].id,
        content: `🎯 Nous recrutons chez StartupXYZ !

3 postes ouverts :
- Senior Frontend Developer (React/TypeScript)
- Backend Engineer (Node.js/PostgreSQL)
- DevOps Engineer (Kubernetes/AWS)

Remote-friendly, équipe passionnée, produit en forte croissance.

Intéressé ? DM ouvert ou consultez nos offres sur notre page entreprise !

#Hiring #TechJobs #RemoteWork #StartupJobs`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[4].id,
        content: `🤖 Réflexion sur l'IA générative en entreprise :

Après 6 mois d'expérimentation avec GPT-4 et Claude dans notre workflow de data science, voici mes observations :

✅ Ce qui marche bien :
- Génération de code boilerplate
- Documentation automatique
- Exploration de données exploratoire

⚠️ Ce qui nécessite de la prudence :
- Production de code critique
- Analyse statistique complexe
- Décisions métier automatisées

L'IA est un outil puissant, pas un remplacement du jugement humain.

#AI #DataScience #MachineLearning #AIEthics`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[5].id,
        content: `🎨 Petit thread sur l'accessibilité dans le design :

1/ L'accessibilité n'est pas une fonctionnalité optionnelle, c'est un droit fondamental.

2/ 15% de la population mondiale vit avec un handicap. Ignorer l'accessibilité, c'est ignorer 1 milliard de personnes.

3/ Un design accessible est souvent un meilleur design pour tout le monde.

Quelques ressources que je recommande :
- Web Content Accessibility Guidelines (WCAG)
- Inclusive Design Principles
- A11y Project

#Accessibility #UXDesign #InclusiveDesign #A11y`,
        visibility: "PUBLIC",
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[6].id,
        content: `☁️ Infrastructure as Code : pourquoi c'est devenu indispensable

Après 5 ans à gérer des infras cloud, je ne peux plus imaginer travailler sans Terraform ou Pulumi.

Avantages :
- Reproductibilité parfaite
- Versioning de l'infrastructure
- Review de code pour les changements d'infra
- Disaster recovery simplifié

Si vous gérez encore votre cloud via la console web, il est temps de changer !

#DevOps #InfrastructureAsCode #CloudComputing #Terraform`,
        visibility: "PUBLIC",
      },
    }),
  ]);

  // Créer les réactions
  console.log("👍 Création des réactions...");
  await Promise.all([
    prisma.reaction.create({ data: { userId: users[1].id, postId: posts[0].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[2].id, postId: posts[0].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[3].id, postId: posts[0].id, type: "CELEBRATE" } }),
    prisma.reaction.create({ data: { userId: users[5].id, postId: posts[0].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[0].id, postId: posts[1].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[4].id, postId: posts[1].id, type: "INSIGHTFUL" } }),
    prisma.reaction.create({ data: { userId: users[0].id, postId: posts[2].id, type: "CELEBRATE" } }),
    prisma.reaction.create({ data: { userId: users[1].id, postId: posts[2].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[0].id, postId: posts[4].id, type: "INSIGHTFUL" } }),
    prisma.reaction.create({ data: { userId: users[1].id, postId: posts[4].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[6].id, postId: posts[4].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[0].id, postId: posts[5].id, type: "LIKE" } }),
    prisma.reaction.create({ data: { userId: users[4].id, postId: posts[5].id, type: "LOVE" } }),
  ]);

  // Créer les commentaires
  console.log("💬 Création des commentaires...");
  await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: users[1].id,
        content: "Félicitations pour la migration ! Les gains de performance sont impressionnants 🎉",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: users[3].id,
        content: "Super travail ! Est-ce que vous avez des articles ou talks prévus pour partager votre retour d'expérience ?",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        authorId: users[0].id,
        content: "Tellement vrai ! J'ajouterais aussi : prenez le temps de nommer correctement vos variables 😄",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[4].id,
        authorId: users[0].id,
        content: "Merci pour ce retour d'expérience très équilibré sur l'IA. C'est exactement ce type de perspective nuancée dont on a besoin.",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[5].id,
        authorId: users[7].id,
        content: "Excellent thread ! J'ajouterais que les tests automatisés d'accessibilité (comme axe-core) sont un bon point de départ.",
      },
    }),
  ]);

  // Créer les offres d'emploi
  console.log("💼 Création des offres d'emploi...");
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        posterId: users[3].id,
        companyId: companies[1].id,
        title: "Senior Frontend Developer",
        description: `Nous recherchons un(e) Senior Frontend Developer pour rejoindre notre équipe produit.

Vous travaillerez sur notre plateforme fintech utilisée par des milliers d'entreprises.

**Responsabilités :**
- Développer de nouvelles fonctionnalités en React/TypeScript
- Améliorer les performances et l'expérience utilisateur
- Participer aux code reviews
- Mentorer les développeurs juniors

**Stack technique :** React, TypeScript, Next.js, GraphQL, Tailwind CSS`,
        requirements: "5+ ans d'expérience en développement frontend\nExpertise React et TypeScript\nExpérience avec les design systems\nBonnes compétences en communication",
        benefits: "Salaire compétitif\nRemote-friendly\nÉquipement fourni\nFormation continue\nMutuelle premium",
        location: "Lyon, France",
        locationType: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "SENIOR",
        salaryMin: 55000,
        salaryMax: 70000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[1].id,
        companyId: companies[0].id,
        title: "Backend Engineer Node.js",
        description: `TechCorp recherche un(e) Backend Engineer pour renforcer notre équipe.

**Mission :**
Vous participerez au développement de notre plateforme SaaS et à l'amélioration de notre architecture microservices.

**Ce que vous ferez :**
- Développer et maintenir les APIs REST/GraphQL
- Optimiser les performances des services existants
- Implémenter des solutions de caching et de scaling
- Collaborer avec l'équipe DevOps sur le déploiement`,
        requirements: "4+ ans d'expérience en Node.js\nExpérience avec PostgreSQL ou MongoDB\nConnaissance de Docker et Kubernetes\nAnglais professionnel",
        benefits: "Télétravail 3j/semaine\nRTT\nTickets restaurant\nParticipation aux conférences",
        location: "Paris, France",
        locationType: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "MID",
        salaryMin: 50000,
        salaryMax: 65000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        isActive: true,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[3].id,
        companyId: companies[1].id,
        title: "DevOps Engineer",
        description: `StartupXYZ cherche un(e) DevOps Engineer pour accompagner notre croissance.

**Contexte :**
Notre infrastructure cloud évolue rapidement et nous avons besoin de renforcer notre équipe pour automatiser et sécuriser nos déploiements.

**Missions :**
- Gérer l'infrastructure AWS/GCP
- Implémenter l'Infrastructure as Code (Terraform)
- Améliorer les pipelines CI/CD
- Monitoring et alerting`,
        requirements: "3+ ans en DevOps/SRE\nMaîtrise de Kubernetes\nExpérience Terraform\nScripting (Bash, Python)",
        benefits: "100% Remote possible\nStock options\nBudget formation\nFlexibilité horaires",
        location: "Remote",
        locationType: "REMOTE",
        employmentType: "FULL_TIME",
        experienceLevel: "MID",
        salaryMin: 55000,
        salaryMax: 75000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[4].id,
        companyId: companies[2].id,
        title: "Data Scientist Junior",
        description: `DataCorp recrute un(e) Data Scientist Junior pour rejoindre notre équipe R&D.

**Opportunité :**
Vous travaillerez sur des projets innovants en Machine Learning et NLP.

**Ce que vous apprendrez :**
- Développer des modèles ML/DL
- Travailler avec de grands volumes de données
- Déployer des modèles en production
- Collaborer avec des experts du domaine`,
        requirements: "Master ou PhD en Data Science/ML/Stats\nMaîtrise de Python\nConnaissance de TensorFlow ou PyTorch\nBases en SQL",
        benefits: "Formation par des experts\nEnvironnement de recherche\nPublications encouragées\nFlexibilité",
        location: "Bordeaux, France",
        locationType: "HYBRID",
        employmentType: "FULL_TIME",
        experienceLevel: "ENTRY",
        salaryMin: 38000,
        salaryMax: 45000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        posterId: users[5].id,
        companyId: companies[3].id,
        title: "UX Designer",
        description: `DesignStudio recherche un(e) UX Designer créatif(ve) et passionné(e).

**Votre rôle :**
Concevoir des expériences utilisateur exceptionnelles pour nos clients.

**Responsabilités :**
- Conduire des recherches utilisateur
- Créer des wireframes et prototypes
- Développer et maintenir le design system
- Collaborer avec les équipes de développement`,
        requirements: "3+ ans en UX Design\nMaîtrise de Figma\nPortfolio démontrant votre processus\nSensibilité à l'accessibilité",
        benefits: "Projets variés et stimulants\nÉquipe créative\nMacBook Pro\nSemaine de 4 jours possible",
        location: "Nantes, France",
        locationType: "ON_SITE",
        employmentType: "FULL_TIME",
        experienceLevel: "MID",
        salaryMin: 42000,
        salaryMax: 55000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEARLY",
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Créer quelques notifications
  console.log("🔔 Création des notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "CONNECTION_REQUEST",
        title: "Nouvelle demande de connexion",
        content: "Julie Chen souhaite se connecter avec vous",
        link: `/network`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "CONNECTION_REQUEST",
        title: "Nouvelle demande de connexion",
        content: "Marc Lefebvre souhaite se connecter avec vous",
        link: `/network`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "POST_LIKE",
        title: "Nouvelle réaction",
        content: "Thomas Bernard a aimé votre publication",
        link: `/posts/${posts[0].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "POST_COMMENT",
        title: "Nouveau commentaire",
        content: "Pierre Durand a commenté votre publication",
        link: `/posts/${posts[0].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "JOB_MATCH",
        title: "Offre recommandée",
        content: "Une nouvelle offre d'emploi correspond à votre profil : Senior Frontend Developer",
        link: `/jobs/${jobs[0].id}`,
      },
    }),
  ]);

  // Créer une conversation
  console.log("💬 Création des conversations...");
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: users[1].id,
        receiverId: users[0].id,
        content: "Salut Marie ! J'ai vu ton post sur la migration Next.js, super travail !",
      },
      {
        conversationId: conversation.id,
        senderId: users[0].id,
        receiverId: users[1].id,
        content: "Merci Thomas ! C'était un gros projet mais on est content du résultat 😊",
      },
      {
        conversationId: conversation.id,
        senderId: users[1].id,
        receiverId: users[0].id,
        content: "On pourrait en discuter un de ces jours ? J'envisage aussi une migration pour notre projet.",
      },
      {
        conversationId: conversation.id,
        senderId: users[0].id,
        receiverId: users[1].id,
        content: "Avec plaisir ! On peut faire un call la semaine prochaine si tu veux.",
      },
    ],
  });

  console.log("✅ Seeding terminé avec succès !");
  console.log(`
📊 Résumé :
- ${users.length} utilisateurs créés
- ${companies.length} entreprises créées
- ${skills.length} compétences créées
- ${posts.length} publications créées
- ${jobs.length} offres d'emploi créées

🔐 Identifiants de test :
- Email: marie.dupont@example.com
- Mot de passe: Password123!

(Tous les utilisateurs ont le même mot de passe)
  `);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
