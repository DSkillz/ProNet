import { Router } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { franceTravailService } from '../services/franceTravail.service';
import { rssService } from '../services/rss.service';

const router = Router();

// ============================================
// OFFRES D'EMPLOI FRANCE TRAVAIL
// ============================================

/**
 * GET /api/external/jobs/france-travail
 * Recherche d'offres d'emploi via l'API France Travail
 */
router.get(
  '/jobs/france-travail',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const {
      q, // Mots-clés
      commune,
      departement,
      region,
      distance,
      typeContrat,
      experience,
      limit = '20',
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    const range = `0-${limitNum - 1}`;

    const { jobs, total } = await franceTravailService.searchJobs({
      motsCles: q as string,
      commune: commune as string,
      departement: departement as string,
      region: region as string,
      distance: distance ? parseInt(distance as string) : undefined,
      typeContrat: typeContrat as string,
      experience: experience as string,
      range,
    });

    // Transformer les offres au format ProNet
    const transformedJobs = jobs.map((job) =>
      franceTravailService.transformToProNetFormat(job)
    );

    res.json({
      jobs: transformedJobs,
      total,
      source: 'france_travail',
    });
  })
);

/**
 * GET /api/external/jobs/france-travail/:id
 * Détail d'une offre France Travail
 */
router.get(
  '/jobs/france-travail/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: any) => {
    const { id } = req.params;

    // Retirer le préfixe "ft_" si présent
    const jobId = id.startsWith('ft_') ? id.slice(3) : id;

    const job = await franceTravailService.getJobById(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json(franceTravailService.transformToProNetFormat(job));
  })
);

// ============================================
// ACTUALITÉS RSS
// ============================================

/**
 * GET /api/external/news
 * Récupère les actualités depuis les flux RSS
 */
router.get(
  '/news',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const {
      category,
      limit = '10',
      refresh,
    } = req.query;

    const news = await rssService.getNews({
      category: category as string,
      limit: Math.min(parseInt(limit as string) || 10, 50),
      refresh: refresh === 'true',
    });

    res.json(news);
  })
);

/**
 * GET /api/external/news/categories
 * Liste les catégories d'actualités disponibles
 */
router.get(
  '/news/categories',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const categories = rssService.getCategories();
    res.json({ categories });
  })
);

/**
 * GET /api/external/news/sources
 * Liste les sources RSS configurées
 */
router.get(
  '/news/sources',
  asyncHandler(async (req: AuthRequest, res: any) => {
    const sources = rssService.getFeedSources();
    res.json({ sources });
  })
);

export default router;
