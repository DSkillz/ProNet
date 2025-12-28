import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * GET /api/stats/public
 * Statistiques publiques pour la page d'accueil
 */
router.get(
  '/public',
  asyncHandler(async (req, res) => {
    const [usersCount, companiesCount, jobsCount, postsCount] = await Promise.all([
      prisma.user.count({ where: { isBanned: false } }),
      prisma.company.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.post.count({ where: { visibility: 'PUBLIC' } }),
    ]);

    res.json({
      users: usersCount,
      companies: companiesCount,
      jobs: jobsCount,
      posts: postsCount,
    });
  })
);

export default router;
