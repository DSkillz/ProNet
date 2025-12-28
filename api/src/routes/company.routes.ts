import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const router = Router();

// Schema de validation
const createCompanySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  description: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  size: z.enum(['SOLO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional().nullable(),
});

const updateCompanySchema = createCompanySchema.partial();

// ============================================
// LISTE DES ENTREPRISES
// ============================================
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { cursor, limit = '20', q, industry } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      whereClause.industry = { contains: industry as string, mode: 'insensitive' };
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            jobs: { where: { isActive: true } },
            experiences: true,
          },
        },
      },
    });

    const hasMore = companies.length > take;
    const data = hasMore ? companies.slice(0, -1) : companies;

    res.json({
      companies: data.map((c) => ({
        ...c,
        activeJobsCount: c._count.jobs,
        employeesCount: c._count.experiences,
        _count: undefined,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

// ============================================
// OBTENIR UNE ENTREPRISE PAR SLUG
// ============================================
router.get(
  '/:slug',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { slug } = req.params;

    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { isActive: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            location: true,
            locationType: true,
            employmentType: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            jobs: { where: { isActive: true } },
            experiences: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError(404, 'Entreprise non trouvée');
    }

    res.json({
      ...company,
      activeJobsCount: company._count.jobs,
      employeesCount: company._count.experiences,
      _count: undefined,
    });
  })
);

// ============================================
// CRÉER UNE ENTREPRISE
// ============================================
router.post(
  '/',
  authenticate,
  validateBody(createCompanySchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const company = await prisma.company.create({
      data: req.body,
    });

    res.status(201).json(company);
  })
);

// ============================================
// METTRE À JOUR UNE ENTREPRISE
// ============================================
router.patch(
  '/:id',
  authenticate,
  validateBody(updateCompanySchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const company = await prisma.company.update({
      where: { id },
      data: req.body,
    });

    res.json(company);
  })
);

// ============================================
// EMPLOIS D'UNE ENTREPRISE
// ============================================
router.get(
  '/:slug/jobs',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { slug } = req.params;
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!company) {
      throw new AppError(404, 'Entreprise non trouvée');
    }

    const jobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
        isActive: true,
      },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    const hasMore = jobs.length > take;
    const data = hasMore ? jobs.slice(0, -1) : jobs;

    res.json({
      jobs: data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

export default router;
