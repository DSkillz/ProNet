import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { Request } from 'express';

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const bannersDir = path.join(uploadsDir, 'banners');
const postsDir = path.join(uploadsDir, 'posts');
const documentsDir = path.join(uploadsDir, 'documents');
const messagesDir = path.join(uploadsDir, 'messages');

[uploadsDir, avatarsDir, bannersDir, postsDir, documentsDir, messagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Types de fichiers autorisés
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Limites de taille
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

// Configuration du stockage
const createStorage = (subDir: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsDir, subDir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${nanoid(16)}${ext}`;
      cb(null, filename);
    },
  });

// Filtre de fichiers
const fileFilter = (allowedTypes: string[]) => (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`));
  }
};

// Middleware pour les avatars
export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single('avatar');

// Middleware pour les bannières
export const uploadBanner = multer({
  storage: createStorage('banners'),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single('banner');

// Middleware pour les médias de posts (images, vidéos)
export const uploadPostMedia = multer({
  storage: createStorage('posts'),
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: fileFilter([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]),
}).array('media', 10); // Max 10 fichiers

// Middleware pour les documents (CV, etc.)
export const uploadDocument = multer({
  storage: createStorage('documents'),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
}).single('document');

// Middleware pour les pièces jointes de messages
export const uploadMessageAttachment = multer({
  storage: createStorage('messages'),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: fileFilter(ALL_ALLOWED_TYPES),
}).array('attachments', 5); // Max 5 fichiers

// Utilitaire pour obtenir le type de média
export const getMediaType = (mimetype: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'IMAGE';
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'VIDEO';
  return 'DOCUMENT';
};

// Utilitaire pour supprimer un fichier
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(uploadsDir, filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Utilitaire pour obtenir l'URL du fichier
export const getFileUrl = (filename: string, subDir: string): string => {
  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
  return `${baseUrl}/uploads/${subDir}/${filename}`;
};
