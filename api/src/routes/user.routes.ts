import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { 
  updateProfileSchema, 
  experienceSchema, 
  educationSchema,
  skillSchema 
} from '../lib/validations';

const router = Router();

// ============================================
// OBTENIR UN PROFIL UTILISATEUR
// ============================================
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
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
        createdAt: true,
        experiences: {
          orderBy: { startDate: 'desc' },
          include: {
            skills: { include: { skill: true } },
          },
        },
        education: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          include: {
            skill: true,
            endorsements: true,
          },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        languages: true,
        _count: {
          select: {
            posts: true,
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    // Vérifier la visibilité du profil
    if (user.profileVisibility === 'PRIVATE' && user.id !== currentUserId) {
      throw new AppError(403, 'Ce profil est privé');
    }

    // Vérifier si l'utilisateur actuel est connecté
    let connectionStatus = null;
    let isFollowing = false;

    if (currentUserId && currentUserId !== id) {
      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: id },
            { senderId: id, receiverId: currentUserId },
          ],
        },
      });
      connectionStatus = connection?.status || null;

      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      ...user,
      connectionCount: user._count.sentConnections + user._count.receivedConnections,
      connectionStatus,
      isFollowing,
    });
  })
);

// ============================================
// METTRE À JOUR SON PROFIL
// ============================================
router.patch(
  '/me',
  authenticate,
  validateBody(updateProfileSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
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
      },
    });

    res.json(user);
  })
);

// ============================================
// EXPÉRIENCES
// ============================================
router.post(
  '/me/experiences',
  authenticate,
  validateBody(experienceSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const experience = await prisma.experience.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });

    res.status(201).json(experience);
  })
);

router.patch(
  '/me/experiences/:experienceId',
  authenticate,
  validateBody(experienceSchema.partial()),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { experienceId } = req.params;

    // Vérifier que l'expérience appartient à l'utilisateur
    const existing = await prisma.experience.findFirst({
      where: { id: experienceId, userId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Expérience non trouvée');
    }

    const experience = await prisma.experience.update({
      where: { id: experienceId },
      data: req.body,
    });

    res.json(experience);
  })
);

router.delete(
  '/me/experiences/:experienceId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { experienceId } = req.params;

    const existing = await prisma.experience.findFirst({
      where: { id: experienceId, userId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Expérience non trouvée');
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    });

    res.status(204).send();
  })
);

// ============================================
// ÉDUCATION
// ============================================
router.post(
  '/me/education',
  authenticate,
  validateBody(educationSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const education = await prisma.education.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });

    res.status(201).json(education);
  })
);

router.patch(
  '/me/education/:educationId',
  authenticate,
  validateBody(educationSchema.partial()),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { educationId } = req.params;

    const existing = await prisma.education.findFirst({
      where: { id: educationId, userId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Éducation non trouvée');
    }

    const education = await prisma.education.update({
      where: { id: educationId },
      data: req.body,
    });

    res.json(education);
  })
);

router.delete(
  '/me/education/:educationId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { educationId } = req.params;

    const existing = await prisma.education.findFirst({
      where: { id: educationId, userId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Éducation non trouvée');
    }

    await prisma.education.delete({
      where: { id: educationId },
    });

    res.status(204).send();
  })
);

// ============================================
// COMPÉTENCES
// ============================================
router.post(
  '/me/skills',
  authenticate,
  validateBody(skillSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { name } = req.body;

    // Créer ou récupérer la compétence
    const skill = await prisma.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });

    // Ajouter à l'utilisateur
    const userSkill = await prisma.userSkill.create({
      data: {
        userId: req.user!.id,
        skillId: skill.id,
      },
      include: { skill: true },
    });

    res.status(201).json(userSkill);
  })
);

router.delete(
  '/me/skills/:skillId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { skillId } = req.params;

    await prisma.userSkill.deleteMany({
      where: {
        userId: req.user!.id,
        skillId,
      },
    });

    res.status(204).send();
  })
);

// ============================================
// ENDORSEMENTS
// ============================================
router.post(
  '/:userId/skills/:skillId/endorse',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId, skillId } = req.params;

    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous recommander vous-même');
    }

    const userSkill = await prisma.userSkill.findFirst({
      where: { userId, skillId },
    });

    if (!userSkill) {
      throw new AppError(404, 'Compétence non trouvée');
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        userSkillId: userSkill.id,
        endorserId: req.user!.id,
        endorseeId: userId,
      },
    });

    res.status(201).json(endorsement);
  })
);

router.delete(
  '/:userId/skills/:skillId/endorse',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId, skillId } = req.params;

    const userSkill = await prisma.userSkill.findFirst({
      where: { userId, skillId },
    });

    if (userSkill) {
      await prisma.endorsement.deleteMany({
        where: {
          userSkillId: userSkill.id,
          endorserId: req.user!.id,
        },
      });
    }

    res.status(204).send();
  })
);

// ============================================
// SUIVRE / NE PLUS SUIVRE
// ============================================
router.post(
  '/:id/follow',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    if (id === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous suivre vous-même');
    }

    await prisma.follow.create({
      data: {
        followerId: req.user!.id,
        followingId: id,
      },
    });

    res.status(201).json({ message: 'Utilisateur suivi' });
  })
);

router.delete(
  '/:id/follow',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.follow.deleteMany({
      where: {
        followerId: req.user!.id,
        followingId: id,
      },
    });

    res.status(204).send();
  })
);

export default router;
