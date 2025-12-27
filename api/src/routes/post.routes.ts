import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { createPostSchema, updatePostSchema, commentSchema, reactionSchema } from '../lib/validations';

const router = Router();

// ============================================
// FEED - OBTENIR LES POSTS
// ============================================
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);
    const currentUserId = req.user?.id;

    // Construire la requête pour le feed
    const whereClause: any = {
      visibility: 'PUBLIC',
    };

    // Si l'utilisateur est connecté, inclure les posts de ses connexions
    if (currentUserId) {
      const connections = await prisma.connection.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: currentUserId },
            { receiverId: currentUserId },
          ],
        },
        select: {
          senderId: true,
          receiverId: true,
        },
      });

      const connectionIds = connections.map((c) =>
        c.senderId === currentUserId ? c.receiverId : c.senderId
      );

      whereClause.OR = [
        { visibility: 'PUBLIC' },
        {
          visibility: 'CONNECTIONS_ONLY',
          authorId: { in: connectionIds },
        },
        { authorId: currentUserId },
      ];
      delete whereClause.visibility;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
        media: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        reactions: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { type: true },
            }
          : false,
      },
    });

    const hasMore = posts.length > take;
    const data = hasMore ? posts.slice(0, -1) : posts;

    res.json({
      posts: data.map((post) => ({
        ...post,
        userReaction: post.reactions?.[0]?.type || null,
        reactions: undefined,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

// ============================================
// CRÉER UN POST
// ============================================
router.post(
  '/',
  authenticate,
  validateBody(createPostSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { content, visibility, media } = req.body;

    // Extraire les hashtags du contenu
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [...content.matchAll(hashtagRegex)].map((m) => m[1].toLowerCase());

    const post = await prisma.post.create({
      data: {
        content,
        visibility: visibility || 'PUBLIC',
        authorId: req.user!.id,
        media: media
          ? {
              create: media,
            }
          : undefined,
        hashtags: {
          create: await Promise.all(
            [...new Set(hashtags)].map(async (name) => {
              const hashtag = await prisma.hashtag.upsert({
                where: { name },
                create: { name },
                update: {},
              });
              return { hashtagId: hashtag.id };
            })
          ),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
        media: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    res.status(201).json(post);
  })
);

// ============================================
// OBTENIR UN POST
// ============================================
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
        media: true,
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            replies: {
              take: 3,
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: { replies: true, reactions: true },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        reactions: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { type: true },
            }
          : false,
      },
    });

    if (!post) {
      throw new AppError(404, 'Post non trouvé');
    }

    res.json({
      ...post,
      userReaction: post.reactions?.[0]?.type || null,
      reactions: undefined,
    });
  })
);

// ============================================
// MODIFIER UN POST
// ============================================
router.patch(
  '/:id',
  authenticate,
  validateBody(updatePostSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const existing = await prisma.post.findFirst({
      where: { id, authorId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Post non trouvé');
    }

    const post = await prisma.post.update({
      where: { id },
      data: req.body,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    res.json(post);
  })
);

// ============================================
// SUPPRIMER UN POST
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    const existing = await prisma.post.findFirst({
      where: { id, authorId: req.user!.id },
    });

    if (!existing) {
      throw new AppError(404, 'Post non trouvé');
    }

    await prisma.post.delete({ where: { id } });

    res.status(204).send();
  })
);

// ============================================
// RÉACTIONS
// ============================================
router.post(
  '/:id/reactions',
  authenticate,
  validateBody(reactionSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { type } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new AppError(404, 'Post non trouvé');
    }

    const reaction = await prisma.reaction.upsert({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId: id,
        },
      },
      create: {
        userId: req.user!.id,
        postId: id,
        type,
      },
      update: { type },
    });

    // Créer une notification si ce n'est pas l'auteur
    if (post.authorId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'POST_LIKE',
          title: 'Nouvelle réaction',
          content: `a réagi à votre post`,
          link: `/posts/${id}`,
        },
      });
    }

    res.status(201).json(reaction);
  })
);

router.delete(
  '/:id/reactions',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    await prisma.reaction.deleteMany({
      where: {
        userId: req.user!.id,
        postId: id,
      },
    });

    res.status(204).send();
  })
);

// ============================================
// COMMENTAIRES
// ============================================
router.get(
  '/:id/comments',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);

    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
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
          select: { replies: true, reactions: true },
        },
      },
    });

    const hasMore = comments.length > take;
    const data = hasMore ? comments.slice(0, -1) : comments;

    res.json({
      comments: data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  })
);

router.post(
  '/:id/comments',
  authenticate,
  validateBody(commentSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;
    const { content, parentId } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new AppError(404, 'Post non trouvé');
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        authorId: req.user!.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Notification
    if (post.authorId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'POST_COMMENT',
          title: 'Nouveau commentaire',
          content: `a commenté votre post`,
          link: `/posts/${id}`,
        },
      });
    }

    res.status(201).json(comment);
  })
);

router.delete(
  '/:postId/comments/:commentId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { commentId } = req.params;

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, authorId: req.user!.id },
    });

    if (!comment) {
      throw new AppError(404, 'Commentaire non trouvé');
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.status(204).send();
  })
);

export default router;
