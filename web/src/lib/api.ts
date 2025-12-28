const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Handle 204 No Content (successful DELETE)
      if (response.status === 204) {
        return { data: null as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Une erreur est survenue',
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Impossible de contacter le serveur' };
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// ============================================
// AUTH API
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  about?: string;
  isOpenToWork?: boolean;
  isHiring?: boolean;
  connectionCount?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post<AuthResponse>('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get<User>('/api/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      refreshToken,
    }),
};

// ============================================
// USERS API
// ============================================

export const usersApi = {
  getProfile: (id: string) => api.get<User>(`/api/users/${id}`),

  updateProfile: (data: Partial<User>) => api.patch<User>('/api/users/me', data),

  addExperience: (data: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }) => api.post('/api/users/me/experiences', data),

  addEducation: (data: {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }) => api.post('/api/users/me/education', data),

  addSkill: (name: string) => api.post('/api/users/me/skills', { name }),

  follow: (userId: string) => api.post(`/api/users/${userId}/follow`),

  unfollow: (userId: string) => api.delete(`/api/users/${userId}/follow`),
};

// ============================================
// POSTS API
// ============================================

export interface Post {
  id: string;
  content: string;
  visibility: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    avatarUrl?: string;
  };
  media?: Array<{ url: string; type: string }>;
  _count: {
    comments: number;
    reactions: number;
  };
  userReaction?: string | null;
}

export const postsApi = {
  getFeed: (cursor?: string) =>
    api.get<{ posts: Post[]; nextCursor: string | null }>(
      `/api/posts${cursor ? `?cursor=${cursor}` : ''}`
    ),

  getPost: (id: string) => api.get<Post>(`/api/posts/${id}`),

  getById: (id: string) => api.get<Post>(`/api/posts/${id}`),

  create: (data: { content: string; visibility?: string; media?: Array<{ url: string; type: string }> }) =>
    api.post<Post>('/api/posts', data),

  update: (id: string, data: { content?: string; visibility?: string }) =>
    api.patch<Post>(`/api/posts/${id}`, data),

  delete: (id: string) => api.delete(`/api/posts/${id}`),

  react: (id: string, type: string) =>
    api.post(`/api/posts/${id}/reactions`, { type }),

  removeReaction: (id: string) => api.delete(`/api/posts/${id}/reactions`),

  unreact: (id: string) => api.delete(`/api/posts/${id}/reactions`),

  comment: (id: string, content: string, parentId?: string) =>
    api.post(`/api/posts/${id}/comments`, { content, parentId }),
};

// ============================================
// JOBS API
// ============================================

export interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  locationType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  poster: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  hasApplied?: boolean;
  isSaved?: boolean;
}

export const jobsApi = {
  getAll: (params?: {
    q?: string;
    location?: string;
    locationType?: string;
    employmentType?: string;
    cursor?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
    }
    return api.get<{ jobs: Job[]; nextCursor: string | null }>(
      `/api/jobs?${searchParams.toString()}`
    );
  },

  getJob: (id: string) => api.get<Job>(`/api/jobs/${id}`),

  getById: (id: string) => api.get<Job>(`/api/jobs/${id}`),

  apply: (id: string, data?: { coverLetter?: string }) =>
    api.post(`/api/jobs/${id}/apply`, data),

  save: (id: string) => api.post(`/api/jobs/${id}/save`),

  unsave: (id: string) => api.delete(`/api/jobs/${id}/save`),
};

// ============================================
// CONNECTIONS API
// ============================================

export const connectionsApi = {
  getAll: () => api.get('/api/connections'),

  getPending: () => api.get('/api/connections/pending'),

  getSuggestions: () => api.get('/api/connections/suggestions'),

  getStatus: (userId: string) => api.get<{ status: string | null }>(`/api/connections/status/${userId}`),

  send: (receiverId: string, message?: string) =>
    api.post('/api/connections', { receiverId, message }),

  respond: (id: string, status: 'ACCEPTED' | 'DECLINED') =>
    api.patch(`/api/connections/${id}`, { status }),

  remove: (id: string) => api.delete(`/api/connections/${id}`),
};

// ============================================
// MESSAGES API
// ============================================

interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  headline?: string;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt?: string;
  createdAt: string;
  sender?: MessageUser;
}

interface ConversationData {
  id: string;
  participants: Array<{ user: MessageUser }>;
  messages: MessageData[];
  lastMessage?: MessageData;
  unreadCount?: number;
}

