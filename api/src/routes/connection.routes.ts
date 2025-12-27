import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { connectionRequestSchema, connectionResponseSchema } from '../lib/validations';

const router = Router();

// ============================================
// LISTE DES CONNEXIONS
// ============================================
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { status = 'ACCEPTED' } = req.query;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
        status: status as any,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Retourner l'autre personne de la connexion
    const formattedConnections = connections.map((c) => ({
      id: c.id,
      status: c.status,
      message: c.message,
      createdAt: c.createdAt,
      user: c.senderId === req.user!.id ? c.receiver : c.sender,
      isSender: c.senderId === req.user!.id,
    }));

    res.json(formattedConnections);
  })
);

// ============================================
// DEMANDES DE CONNEXION REÇUES
// ============================================
router.get(
  '/pending',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const requests = await prisma.connection.findMany({
      where: {
        receiverId: req.user!.id,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  })
);

// ============================================
// DEMANDES DE CONNEXION ENVOYÉES
// ============================================
router.get(
  '/sent',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const requests = await prisma.connection.findMany({
      where: {
        senderId: req.user!.id,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  })
);

// ============================================
// ENVOYER UNE DEMANDE DE CONNEXION
// ============================================
router.post(
  '/',
  authenticate,
  validateBody(connectionRequestSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { receiverId, message } = req.body;

    if (receiverId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous connecter à vous-même');
    }

    // Vérifier si l'utilisateur existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    // Vérifier si une connexion existe déjà
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: req.user!.id, receiverId },
          { senderId: receiverId, receiverId: req.user!.id },
        ],
      },
    });

    if (existingConnection) {
      if (existingConnection.status === 'ACCEPTED') {
        throw new AppError(400, 'Vous êtes déjà connectés');
      }
      if (existingConnection.status === 'PENDING') {
        throw new AppError(400, 'Une demande de connexion est déjà en attente');
      }
      if (existingConnection.status === 'BLOCKED') {
        throw new AppError(403, 'Impossible d\'envoyer une demande');
      }
    }

    const connection = await prisma.connection.create({
      data: {
        senderId: req.user!.id,
        receiverId,
        message,
        status: 'PENDING',
      },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CONNECTION_REQUEST',
        title: 'Nouvelle demande de connexion',
        content: `souhaite se connecter avec vous`,
        link: '/network',
      },
    });

    res.status(201).json(connection);
  })
);

// ============================================
// RÉPONDRE À UNE DEMANDE DE CONNEXION
// ============================================
router.patch(
  '/:id',
  authenticate,
  validateBody(connectionResponseSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { status } = req.body;

    const connection = await prisma.connection.findFirst({
      where: {
        id,
        receiverId: req.user!.id,
        status: 'PENDING',
      },
    });

    if (!connection) {
      throw new AppError(404, 'Demande de connexion non trouvée');
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status },
    });

    // Si acceptée, notifier l'expéditeur
    if (status === 'ACCEPTED') {
      await prisma.notification.create({
        data: {
          userId: connection.senderId,
          type: 'CONNECTION_ACCEPTED',
          title: 'Connexion acceptée',
          content: `a accepté votre demande de connexion`,
          link: `/users/${req.user!.id}`,
        },
      });
    }

    res.json(updated);
  })
);

// ============================================
// SUPPRIMER UNE CONNEXION
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id,
        OR: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
      },
    });

    if (!connection) {
      throw new AppError(404, 'Connexion non trouvée');
    }

    await prisma.connection.delete({ where: { id } });

    res.status(204).send();
  })
);

// ============================================
// SUGGESTIONS DE CONNEXION
// ============================================
router.get(
  '/suggestions',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    // Obtenir les IDs des connexions existantes
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
      },
      select: { senderId: true, receiverId: true },
    });

    const excludeIds = new Set([
      req.user!.id,
      ...existingConnections.map((c) => c.senderId),
      ...existingConnections.map((c) => c.receiverId),
    ]);

    // Trouver des utilisateurs avec des compétences similaires
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        skills: { select: { skillId: true } },
      },
    });

    const userSkillIds = currentUser?.skills.map((s) => s.skillId) || [];

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludeIds] },
        profileVisibility: { not: 'PRIVATE' },
        ...(userSkillIds.length > 0 && {
          skills: {
            some: {
              skillId: { in: userSkillIds },
            },
          },
        }),
      },
      take,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        avatarUrl: true,
        location: true,
        _count: {
          select: {
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    res.json(
      suggestions.map((s) => ({
        ...s,
        connectionCount: s._count.sentConnections + s._count.receivedConnections,
        _count: undefined,
      }))
    );
  })
);

export default router;
