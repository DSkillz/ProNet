import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { requireAdmin, requireModerator } from '../middleware/admin.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';

const router = Router();

// Tous les routes admin nécessitent une authentification
router.use(authenticate);

// ============================================
// STATISTIQUES DU TABLEAU DE BORD
// ============================================
router.get(
  '/stats',
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const [
      totalUsers,
      newUsersToday,
      totalPosts,
      postsToday,
      totalJobs,
      activeJobs,
      totalMessages,
      bannedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.post.count(),
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.message.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    // Statistiques des 7 derniers jours
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, posts] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.post.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        users,
        posts,
      });
    }

    res.json({
      overview: {
        totalUsers,
        newUsersToday,
        totalPosts,
        postsToday,
        totalJobs,
        activeJobs,
        totalMessages,
        bannedUsers,
      },
      last7Days,
    });
  })
);

// ============================================
// GESTION DES UTILISATEURS
// ============================================
router.get(
  '/users',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { page = '1', limit = '20', search, role, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status === 'banned') {
      where.isBanned = true;
    } else if (status === 'active') {
      where.isBanned = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          isBanned: true,
          bannedAt: true,
          banReason: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  })
);

// Modifier le rôle d'un utilisateur
router.patch(
  '/users/:userId/role',
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      throw new AppError(400, 'Rôle invalide');
    }

    // Empêcher de modifier son propre rôle
    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas modifier votre propre rôle');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json(user);
  })
);

// Bannir un utilisateur
router.post(
  '/users/:userId/ban',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;
    const { reason } = req.body;

    // Vérifier que ce n'est pas un admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    if (targetUser.role === 'ADMIN') {
      throw new AppError(403, 'Impossible de bannir un administrateur');
    }

    // Empêcher de se bannir soi-même
    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous bannir vous-même');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || 'Violation des conditions d\'utilisation',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
      },
    });

    // Supprimer toutes les sessions de l'utilisateur banni
    await prisma.session.deleteMany({
      where: { userId },
    });

    res.json(user);
  })
);

// Débannir un utilisateur
router.post(
  '/users/:userId/unban',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBanned: true,
      },
    });

    res.json(user);
  })
);

// Supprimer un utilisateur
router.delete(
  '/users/:userId',
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.params;

    // Empêcher de se supprimer soi-même
    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas supprimer votre propre compte ici');
    }

    // Vérifier que ce n'est pas un admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    if (targetUser.role === 'ADMIN') {
      throw new AppError(403, 'Impossible de supprimer un administrateur');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Utilisateur supprimé' });
  })
);

// ============================================
// MODÉRATION DES POSTS
// ============================================
router.get(
  '/posts',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { page = '1', limit = '20', search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.content = { contains: search as string, mode: 'insensitive' };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  })
);

// Supprimer un post
router.delete(
  '/posts/:postId',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { postId } = req.params;

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post supprimé' });
  })
);

// ============================================
// MODÉRATION DES JOBS
// ============================================
router.get(
  '/jobs',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { page = '1', limit = '20', status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          poster: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  })
);

// Activer/désactiver un job
router.patch(
  '/jobs/:jobId/toggle',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { isActive: true },
    });

    if (!job) {
      throw new AppError(404, 'Offre non trouvée');
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive: !job.isActive },
    });

    res.json(updatedJob);
  })
);

// Supprimer un job
router.delete(
  '/jobs/:jobId',
  requireModerator,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { jobId } = req.params;

    await prisma.job.delete({
      where: { id: jobId },
    });

    res.json({ message: 'Offre supprimée' });
  })
);

export default router;
