import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  firstName: z.string().min(1, 'Prénom requis').max(50),
  lastName: z.string().min(1, 'Nom requis').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis'),
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  headline: z.string().max(220).optional().nullable(),
  about: z.string().max(2600).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  isOpenToWork: z.boolean().optional(),
  isHiring: z.boolean().optional(),
  profileVisibility: z.enum(['PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE']).optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(100),
  company: z.string().min(1, 'Entreprise requise').max(100),
  location: z.string().max(100).optional().nullable(),
  locationType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional().nullable(),
});

export const educationSchema = z.object({
  school: z.string().min(1, 'École requise').max(100),
  degree: z.string().max(100).optional().nullable(),
  fieldOfStudy: z.string().max(100).optional().nullable(),
  startDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  grade: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(50),
});

// ============================================
// POST SCHEMAS
// ============================================

export const createPostSchema = z.object({
  content: z.string().min(1, 'Contenu requis').max(3000),
  visibility: z.enum(['PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE']).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
    altText: z.string().max(200).optional(),
  })).optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(3000).optional(),
  visibility: z.enum(['PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE']).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Contenu requis').max(1250),
  parentId: z.string().optional(),
});

export const reactionSchema = z.object({
  type: z.enum(['LIKE', 'CELEBRATE', 'SUPPORT', 'LOVE', 'INSIGHTFUL', 'CURIOUS']),
});

// ============================================
// JOB SCHEMAS
// ============================================

export const createJobSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(100),
  description: z.string().min(1, 'Description requise').max(10000),
  requirements: z.string().max(5000).optional().nullable(),
  benefits: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  locationType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP', 'FREELANCE']),
  experienceLevel: z.enum(['ENTRY', 'ASSOCIATE', 'MID_SENIOR', 'DIRECTOR', 'EXECUTIVE']),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  salaryCurrency: z.string().max(3).optional().nullable(),
  salaryPeriod: z.enum(['HOURLY', 'MONTHLY', 'YEARLY']).optional().nullable(),
  skills: z.array(z.string()).optional(),
  expiresAt: z.string().transform((str) => new Date(str)).optional().nullable(),
});

export const updateJobSchema = createJobSchema.partial();

export const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  resumeUrl: z.string().url().optional(),
});

// ============================================
// CONNECTION SCHEMAS
// ============================================

export const connectionRequestSchema = z.object({
  receiverId: z.string().min(1, 'ID du destinataire requis'),
  message: z.string().max(300).optional(),
});

export const connectionResponseSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
});

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'ID du destinataire requis'),
  content: z.string().min(1, 'Contenu requis').max(8000),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
    name: z.string().max(255).optional(),
    size: z.number().optional(),
  })).optional(),
});

// ============================================
// SEARCH SCHEMAS
// ============================================

export const searchSchema = z.object({
  q: z.string().min(1, 'Requête de recherche requise'),
  type: z.enum(['users', 'posts', 'jobs', 'companies', 'all']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  cursor: z.string().optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
