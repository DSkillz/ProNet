import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';

// Créer le transporter
const createTransporter = () => {
  // En production, utiliser un vrai service SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // En développement, utiliser Ethereal (fake SMTP)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'ethereal_user',
      pass: process.env.ETHEREAL_PASS || 'ethereal_pass',
    },
  });
};

const transporter = createTransporter();

const APP_NAME = 'ProNet';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@pronet.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Générer un token de vérification
export const generateVerificationToken = (): string => {
  return nanoid(32);
};

// Template HTML de base
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo h1 { color: #0066CC; margin: 0; font-size: 28px; }
    .content { color: #333; line-height: 1.6; }
    .button { display: inline-block; background: #0066CC; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #0052a3; }
    .footer { text-align: center; margin-top: 24px; color: #666; font-size: 14px; }
    .code { background: #f0f0f0; padding: 16px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>${APP_NAME}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Cet email a été envoyé par ${APP_NAME}.</p>
        <p>Si vous n'avez pas demandé cet email, vous pouvez l'ignorer.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Envoyer email de vérification
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<boolean> => {
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  const html = baseTemplate(`
    <h2>Bienvenue sur ${APP_NAME}, ${firstName} !</h2>
    <p>Merci de vous être inscrit. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Vérifier mon email</a>
    </p>
    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
    <p>Ce lien expire dans 24 heures.</p>
  `);

  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Vérifiez votre email - ${APP_NAME}`,
      html,
    });

    console.log('Email de vérification envoyé:', info.messageId);

    // En développement avec Ethereal, afficher l'URL de prévisualisation
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Envoyer email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<boolean> => {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  const html = baseTemplate(`
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour ${firstName},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    </p>
    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
    <p>Ce lien expire dans 1 heure.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
  `);

  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Réinitialisation de mot de passe - ${APP_NAME}`,
      html,
    });

    console.log('Email de réinitialisation envoyé:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Envoyer notification de connexion
export const sendLoginNotificationEmail = async (
  email: string,
  firstName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> => {
  const date = new Date().toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = baseTemplate(`
    <h2>Nouvelle connexion détectée</h2>
    <p>Bonjour ${firstName},</p>
    <p>Une nouvelle connexion à votre compte ${APP_NAME} a été détectée :</p>
    <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Date :</strong> ${date}</p>
      ${ipAddress ? `<p style="margin: 4px 0;"><strong>Adresse IP :</strong> ${ipAddress}</p>` : ''}
      ${userAgent ? `<p style="margin: 4px 0;"><strong>Appareil :</strong> ${userAgent}</p>` : ''}
    </div>
    <p>Si ce n'était pas vous, sécurisez immédiatement votre compte en changeant votre mot de passe.</p>
  `);

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Nouvelle connexion à votre compte - ${APP_NAME}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Envoyer email de bienvenue
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const html = baseTemplate(`
    <h2>Bienvenue sur ${APP_NAME} !</h2>
    <p>Bonjour ${firstName},</p>
    <p>Votre email a été vérifié avec succès. Votre compte ${APP_NAME} est maintenant actif !</p>
    <p>Voici quelques étapes pour bien commencer :</p>
    <ul style="color: #555;">
      <li>Complétez votre profil pour vous faire remarquer</li>
      <li>Connectez-vous avec des professionnels de votre secteur</li>
      <li>Explorez les offres d'emploi qui correspondent à vos compétences</li>
      <li>Partagez vos connaissances avec la communauté</li>
    </ul>
    <p style="text-align: center;">
      <a href="${FRONTEND_URL}/profile" class="button">Compléter mon profil</a>
    </p>
  `);

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Bienvenue sur ${APP_NAME} !`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};
