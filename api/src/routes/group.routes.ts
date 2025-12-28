import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';

const router = Router();

// Helper pour générer un slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// LISTE DES GROUPES
// ============================================
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { category, type, search, page = '1', limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);
    const skip = (parseInt(page as string) - 1) * take;

    const where: any = {
      type: { not: 'SECRET' }, // Ne pas afficher les groupes secrets
    };

    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true, posts: true },
          },
        },
      }),
      prisma.group.count({ where }),
    ]);

    // Vérifier si l'utilisateur est membre de chaque groupe
    const groupsWithMembership = await Promise.all(
      groups.map(async (group) => {
        let isJoined = false;
        let memberRole = null;
        if (req.user) {
          const membership = await prisma.groupMember.findUnique({
            where: {
              groupId_userId: {
                groupId: group.id,
                userId: req.user.id,
              },
            },
          });
          isJoined = !!membership;
          memberRole = membership?.role || null;
        }
        return {
          ...group,
          membersCount: group._count.members,
          postsCount: group._count.posts,
          isJoined,
          memberRole,
          _count: undefined,
        };
      })
    );

    res.json({
      groups: groupsWithMembership,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    });
  })
);

// ============================================
// MES GROUPES
// ============================================
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user!.id },
      include: {
        group: {
          include: {
            owner: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
            _count: { select: { members: true, posts: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const groups = memberships.map((m) => ({
      ...m.group,
      membersCount: m.group._count.members,
      postsCount: m.group._count.posts,
      isJoined: true,
      memberRole: m.role,
      _count: undefined,
    }));

    res.json({ groups });
  })
);

// ============================================
// DÉTAIL D'UN GROUPE
// ============================================
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const group = await prisma.group.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            headline: true,
          },
        },
        members: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: { select: { members: true, posts: true } },
      },
    });

    if (!group) {
      throw new AppError(404, 'Groupe non trouvé');
    }

    // Vérifier si c'est un groupe secret et si l'utilisateur n'est pas membre
    if (group.type === 'SECRET') {
      if (!req.user) {
        throw new AppError(404, 'Groupe non trouvé');
      }
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: req.user.id,
          },
        },
      });
      if (!membership) {
        throw new AppError(404, 'Groupe non trouvé');
      }
    }

    let isJoined = false;
    let memberRole = null;

    if (req.user) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: req.user.id,
          },
        },
      });
      isJoined = !!membership;
      memberRole = membership?.role || null;
    }

    res.json({
      ...group,
      membersCount: group._count.members,
      postsCount: group._count.posts,
      isJoined,
      memberRole,
      _count: undefined,
    });
  })
);

// ============================================
// CRÉER UN GROUPE
// ============================================
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description, type, category, avatarUrl, bannerUrl, rules } = req.body;

    if (!name) {
      throw new AppError(400, 'Nom du groupe requis');
    }

    // Générer un slug unique
    let slug = generateSlug(name);
    const existing = await prisma.group.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const group = await prisma.group.create({
      data: {
        ownerId: req.user!.id,
        name,
        slug,
        description,
        type: type || 'PUBLIC',
        category,
        avatarUrl,
        bannerUrl,
        rules,
        members: {
          create: {
            userId: req.user!.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: { select: { members: true } },
      },
    });

    res.status(201).json({
      ...group,
      membersCount: group._count.members,
      isJoined: true,
      memberRole: 'OWNER',
      _count: undefined,
    });
  })
);

// ============================================
// MODIFIER UN GROUPE
// ============================================
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: req.user!.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!membership) {
      throw new AppError(403, 'Non autorisé');
    }

    const { name, description, type, category, avatarUrl, bannerUrl, rules } = req.body;

    const updated = await prisma.group.update({
      where: { id },
      data: {
        name,
        description,
        type,
        category,
        avatarUrl,
        bannerUrl,
        rules,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: { select: { members: true, posts: true } },
      },
    });

    res.json({
      ...updated,
      membersCount: updated._count.members,
      postsCount: updated._count.posts,
      _count: undefined,
    });
  })
);

// ============================================
// SUPPRIMER UN GROUPE
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const group = await prisma.group.findUnique({ where: { id } });

    if (!group) {
      throw new AppError(404, 'Groupe non trouvé');
    }

    if (group.ownerId !== req.user!.id) {
      throw new AppError(403, 'Seul le propriétaire peut supprimer le groupe');
    }

    await prisma.group.delete({ where: { id } });

    res.status(204).send();
  })
);

// ============================================
// REJOINDRE UN GROUPE
// ============================================
router.post(
  '/:id/join',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const group = await prisma.group.findUnique({ where: { id } });

    if (!group) {
      throw new AppError(404, 'Groupe non trouvé');
    }

    if (group.type === 'SECRET') {
      throw new AppError(403, 'Ce groupe est sur invitation uniquement');
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Vous êtes déjà membre de ce groupe');
    }

    const membership = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: req.user!.id,
        role: 'MEMBER',
      },
    });

    res.status(201).json({
      message: 'Vous avez rejoint le groupe',
      membership,
    });
  })
);

// ============================================
// QUITTER UN GROUPE
// ============================================
router.delete(
  '/:id/join',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!membership) {
      throw new AppError(404, 'Vous n\'êtes pas membre de ce groupe');
    }

    if (membership.role === 'OWNER') {
      throw new AppError(400, 'Le propriétaire ne peut pas quitter le groupe. Transférez la propriété ou supprimez le groupe.');
    }

    await prisma.groupMember.delete({
      where: { id: membership.id },
    });

    res.status(204).send();
  })
);

// ============================================
// POSTS DU GROUPE
// ============================================
router.get(
  '/:id/posts',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);
    const skip = (parseInt(page as string) - 1) * take;

    const group = await prisma.group.findUnique({ where: { id } });

    if (!group) {
      throw new AppError(404, 'Groupe non trouvé');
    }

    // Vérifier l'accès pour les groupes privés/secrets
    if (group.type !== 'PUBLIC' && req.user) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: req.user.id,
          },
        },
      });
      if (!membership) {
        throw new AppError(403, 'Vous devez être membre pour voir les posts');
      }
    }

    const [posts, total] = await Promise.all([
      prisma.groupPost.findMany({
        where: { groupId: id },
        take,
        skip,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              headline: true,
            },
          },
        },
      }),
      prisma.groupPost.count({ where: { groupId: id } }),
    ]);

    res.json({
      posts,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    });
  })
);

// ============================================
// CRÉER UN POST DANS LE GROUPE
// ============================================
router.post(
  '/:id/posts',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError(400, 'Contenu requis');
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!membership) {
      throw new AppError(403, 'Vous devez être membre pour poster');
    }

    const post = await prisma.groupPost.create({
      data: {
        groupId: id,
        authorId: req.user!.id,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            headline: true,
          },
        },
      },
    });

    res.status(201).json(post);
  })
);

export default router;
