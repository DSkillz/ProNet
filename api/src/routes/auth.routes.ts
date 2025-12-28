import { Router } from 'express';
import { prisma } from '../lib/prisma';
import passport from '../lib/passport';
import { 
  hashPassword, 
  comparePasswords, 
  generateAccessToken, 
  generateRefreshToken,
  getRefreshTokenExpiry 
} from '../lib/auth';
import { validateBody } from '../middleware/validation.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../lib/validations';

const router = Router();

// ============================================
// INSCRIPTION
// ============================================
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Un compte avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    // Sauvegarder la session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user,
      accessToken,
      refreshToken,
    });
  })
);

// ============================================
// CONNEXION
// ============================================
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new AppError(401, 'Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Email ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    // Sauvegarder la session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
      },
      accessToken,
      refreshToken,
    });
  })
);

// ============================================
// RAFRAÎCHIR LE TOKEN
// ============================================
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { refreshToken } = req.body;

    // Trouver la session
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new AppError(401, 'Token de rafraîchissement invalide');
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new AppError(401, 'Token de rafraîchissement expiré');
    }

    // Générer de nouveaux tokens
    const newAccessToken = generateAccessToken({ 
      userId: session.user.id, 
      email: session.user.email 
    });
    const newRefreshToken = generateRefreshToken();

    // Mettre à jour la session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  })
);

// ============================================
// DÉCONNEXION
// ============================================
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    res.json({ message: 'Déconnexion réussie' });
  })
);

// ============================================
// DÉCONNEXION DE TOUTES LES SESSIONS
// ============================================
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    await prisma.session.deleteMany({
      where: { userId: req.user!.id },
    });

    res.json({ message: 'Déconnexion de toutes les sessions réussie' });
  })
);

// ============================================
// UTILISATEUR ACTUEL
// ============================================
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        headline: true,
        about: true,
        avatarUrl: true,
        bannerUrl: true,
        location: true,
        website: true,
        isOpenToWork: true,
        isHiring: true,
        profileVisibility: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    res.json(user);
  })
);

// ============================================
// OAUTH - GOOGLE
// ============================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const user = req.user as any;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    // Sauvegarder la session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Rediriger vers le frontend avec les tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
  })
);

// ============================================
// OAUTH - GITHUB
// ============================================
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_auth_failed' }),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const user = req.user as any;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_auth_failed`);
    }

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    // Sauvegarder la session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Rediriger vers le frontend avec les tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
  })
);

export default router;
