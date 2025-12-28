/**
 * Service RSS pour récupérer les actualités professionnelles
 * Agrège plusieurs sources RSS françaises sur l'emploi, l'économie et les RH
 */

import { XMLParser } from 'fast-xml-parser';

interface RssItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  source: string;
  category?: string;
  imageUrl?: string;
}

interface RssFeed {
  name: string;
  url: string;
  category: string;
}

// Flux RSS configurables pour l'actualité professionnelle française
// URLs testées et fonctionnelles au 28/12/2025
const RSS_FEEDS: RssFeed[] = [
  // Économie et entreprise
  {
    name: 'Le Monde - Économie',
    url: 'https://www.lemonde.fr/economie/rss_full.xml',
    category: 'Économie',
  },
  {
    name: 'Challenges',
    url: 'https://www.challenges.fr/rss.xml',
    category: 'Économie',
  },
  {
    name: 'BFM Business',
    url: 'https://www.bfmtv.com/rss/economie/',
    category: 'Économie',
  },
  {
    name: "L'Usine Nouvelle",
    url: 'https://www.usinenouvelle.com/rss',
    category: 'Économie',
  },
  // Tech et startups
  {
    name: 'Maddyness',
    url: 'https://www.maddyness.com/feed/',
    category: 'Tech',
  },
  {
    name: 'FrenchWeb',
    url: 'https://www.frenchweb.fr/feed',
    category: 'Tech',
  },
  {
    name: 'Siècle Digital',
    url: 'https://siecledigital.fr/feed/',
    category: 'Tech',
  },
  {
    name: 'Blog du Modérateur',
    url: 'https://www.blogdumoderateur.com/feed/',
    category: 'Tech',
  },
  {
    name: 'Presse-citron',
    url: 'https://www.presse-citron.net/feed/',
    category: 'Tech',
  },
  // RH et emploi
  {
    name: 'Welcome to the Jungle',
    url: 'https://www.welcometothejungle.com/fr/feed.rss',
    category: 'Emploi',
  },
];

class RssService {
  private parser: XMLParser;
  private cache: Map<string, { items: RssItem[]; timestamp: number }> = new Map();
  private cacheDuration = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  private async fetchFeed(feed: RssFeed): Promise<RssItem[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'ProNet/1.0 (RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Erreur RSS ${feed.name}: ${response.status}`);
        return [];
      }

      const xml = await response.text();
      const parsed = this.parser.parse(xml);

      // Gestion des différents formats RSS/Atom
      const items = parsed?.rss?.channel?.item ||
                    parsed?.feed?.entry ||
                    parsed?.channel?.item ||
                    [];

      const itemsArray = Array.isArray(items) ? items : [items];

      return itemsArray.slice(0, 10).map((item: any) => ({
        title: item.title?.['#text'] || item.title || '',
        link: item.link?.['@_href'] || item.link || '',
        description: this.cleanHtml(item.description || item.summary || item.content || ''),
        pubDate: item.pubDate || item.published || item.updated || '',
        source: feed.name,
        category: feed.category,
        imageUrl: this.extractImage(item),
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn(`Timeout RSS ${feed.name}`);
      } else {
        console.warn(`Erreur récupération RSS ${feed.name}:`, error);
      }
      return [];
    }
  }

  private cleanHtml(html: string): string {
    // Supprimer les balises HTML et limiter la longueur
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
      .slice(0, 300);
  }

  private extractImage(item: any): string | undefined {
    // Essayer différentes sources d'images
    const enclosure = item.enclosure;
    if (enclosure?.['@_url'] && enclosure['@_type']?.startsWith('image')) {
      return enclosure['@_url'];
    }

    const mediaContent = item['media:content'] || item['media:thumbnail'];
    if (mediaContent?.['@_url']) {
      return mediaContent['@_url'];
    }

    // Chercher une image dans le contenu
    const content = item.description || item.content || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  private formatTimeAgo(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }

  async getNews(options: {
    category?: string;
    limit?: number;
    refresh?: boolean;
  } = {}): Promise<{
    items: Array<{
      title: string;
      link: string;
      description: string;
      source: string;
      category: string;
      timeAgo: string;
      imageUrl?: string;
    }>;
    lastUpdated: string;
  }> {
    const { category, limit = 10, refresh = false } = options;
    const cacheKey = `news_${category || 'all'}`;

    // Vérifier le cache
    if (!refresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          items: cached.items.slice(0, limit).map(item => ({
            ...item,
            description: item.description || '',
            category: item.category || '',
            timeAgo: this.formatTimeAgo(item.pubDate || ''),
          })),
          lastUpdated: new Date(cached.timestamp).toISOString(),
        };
      }
    }

    // Filtrer les feeds par catégorie si spécifié
    const feedsToFetch = category
      ? RSS_FEEDS.filter(f => f.category.toLowerCase() === category.toLowerCase())
      : RSS_FEEDS;

    // Récupérer tous les feeds en parallèle
    const results = await Promise.all(feedsToFetch.map(feed => this.fetchFeed(feed)));
    const allItems = results.flat();

    // Trier par date (plus récent d'abord)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate || 0);
      const dateB = new Date(b.pubDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Mettre en cache
    this.cache.set(cacheKey, { items: allItems, timestamp: Date.now() });

    return {
      items: allItems.slice(0, limit).map(item => ({
        ...item,
        description: item.description || '',
        category: item.category || '',
        timeAgo: this.formatTimeAgo(item.pubDate || ''),
      })),
      lastUpdated: new Date().toISOString(),
    };
  }

  getCategories(): string[] {
    return [...new Set(RSS_FEEDS.map(f => f.category))];
  }

  getFeedSources(): Array<{ name: string; category: string }> {
    return RSS_FEEDS.map(f => ({ name: f.name, category: f.category }));
  }
}

export const rssService = new RssService();
