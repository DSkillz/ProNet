import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';

const router = Router();

// ============================================
// LISTE DES ÉVÉNEMENTS
// ============================================
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { type, format, page = '1', limit = '10', upcoming = 'true' } = req.query;
    const take = Math.min(parseInt(limit as string), 50);
    const skip = (parseInt(page as string) - 1) * take;

    const where: any = {
      isPublished: true,
      isCancelled: false,
    };

    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }

    if (type) where.type = type;
    if (format) where.format = format;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        take,
        skip,
        orderBy: { startDate: 'asc' },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          _count: {
            select: { attendees: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Vérifier si l'utilisateur est inscrit à chaque événement
    const eventsWithRegistration = await Promise.all(
      events.map(async (event) => {
        let isRegistered = false;
        if (req.user) {
          const attendance = await prisma.eventAttendee.findUnique({
            where: {
              eventId_userId: {
                eventId: event.id,
                userId: req.user.id,
              },
            },
          });
          isRegistered = !!attendance;
        }
        return {
          ...event,
          attendeesCount: event._count.attendees,
          isRegistered,
          _count: undefined,
        };
      })
    );

    res.json({
      events: eventsWithRegistration,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    });
  })
);

// ============================================
// MES ÉVÉNEMENTS (organisés ou inscrits)
// ============================================
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { type = 'registered' } = req.query; // 'registered' | 'organized'

    let events;

    if (type === 'organized') {
      events = await prisma.event.findMany({
        where: { organizerId: req.user!.id },
        orderBy: { startDate: 'desc' },
        include: {
          _count: { select: { attendees: true } },
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      });
    } else {
      const attendances = await prisma.eventAttendee.findMany({
        where: { userId: req.user!.id, status: { not: 'CANCELLED' } },
        include: {
          event: {
            include: {
              organizer: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
              company: { select: { id: true, name: true, logoUrl: true } },
              _count: { select: { attendees: true } },
            },
          },
        },
        orderBy: { event: { startDate: 'asc' } },
      });
      events = attendances.map((a) => ({
        ...a.event,
        attendeesCount: a.event._count.attendees,
        isRegistered: true,
        _count: undefined,
      }));
    }

    res.json({ events });
  })
);

// ============================================
// DÉTAIL D'UN ÉVÉNEMENT
// ============================================
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            headline: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
          },
        },
        attendees: {
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
        tags: true,
        _count: { select: { attendees: true } },
      },
    });

    if (!event) {
      throw new AppError(404, 'Événement non trouvé');
    }

    let isRegistered = false;
    let registrationStatus = null;

    if (req.user) {
      const attendance = await prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: req.user.id,
          },
        },
      });
      isRegistered = !!attendance;
      registrationStatus = attendance?.status || null;
    }

    res.json({
      ...event,
      attendeesCount: event._count.attendees,
      isRegistered,
      registrationStatus,
      _count: undefined,
    });
  })
);

// ============================================
// CRÉER UN ÉVÉNEMENT
// ============================================
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      title,
      description,
      type,
      format,
      location,
      address,
      onlineUrl,
      startDate,
      endDate,
      timezone,
      coverImage,
      maxAttendees,
      price,
      currency,
      companyId,
      tags,
    } = req.body;

    if (!title || !description || !type || !startDate) {
      throw new AppError(400, 'Titre, description, type et date de début requis');
    }

    const event = await prisma.event.create({
      data: {
        organizerId: req.user!.id,
        companyId,
        title,
        description,
        type,
        format: format || 'IN_PERSON',
        location,
        address,
        onlineUrl,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        timezone: timezone || 'Europe/Paris',
        coverImage,
        maxAttendees,
        price,
        currency,
        tags: tags?.length
          ? {
              create: tags.map((name: string) => ({ name })),
            }
          : undefined,
      },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        tags: true,
      },
    });

    // L'organisateur est automatiquement inscrit
    await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        userId: req.user!.id,
        status: 'REGISTERED',
      },
    });

    res.status(201).json(event);
  })
);

// ============================================
// MODIFIER UN ÉVÉNEMENT
// ============================================
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new AppError(404, 'Événement non trouvé');
    }

    if (event.organizerId !== req.user!.id) {
      throw new AppError(403, 'Non autorisé');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: req.body,
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        tags: true,
        _count: { select: { attendees: true } },
      },
    });

    res.json(updated);
  })
);

// ============================================
// SUPPRIMER UN ÉVÉNEMENT
// ============================================
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new AppError(404, 'Événement non trouvé');
    }

    if (event.organizerId !== req.user!.id) {
      throw new AppError(403, 'Non autorisé');
    }

    await prisma.event.delete({ where: { id } });

    res.status(204).send();
  })
);

// ============================================
// S'INSCRIRE À UN ÉVÉNEMENT
// ============================================
router.post(
  '/:id/register',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { attendees: true } } },
    });

    if (!event) {
      throw new AppError(404, 'Événement non trouvé');
    }

    if (event.isCancelled) {
      throw new AppError(400, 'Cet événement a été annulé');
    }

    // Vérifier si déjà inscrit
    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Vous êtes déjà inscrit à cet événement');
    }

    // Vérifier la capacité
    let status = 'REGISTERED';
    if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
      status = 'WAITLIST';
    }

    const attendance = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        userId: req.user!.id,
        status,
      },
    });

    res.status(201).json({
      message: status === 'WAITLIST' ? 'Vous êtes sur liste d\'attente' : 'Inscription confirmée',
      status,
      attendance,
    });
  })
);

// ============================================
// SE DÉSINSCRIRE D'UN ÉVÉNEMENT
// ============================================
router.delete(
  '/:id/register',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const attendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!attendance) {
      throw new AppError(404, 'Vous n\'êtes pas inscrit à cet événement');
    }

    await prisma.eventAttendee.delete({
      where: { id: attendance.id },
    });

    res.status(204).send();
  })
);

export default router;
