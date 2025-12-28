import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import {
  uploadAvatar,
  uploadBanner,
  uploadPostMedia,
  uploadDocument,
  uploadMessageAttachment,
  getMediaType,
  getFileUrl,
  deleteFile,
} from '../middleware/upload.middleware';

const router = Router();

// Wrapper pour gérer les erreurs multer
const handleMulterError = (
  uploadFn: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return new Promise((resolve, reject) => {
    uploadFn(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          reject(new AppError(400, 'Fichier trop volumineux'));
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          reject(new AppError(400, 'Trop de fichiers'));
        } else {
          reject(new AppError(400, err.message));
        }
      } else {
        resolve();
      }
    });
  });
};

// ============================================
// UPLOAD AVATAR
// ============================================
router.post(
  '/avatar',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadAvatar, req, res, next);

    const file = req.file;
    if (!file) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    // Récupérer l'ancien avatar pour le supprimer
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { avatarUrl: true },
    });

    // Supprimer l'ancien avatar s'il existe et est local
    if (user?.avatarUrl && user.avatarUrl.includes('/uploads/avatars/')) {
      const oldFilename = user.avatarUrl.split('/avatars/')[1];
      try {
        await deleteFile(`avatars/${oldFilename}`);
      } catch (e) {
        // Ignorer si le fichier n'existe pas
      }
    }

    const avatarUrl = getFileUrl(file.filename, 'avatars');

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl },
    });

    res.json({ avatarUrl });
  })
);

// ============================================
// UPLOAD BANNER
// ============================================
router.post(
  '/banner',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadBanner, req, res, next);

    const file = req.file;
    if (!file) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    // Récupérer l'ancien banner pour le supprimer
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { bannerUrl: true },
    });

    if (user?.bannerUrl && user.bannerUrl.includes('/uploads/banners/')) {
      const oldFilename = user.bannerUrl.split('/banners/')[1];
      try {
        await deleteFile(`banners/${oldFilename}`);
      } catch (e) {
        // Ignorer
      }
    }

    const bannerUrl = getFileUrl(file.filename, 'banners');

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { bannerUrl },
    });

    res.json({ bannerUrl });
  })
);

// ============================================
// UPLOAD MEDIA POUR POSTS
// ============================================
router.post(
  '/post-media',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadPostMedia, req, res, next);

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    const media = files.map((file) => ({
      url: getFileUrl(file.filename, 'posts'),
      type: getMediaType(file.mimetype),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    res.json({ media });
  })
);

// ============================================
// UPLOAD DOCUMENT (CV, etc.)
// ============================================
router.post(
  '/document',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadDocument, req, res, next);

    const file = req.file;
    if (!file) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    const document = {
      url: getFileUrl(file.filename, 'documents'),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: 'DOCUMENT',
    };

    res.json({ document });
  })
);

// ============================================
// UPLOAD ATTACHMENTS POUR MESSAGES
// ============================================
router.post(
  '/message-attachments',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadMessageAttachment, req, res, next);

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    const attachments = files.map((file) => ({
      url: getFileUrl(file.filename, 'messages'),
      type: getMediaType(file.mimetype),
      name: file.originalname,
      size: file.size,
    }));

    res.json({ attachments });
  })
);

// ============================================
// UPLOAD LOGO ENTREPRISE
// ============================================
router.post(
  '/company-logo/:companyId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await handleMulterError(uploadAvatar, req, res, next);

    const { companyId } = req.params;
    const file = req.file;

    if (!file) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    // Vérifier que l'entreprise existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError(404, 'Entreprise non trouvée');
    }

    const logoUrl = getFileUrl(file.filename, 'avatars');

    await prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });

    res.json({ logoUrl });
  })
);

// ============================================
// SUPPRIMER UN FICHIER
// ============================================
router.delete(
  '/:type/:filename',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, filename } = req.params;
    const allowedTypes = ['avatars', 'banners', 'posts', 'documents', 'messages'];

    if (!allowedTypes.includes(type)) {
      throw new AppError(400, 'Type de fichier invalide');
    }

    await deleteFile(`${type}/${filename}`);
    res.status(204).send();
  })
);

export default router;
