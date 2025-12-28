/**
 * Service pour l'API France Travail (anciennement Pôle Emploi)
 * Documentation: https://francetravail.io/data/api/offres-emploi
 *
 * Pour obtenir vos credentials:
 * 1. Créer un compte sur https://francetravail.io/inscription
 * 2. Créer une application pour obtenir client_id et client_secret
 * 3. Activer le scope "api_offresdemploiv2 o2dsoffre"
 */

interface FranceTravailToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface FranceTravailJob {
  id: string;
  intitule: string;
  description?: string;
  dateCreation: string;
  dateActualisation?: string;
  lieuTravail?: {
    libelle?: string;
    latitude?: number;
    longitude?: number;
    codePostal?: string;
    commune?: string;
  };
  entreprise?: {
    nom?: string;
    description?: string;
    logo?: string;
    url?: string;
  };
  typeContrat?: string;
  typeContratLibelle?: string;
  natureContrat?: string;
  experienceExige?: string;
  experienceLibelle?: string;
  competences?: Array<{
    code?: string;
    libelle: string;
    exigence?: string;
  }>;
  salaire?: {
    libelle?: string;
    commentaire?: string;
    complement1?: string;
    complement2?: string;
  };
  dureeTravailLibelle?: string;
  dureeTravailLibelleConverti?: string;
  alternance?: boolean;
  contact?: {
    nom?: string;
    coordonnees1?: string;
    coordonnees2?: string;
    coordonnees3?: string;
  };
  nombrePostes?: number;
  accessibleTH?: boolean;
  qualificationCode?: string;
  qualificationLibelle?: string;
  secteurActivite?: string;
  secteurActiviteLibelle?: string;
  origineOffre?: {
    origine: string;
    urlOrigine?: string;
  };
  offresManqueCandidats?: boolean;
  appellationlibelle?: string;
  romeCode?: string;
  romeLibelle?: string;
}

interface FranceTravailSearchResponse {
  resultats: FranceTravailJob[];
  contentRange?: {
    maxResults: number;
    startIndex: number;
    endIndex: number;
  };
}

interface FranceTravailSearchParams {
  motsCles?: string;
  commune?: string;
  departement?: string;
  region?: string;
  distance?: number;
  typeContrat?: string;
  experience?: string;
  qualification?: string;
  tempsPlein?: boolean;
  range?: string;
}

class FranceTravailService {
  private clientId: string;
  private clientSecret: string;
  private tokenUrl = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire';
  private apiUrl = 'https://api.francetravail.io/partenaire/offresdemploi/v2';

  private cachedToken: FranceTravailToken | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID || '';
    this.clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET || '';
  }

  private isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('France Travail API non configurée. Définissez FRANCE_TRAVAIL_CLIENT_ID et FRANCE_TRAVAIL_CLIENT_SECRET.');
    }

    // Retourner le token en cache s'il est encore valide
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken.access_token;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'api_offresdemploiv2 o2dsoffre',
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur d'authentification France Travail: ${response.status} - ${errorText}`);
    }

    this.cachedToken = await response.json();
    this.tokenExpiresAt = Date.now() + (this.cachedToken!.expires_in * 1000);

    return this.cachedToken!.access_token;
  }

  async searchJobs(params: FranceTravailSearchParams = {}): Promise<{
    jobs: FranceTravailJob[];
    total: number;
  }> {
    if (!this.isConfigured()) {
      console.warn('France Travail API non configurée, retour de données vides');
      return { jobs: [], total: 0 };
    }

    try {
      const token = await this.getAccessToken();

      const searchParams = new URLSearchParams();

      if (params.motsCles) searchParams.set('motsCles', params.motsCles);
      if (params.commune) searchParams.set('commune', params.commune);
      if (params.departement) searchParams.set('departement', params.departement);
      if (params.region) searchParams.set('region', params.region);
      if (params.distance) searchParams.set('distance', params.distance.toString());
      if (params.typeContrat) searchParams.set('typeContrat', params.typeContrat);
      if (params.experience) searchParams.set('experience', params.experience);
      if (params.qualification) searchParams.set('qualification', params.qualification);
      if (params.tempsPlein !== undefined) searchParams.set('tempsPlein', params.tempsPlein.toString());

      // Par défaut, récupérer les 20 premières offres
      searchParams.set('range', params.range || '0-19');

      const response = await fetch(`${this.apiUrl}/offres/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API France Travail: ${response.status} - ${errorText}`);
      }

      const data: FranceTravailSearchResponse = await response.json();

      return {
        jobs: data.resultats || [],
        total: data.contentRange?.maxResults || data.resultats?.length || 0,
      };
    } catch (error) {
      console.error('Erreur France Travail:', error);
      return { jobs: [], total: 0 };
    }
  }

  async getJobById(id: string): Promise<FranceTravailJob | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.apiUrl}/offres/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Erreur API France Travail: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur France Travail getJobById:', error);
      return null;
    }
  }

  // Transformer les données France Travail vers le format ProNet
  transformToProNetFormat(job: FranceTravailJob): {
    id: string;
    title: string;
    description: string;
    location: string | null;
    locationType: string;
    employmentType: string;
    experienceLevel: string;
    salary: string | null;
    company: {
      name: string;
      logoUrl: string | null;
    };
    source: 'france_travail';
    externalUrl: string | null;
    createdAt: string;
  } {
    // Mapper les types de contrat
    const contractTypeMap: Record<string, string> = {
      'CDI': 'FULL_TIME',
      'CDD': 'CONTRACT',
      'MIS': 'TEMPORARY',
      'SAI': 'CONTRACT',
      'INT': 'INTERNSHIP',
      'LIB': 'FREELANCE',
      'REP': 'FULL_TIME',
      'FRA': 'FREELANCE',
    };

    // Mapper les niveaux d'expérience
    const experienceMap: Record<string, string> = {
      'D': 'ENTRY', // Débutant accepté
      'S': 'ASSOCIATE', // Souhaité
      'E': 'MID_SENIOR', // Exigé
    };

    return {
      id: `ft_${job.id}`,
      title: job.intitule,
      description: job.description || '',
      location: job.lieuTravail?.libelle || null,
      locationType: 'ON_SITE', // Par défaut
      employmentType: contractTypeMap[job.typeContrat || ''] || 'FULL_TIME',
      experienceLevel: experienceMap[job.experienceExige || ''] || 'ENTRY',
      salary: job.salaire?.libelle || null,
      company: {
        name: job.entreprise?.nom || 'Entreprise',
        logoUrl: job.entreprise?.logo || null,
      },
      source: 'france_travail',
      externalUrl: job.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`,
      createdAt: job.dateCreation,
    };
  }
}

export const franceTravailService = new FranceTravailService();
export type { FranceTravailJob, FranceTravailSearchParams };
