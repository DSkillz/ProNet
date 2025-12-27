import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (io: Server) => {
  // Middleware d'authentification
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Token d\'authentification requis'));
      }

      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET || 'secret'
      ) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true },
      });

      if (!user) {
        return next(new Error('Utilisateur non trouvé'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    
    console.log(`🔌 Utilisateur connecté: ${userId}`);

    // Rejoindre la room personnelle de l'utilisateur
    socket.join(`user:${userId}`);

    // Mettre à jour le statut en ligne
    updateOnlineStatus(userId, true);

    // ============================================
    // ÉVÉNEMENTS DE MESSAGERIE
    // ============================================
    
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📨 ${userId} a rejoint la conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing_start', (data: { conversationId: string; receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { conversationId: string; receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: false,
      });
    });

    socket.on('message_read', async (data: { messageId: string; conversationId: string }) => {
      try {
        const message = await prisma.message.update({
          where: { id: data.messageId },
          data: { readAt: new Date() },
        });

        io.to(`user:${message.senderId}`).emit('message_read_receipt', {
          messageId: data.messageId,
          conversationId: data.conversationId,
          readAt: message.readAt,
        });
      } catch (error) {
        console.error('Erreur lors du marquage du message comme lu:', error);
      }
    });

    // ============================================
    // ÉVÉNEMENTS DE NOTIFICATION
    // ============================================

    socket.on('notification_read', async (notificationId: string) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    });

    // ============================================
    // DÉCONNEXION
    // ============================================

    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté: ${userId}`);
      updateOnlineStatus(userId, false);
    });
  });
};

// Fonction pour mettre à jour le statut en ligne
const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: isOnline ? new Date() : undefined },
    });
  } catch (error) {
    console.error('Erreur mise à jour statut en ligne:', error);
  }
};

// Fonction utilitaire pour envoyer une notification en temps réel
export const sendRealtimeNotification = (
  io: Server,
  userId: string,
  notification: {
    type: string;
    title: string;
    content: string;
    link?: string;
  }
) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

// Fonction utilitaire pour envoyer un message en temps réel
export const sendRealtimeMessage = (
  io: Server,
  receiverId: string,
  message: any
) => {
  io.to(`user:${receiverId}`).emit('new_message', message);
};
