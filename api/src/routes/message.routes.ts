import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { sendMessageSchema } from '../lib/validations';

const router = Router();

// ============================================
// LISTE DES CONVERSATIONS
// ============================================
router.get(
  '/conversations',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: req.user!.id,
        isArchived: false,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: req.user!.id } },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    headline: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
                readAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: 'desc' },
      },
    });

    const formattedConversations = conversations.map((cp) => {
      const otherParticipant = cp.conversation.participants[0];
      const lastMessage = cp.conversation.messages[0];
      
      return {
        id: cp.conversationId,
        participant: otherParticipant?.user,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isOwn: lastMessage.senderId === req.user!.id,
              isRead: !!lastMessage.readAt,
            }
          : null,
        lastReadAt: cp.lastReadAt,
        isMuted: cp.isMuted,
        updatedAt: cp.conversation.updatedAt,
      };
    });

    res.json(formattedConversations);
  })
);

// ============================================
// OBTENIR OU CRÉER UNE CONVERSATION
// ============================================
router.post(
  '/conversations',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { userId } = req.body;

    if (userId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas démarrer une conversation avec vous-même');
    }

    // Vérifier si l'utilisateur existe
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    // Chercher une conversation existante
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: req.user!.id } } },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        participants: {
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
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: req.user!.id },
            { userId },
          ],
        },
      },
      include: {
        participants: {
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
      },
    });

    res.status(201).json(conversation);
  })
);

// ============================================
// MESSAGES D'UNE CONVERSATION
// ============================================
router.get(
  '/conversations/:conversationId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { conversationId } = req.params;
    const { cursor, limit = '50' } = req.query;
    const take = Math.min(parseInt(limit as string), 100);

    // Vérifier que l'utilisateur fait partie de la conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user!.id,
        },
      },
    });

    if (!participant) {
      throw new AppError(403, 'Vous n\'avez pas accès à cette conversation');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: req.user!.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    // Mettre à jour lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user!.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const hasMore = messages.length > take;
    const data = hasMore ? messages.slice(0, -1) : messages;

    res.json({
      messages: data.reverse(),
      nextCursor: hasMore ? data[0].id : null,
    });
  })
);

// ============================================
// ENVOYER UN MESSAGE
// ============================================
router.post(
  '/',
  authenticate,
  validateBody(sendMessageSchema),
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { receiverId, content, attachments } = req.body;

    if (receiverId === req.user!.id) {
      throw new AppError(400, 'Vous ne pouvez pas vous envoyer un message');
    }

    // Vérifier si le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new AppError(404, 'Destinataire non trouvé');
    }

    // Trouver ou créer la conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: req.user!.id } } },
          { participants: { some: { userId: receiverId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user!.id },
              { userId: receiverId },
            ],
          },
        },
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user!.id,
        receiverId,
        content,
        attachments: attachments
          ? { create: attachments }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE',
        title: 'Nouveau message',
        content: `vous a envoyé un message`,
        link: `/messages`,
      },
    });

    // Émettre via Socket.IO si disponible
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  })
);

// ============================================
// ARCHIVER UNE CONVERSATION
// ============================================
router.patch(
  '/conversations/:conversationId/archive',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { conversationId } = req.params;
    const { isArchived = true } = req.body;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user!.id,
        },
      },
      data: { isArchived },
    });

    res.json({ message: isArchived ? 'Conversation archivée' : 'Conversation désarchivée' });
  })
);

// ============================================
// MUTER UNE CONVERSATION
// ============================================
router.patch(
  '/conversations/:conversationId/mute',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { conversationId } = req.params;
    const { isMuted = true } = req.body;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user!.id,
        },
      },
      data: { isMuted },
    });

    res.json({ message: isMuted ? 'Notifications désactivées' : 'Notifications activées' });
  })
);

// ============================================
// NOMBRE DE MESSAGES NON LUS
// ============================================
router.get(
  '/unread-count',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user!.id,
        readAt: null,
      },
    });

    res.json({ count });
  })
);

export default router;
