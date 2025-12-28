import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';

const router = Router();

// ============================================
// SUIVRE UN UTILISATEUR
// ============================================
router.post(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;

    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier si l'utilisateur existe
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    // Vérifier si déjà suivi
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      throw new AppError(400, 'Vous suivez déjà cet utilisateur');
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: req.user!.id,
        followingId: userId,
      },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'NEW_FOLLOWER',
        title: 'Nouveau follower',
        content: 'a commencé à vous suivre',
        link: `/profile/${req.user!.id}`,
      },
    });

    res.status(201).json({ message: 'Utilisateur suivi avec succès', follow });
  })
);

// ============================================
// NE PLUS SUIVRE UN UTILISATEUR
// ============================================
router.delete(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.id,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      throw new AppError(404, 'Vous ne suivez pas cet utilisateur');
    }

    await prisma.follow.delete({
      where: { id: follow.id },
    });

    res.json({ message: 'Vous ne suivez plus cet utilisateur' });
  })
);

// ============================================
// LISTE DES FOLLOWERS
// ============================================
router.get(
  '/:userId/followers',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = followers.length > take;
    const data = hasMore ? followers.slice(0, -1) : followers;

    res.json({
      followers: data.map((f) => f.follower),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

// ============================================
// LISTE DES PERSONNES SUIVIES
// ============================================
router.get(
  '/:userId/following',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = following.length > take;
    const data = hasMore ? following.slice(0, -1) : following;

    res.json({
      following: data.map((f) => f.following),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

export default router;
