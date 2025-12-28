import { MetadataRoute } from 'next';

const baseUrl = 'https://pronet.careers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/groups`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Récupérer les offres d'emploi dynamiques depuis l'API
  let jobPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pronet-api-7mxx.onrender.com'}/api/jobs?limit=100`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (response.ok) {
      const data = await response.json();
      jobPages = (data.jobs || []).map((job: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
  }

  // Récupérer les profils publics
  let profilePages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pronet-api-7mxx.onrender.com'}/api/users?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const data = await response.json();
      profilePages = (data.users || []).map((user: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/profile/${user.id}`,
        lastModified: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching users for sitemap:', error);
  }

  // Récupérer les événements
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pronet-api-7mxx.onrender.com'}/api/events?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const data = await response.json();
      eventPages = (data.events || []).map((event: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
  }

  // Récupérer les groupes
  let groupPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pronet-api-7mxx.onrender.com'}/api/groups?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const data = await response.json();
      groupPages = (data.groups || []).map((group: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/groups/${group.id}`,
        lastModified: group.updatedAt ? new Date(group.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching groups for sitemap:', error);
  }

  return [
    ...staticPages,
    ...jobPages,
    ...profilePages,
    ...eventPages,
    ...groupPages,
  ];
}
