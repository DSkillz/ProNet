import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// ============================================
// LISTE DES NOTIFICATIONS
// ============================================
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { cursor, limit = '20', unreadOnly } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const whereClause: any = {
      userId: req.user!.id,
    };

    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > take;
    const data = hasMore ? notifications.slice(0, -1) : notifications;

    res.json({
      notifications: data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

// ============================================
// NOMBRE DE NOTIFICATIONS NON LUES
// ============================================
router.get(
  '/unread-count',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    });

    res.json({ count });
  })
);

// ============================================
// MARQUER UNE NOTIFICATION COMME LUE
// ============================================
router.patch(
  '/:id/read',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marquée comme lue' });
  })
);

// ============================================
// MARQUER TOUTES LES NOTIFICATIONS COMME LUES
// ============================================
router.patch(
  '/read-all',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  })
);

// ============================================
// SUPPRIMER UNE NOTIFICATION
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.notification.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    res.status(204).send();
  })
);

// ============================================
// SUPPRIMER TOUTES LES NOTIFICATIONS
// ============================================
router.delete(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    await prisma.notification.deleteMany({
      where: { userId: req.user!.id },
    });

    res.status(204).send();
  })
);

export default router;