export const messagesApi = {
  getConversations: () => api.get<{ conversations: ConversationData[] }>('/api/messages/conversations'),

  getMessages: (conversationId: string, cursor?: string) =>
    api.get<{ messages: MessageData[]; nextCursor?: string }>(
      `/api/messages/conversations/${conversationId}${cursor ? `?cursor=${cursor}` : ''}`
    ),

  send: (receiverId: string, content: string) =>
    api.post<MessageData>('/api/messages', { receiverId, content }),

  getUnreadCount: () => api.get<{ count: number }>('/api/messages/unread-count'),
};

// ============================================
// NOTIFICATIONS API
// ============================================

interface NotificationData {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (unreadOnly?: boolean) =>
    api.get<{ notifications: NotificationData[] }>(`/api/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),

  getUnreadCount: () => api.get<{ count: number }>('/api/notifications/unread-count'),

  markAsRead: (id: string) => api.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

// ============================================
// SEARCH API
// ============================================

export interface SearchResults {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    headline: string | null;
    avatarUrl: string | null;
    connectionCount?: number;
  }>;
  posts: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    _count: { comments: number; reactions: number };
  }>;
  jobs: Array<{
    id: string;
    title: string;
    location: string | null;
    company: {
      id: string;
      name: string;
      logoUrl: string | null;
    } | null;
  }>;
  companies: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    industry: string | null;
    _count: { jobs: number };
  }>;
}

export interface TrendingItem {
  hashtag: {
    id: string;
    name: string;
  };
  count: number;
}

export const searchApi = {
  search: (q: string, type?: string) =>
    api.get<SearchResults>(`/api/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`),

  trending: () => api.get<TrendingItem[]>('/api/search/trending'),
};

// ============================================
// EXTERNAL API (France Travail, RSS)
// ============================================

export interface ExternalJob {
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
}

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  source: string;
  category: string;
  timeAgo: string;
  imageUrl?: string;
}

export const externalApi = {
  // France Travail
  getFranceTravailJobs: (params?: {
    q?: string;
    departement?: string;
    region?: string;
    typeContrat?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    return api.get<{ jobs: ExternalJob[]; total: number; source: string }>(
      `/api/external/jobs/france-travail?${searchParams.toString()}`
    );
  },

  getFranceTravailJob: (id: string) =>
    api.get<ExternalJob>(`/api/external/jobs/france-travail/${id}`),

  // News RSS
  getNews: (params?: { category?: string; limit?: number; refresh?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    return api.get<{ items: NewsItem[]; lastUpdated: string }>(
      `/api/external/news?${searchParams.toString()}`
    );
  },

  getNewsCategories: () =>
    api.get<{ categories: string[] }>('/api/external/news/categories'),

  getNewsSources: () =>
    api.get<{ sources: Array<{ name: string; category: string }> }>('/api/external/news/sources'),
};

// ============================================
// UPLOAD API
// ============================================

export interface UploadedMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  filename?: string;
  originalName?: string;
  size?: number;
}

export const uploadApi = {
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Erreur lors de l\'upload' };
      }
      return { data };
    } catch (error) {
      return { error: 'Impossible de contacter le serveur' };
    }
  },

  uploadBanner: async (file: File): Promise<ApiResponse<{ bannerUrl: string }>> => {
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Erreur lors de l\'upload' };
      }
      return { data };
    } catch (error) {
      return { error: 'Impossible de contacter le serveur' };
    }
  },

  uploadPostMedia: async (files: File[]): Promise<ApiResponse<{ media: UploadedMedia[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));

    try {
      const response = await fetch(`${API_URL}/api/upload/post-media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Erreur lors de l\'upload' };
      }
      return { data };
    } catch (error) {
      return { error: 'Impossible de contacter le serveur' };
    }
  },

  uploadDocument: async (file: File): Promise<ApiResponse<{ document: UploadedMedia }>> => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Erreur lors de l\'upload' };
      }
      return { data };
    } catch (error) {
      return { error: 'Impossible de contacter le serveur' };
    }
  },

  uploadMessageAttachments: async (files: File[]): Promise<ApiResponse<{ attachments: UploadedMedia[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('attachments', file));

    try {
      const response = await fetch(`${API_URL}/api/upload/message-attachments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Erreur lors de l\'upload' };
      }
      return { data };
    } catch (error) {
      return { error: 'Impossible de contacter le serveur' };
    }
  },
};
