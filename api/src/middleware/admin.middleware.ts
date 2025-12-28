import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from './error.middleware';
import { prisma } from '../lib/prisma';

// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentification requise');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, isBanned: true },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    if (user.isBanned) {
      throw new AppError(403, 'Compte suspendu');
    }

    if (user.role !== 'ADMIN') {
      throw new AppError(403, 'Accès réservé aux administrateurs');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware pour vérifier si l'utilisateur est modérateur ou admin
export const requireModerator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentification requise');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, isBanned: true },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur non trouvé');
    }

    if (user.isBanned) {
      throw new AppError(403, 'Compte suspendu');
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new AppError(403, 'Accès réservé aux modérateurs');
    }

    next();
  } catch (error) {
    next(error);
  }
};
