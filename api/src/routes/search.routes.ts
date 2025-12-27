import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// ============================================
// RECHERCHE GLOBALE
// ============================================
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { q, type = 'all', page = '1', limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);
    const skip = (parseInt(page as string) - 1) * take;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ users: [], posts: [], jobs: [], companies: [] });
    }

    const searchQuery = q.trim();
    const results: any = {};

    // Rechercher des utilisateurs
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          profileVisibility: { not: 'PRIVATE' },
          OR: [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { headline: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        take,
        skip: type === 'users' ? skip : 0,
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

      results.users = users.map((u) => ({
        ...u,
        connectionCount: u._count.sentConnections + u._count.receivedConnections,
        _count: undefined,
      }));
    }

    // Rechercher des posts
    if (type === 'all' || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: {
          visibility: 'PUBLIC',
          content: { contains: searchQuery, mode: 'insensitive' },
        },
        take,
        skip: type === 'posts' ? skip : 0,
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
            select: { comments: true, reactions: true },
          },
        },
      });
    }

    // Rechercher des emplois
    if (type === 'all' || type === 'jobs') {
      results.jobs = await prisma.job.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { company: { name: { contains: searchQuery, mode: 'insensitive' } } },
          ],
        },
        take,
        skip: type === 'jobs' ? skip : 0,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });
    }

    // Rechercher des entreprises
    if (type === 'all' || type === 'companies') {
      results.companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { industry: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        take,
        skip: type === 'companies' ? skip : 0,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          industry: true,
          location: true,
          _count: {
            select: { jobs: { where: { isActive: true } } },
          },
        },
      });
    }

    res.json(results);
  })
);

// ============================================
// RECHERCHE DE COMPÉTENCES
// ============================================
router.get(
  '/skills',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { q, limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const skills = await prisma.skill.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      take,
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        users: { _count: 'desc' },
      },
    });

    res.json(skills);
  })
);

// ============================================
// TENDANCES / HASHTAGS POPULAIRES
// ============================================
router.get(
  '/trending',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 20);

    // Hashtags les plus utilisés ces 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hashtags = await prisma.postHashtag.groupBy({
      by: ['hashtagId'],
      where: {
        post: {
          createdAt: { gte: sevenDaysAgo },
        },
      },
      _count: { hashtagId: true },
      orderBy: { _count: { hashtagId: 'desc' } },
      take,
    });

    const hashtagDetails = await prisma.hashtag.findMany({
      where: {
        id: { in: hashtags.map((h) => h.hashtagId) },
      },
    });

    const trending = hashtags.map((h) => ({
      hashtag: hashtagDetails.find((d) => d.id === h.hashtagId),
      count: h._count.hashtagId,
    }));

    res.json(trending);
  })
);

export default router;
