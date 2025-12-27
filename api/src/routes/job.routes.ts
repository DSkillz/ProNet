import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { createJobSchema, updateJobSchema, applyJobSchema } from '../lib/validations';

const router = Router();

// ============================================
// LISTE DES EMPLOIS
// ============================================
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const {
      cursor,
      limit = '20',
      q,
      location,
      locationType,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
    } = req.query;

    const take = Math.min(parseInt(limit as string), 50);
    const currentUserId = req.user?.id;

    const whereClause: any = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    // Filtres de recherche
    if (q) {
      whereClause.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (location) {
      whereClause.location = { contains: location as string, mode: 'insensitive' };
    }

    if (locationType) {
      whereClause.locationType = locationType;
    }

    if (employmentType) {
      whereClause.employmentType = employmentType;
    }

    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    if (salaryMin) {
      whereClause.salaryMin = { gte: parseInt(salaryMin as string) };
    }

    if (salaryMax) {
      whereClause.salaryMax = { lte: parseInt(salaryMax as string) };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
        ...(currentUserId && {
          applications: {
            where: { applicantId: currentUserId },
            select: { id: true, status: true },
          },
          savedBy: {
            where: { userId: currentUserId },
            select: { id: true },
          },
        }),
      },
    });

    const hasMore = jobs.length > take;
    const data = hasMore ? jobs.slice(0, -1) : jobs;

    res.json({
      jobs: data.map((job) => ({
        ...job,
        hasApplied: job.applications?.length > 0,
        applicationStatus: job.applications?.[0]?.status || null,
        isSaved: job.savedBy?.length > 0,
        applications: undefined,
        savedBy: undefined,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

// ============================================
// CRÉER UN EMPLOI
// ============================================
router.post(
  '/',
  authenticate,
  validateBody(createJobSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { skills, ...jobData } = req.body;

    const job = await prisma.job.create({
      data: {
        ...jobData,
        posterId: req.user!.id,
        skills: skills
          ? {
              create: await Promise.all(
                skills.map(async (skillName: string) => {
                  const skill = await prisma.skill.upsert({
                    where: { name: skillName },
                    create: { name: skillName },
                    update: {},
                  });
                  return { skillId: skill.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        skills: {
          include: { skill: true },
        },
      },
    });

    res.status(201).json(job);
  })
);

// ============================================
// OBTENIR UN EMPLOI
// ============================================
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            headline: true,
          },
        },
        company: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new AppError(404, 'Emploi non trouvé');
    }

    let hasApplied = false;
    let applicationStatus = null;
    let isSaved = false;

    if (currentUserId) {
      const application = await prisma.jobApplication.findUnique({
        where: {
          jobId_applicantId: {
            jobId: id,
            applicantId: currentUserId,
          },
        },
      });
      hasApplied = !!application;
      applicationStatus = application?.status || null;

      const saved = await prisma.savedJob.findUnique({
        where: {
          userId_jobId: {
            userId: currentUserId,
            jobId: id,
          },
        },
      });
      isSaved = !!saved;
    }

    res.json({
      ...job,
      hasApplied,
      applicationStatus,
      isSaved,
    });
  })
);

// ============================================
// MODIFIER UN EMPLOI
// ============================================
router.patch(
  '/:id',
  authenticate,
  validateBody(updateJobSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { skills, ...jobData } = req.body;

    const existing = await prisma.job.findFirst({
      where: { id, posterId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Emploi non trouvé');
    }

    // Supprimer les anciennes compétences si nouvelles fournies
    if (skills) {
      await prisma.jobSkill.deleteMany({ where: { jobId: id } });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        skills: skills
          ? {
              create: await Promise.all(
                skills.map(async (skillName: string) => {
                  const skill = await prisma.skill.upsert({
                    where: { name: skillName },
                    create: { name: skillName },
                    update: {},
                  });
                  return { skillId: skill.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    res.json(job);
  })
);

// ============================================
// SUPPRIMER UN EMPLOI
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const existing = await prisma.job.findFirst({
      where: { id, posterId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Emploi non trouvé');
    }

    await prisma.job.delete({ where: { id } });

    res.status(204).send();
  })
);

// ============================================
// CANDIDATER À UN EMPLOI
// ============================================
router.post(
  '/:id/apply',
  authenticate,
  validateBody(applyJobSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new AppError(404, 'Emploi non trouvé');
    }

    if (!job.isActive) {
      throw new AppError(400, 'Cet emploi n\'accepte plus de candidatures');
    }

    if (job.posterId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas candidater à votre propre offre');
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        applicantId: req.user!.id,
        coverLetter,
        resumeUrl,
      },
    });

    // Notification au recruteur
    await prisma.notification.create({
      data: {
        userId: job.posterId,
        type: 'JOB_APPLICATION',
        title: 'Nouvelle candidature',
        content: `a postulé à "${job.title}"`,
        link: `/jobs/${id}/applications`,
      },
    });

    res.status(201).json(application);
  })
);

// ============================================
// RETIRER SA CANDIDATURE
// ============================================
router.delete(
  '/:id/apply',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.jobApplication.deleteMany({
      where: {
        jobId: id,
        applicantId: req.user!.id,
      },
    });

    res.status(204).send();
  })
);

// ============================================
// SAUVEGARDER UN EMPLOI
// ============================================
router.post(
  '/:id/save',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new AppError(404, 'Emploi non trouvé');
    }

    await prisma.savedJob.create({
      data: {
        userId: req.user!.id,
        jobId: id,
      },
    });

    res.status(201).json({ message: 'Emploi sauvegardé' });
  })
);

router.delete(
  '/:id/save',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.savedJob.deleteMany({
      where: {
        userId: req.user!.id,
        jobId: id,
      },
    });

    res.status(204).send();
  })
);

// ============================================
// MES EMPLOIS SAUVEGARDÉS
// ============================================
router.get(
  '/saved',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: req.user!.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            skills: {
              include: { skill: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(savedJobs.map((s) => s.job));
  })
);

// ============================================
// MES CANDIDATURES
// ============================================
router.get(
  '/applications',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const applications = await prisma.jobApplication.findMany({
      where: { applicantId: req.user!.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  })
);

export default router;
