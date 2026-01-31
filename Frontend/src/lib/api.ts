/**
 * AI Counsellor - Centralized API Client
 * 
 * Architecture: Axios with Request/Response Interceptors
 * Features:
 * - Automatic JWT token attachment
 * - Global error handling
 * - 401 Unauthorized auto-redirect
 * - Network error graceful degradation
 * - Typed API responses
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
}

export interface UserProfile {
  id: number;
  user_id: number;
  gpa?: number;
  degree_level?: 'bachelors' | 'masters' | 'phd';
  budget?: number;
  target_country?: string;
  ielts_score?: number;
  gre_score?: number;
  current_stage: number;
}

export interface University {
  id: number;
  name: string;
  country: string;
  acceptance_rate: number;
  tuition_fee: number;
  ranking?: number;
  location?: string;
  match_tier?: 'Safe' | 'Target' | 'Dream';
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'pending' | 'done';
  due_date?: string;
  university_id?: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  render_cards?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const TokenStorage = {
  TOKEN_KEY: 'access_token',
  LEGACY_TOKEN_KEY: 'token',
  USER_ID_KEY: 'user_id',

  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.LEGACY_TOKEN_KEY);
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.LEGACY_TOKEN_KEY, token);
  },

  setUserId(userId: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_ID_KEY, String(userId));
  },

  getUserId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.get();
  },
};

// ═══════════════════════════════════════════════════════════════
// AXIOS INSTANCE & INTERCEPTORS
// ═══════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

const setAuthHeader = (token?: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

// Initialize auth header from storage (client-side only)
if (typeof window !== 'undefined') {
  setAuthHeader(TokenStorage.get());
}

// REQUEST INTERCEPTOR: Attach JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ALWAYS fetch token fresh from localStorage before each request
    if (typeof window !== 'undefined') {
      const token = TokenStorage.get();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Attaching Token to:', config.url);
      } else {
        console.warn('⚠️ No token found in storage for:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    console.log('[API Error] Full error:', error);
    console.log('[API Error] Response:', error.response);
    console.log('[API Error] Status:', error.response?.status);
    console.log('[API Error] Data:', error.response?.data);
    
    // Network error (backend offline)
    if (!error.response) {
      const networkError: ApiError = {
        message: 'System Offline: Unable to connect to the server. Please check if the backend is running on port 8000.',
        isNetworkError: true,
      };
      
      // Dispatch custom event for global error handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api:network-error', { detail: networkError }));
      }
      
      return Promise.reject(networkError);
    }

    // 401 Unauthorized: Token expired or invalid
    if (error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      
      console.log('[API] 401 Unauthorized:', {
        url: error.config?.url,
        isAuthEndpoint,
        currentPath,
        hasToken: !!TokenStorage.get(),
        tokenPreview: TokenStorage.get()?.substring(0, 30) + '...'
      });
      
      // Don't clear token or redirect for auth endpoints (login/signup failures)
      if (!isAuthEndpoint) {
        console.warn('[API] Session expired or invalid token, clearing auth state');
        TokenStorage.remove();
        setAuthHeader(null);
        
        // Only redirect if not already on auth page
        if (typeof window !== 'undefined' && !currentPath.includes('/auth')) {
          console.log('[API] Redirecting to /auth due to 401');
          window.dispatchEvent(new CustomEvent('api:unauthorized'));
          
          // Use a small delay to allow current state to settle
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
      }
      
      return Promise.reject({
        message: error.response.data?.detail || 'Invalid email or password',
        status: 401,
        response: error.response,
      } as ApiError);
    }

    // 400 Bad Request - validation errors
    if (error.response.status === 400) {
      return Promise.reject({
        message: error.response.data?.detail || 'Invalid request. Please check your input.',
        status: 400,
        response: error.response,
      } as ApiError);
    }

    // 422 Validation Error - Pydantic validation failed
    if (error.response.status === 422) {
      const validationErrors = error.response.data as any;
      let message = 'Validation failed';
      if (validationErrors?.detail && Array.isArray(validationErrors.detail)) {
        message = validationErrors.detail.map((e: any) => e.msg || e.message).join('. ');
      }
      return Promise.reject({
        message,
        status: 422,
        response: error.response,
      } as ApiError);
    }

    // Other HTTP errors
    const apiError: ApiError = {
      message: error.response.data?.detail || error.response.data?.message || `Request failed with status ${error.response.status}`,
      status: error.response.status,
    };

    // Preserve the original response for detailed error handling
    return Promise.reject({
      ...apiError,
      response: error.response,
      originalError: error,
    });
  }
);

// ═══════════════════════════════════════════════════════════════
// API METHODS
// ═══════════════════════════════════════════════════════════════

export const API = {
  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────────────────────
  auth: {
    /**
     * Register a new user
     * Creates user + empty profile, returns JWT token
     */
    signup: async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
      const response = await axiosInstance.post<AuthResponse>('/auth/signup', {
        email,
        password,
        full_name: fullName || email.split('@')[0].replace(/[._]/g, ' ').trim(),  // Send name or fallback to email prefix
      });
      
      // Store credentials
      console.log('[API] Signup successful, storing token:', response.data.access_token?.substring(0, 20) + '...');
      TokenStorage.set(response.data.access_token);
      TokenStorage.setUserId(response.data.user_id);
      setAuthHeader(response.data.access_token);
      
      // Verify token was stored
      const storedToken = TokenStorage.get();
      console.log('[API] Token stored successfully:', !!storedToken);
      
      return response.data;
    },

    /**
     * Authenticate existing user
     * Verifies credentials, returns JWT token
     */
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      console.log('[API] Login successful, response:', {
        hasToken: !!response.data.access_token,
        tokenPreview: response.data.access_token?.substring(0, 30) + '...',
        userId: response.data.user_id
      });
      
      // Store credentials
      TokenStorage.set(response.data.access_token);
      TokenStorage.setUserId(response.data.user_id);
      setAuthHeader(response.data.access_token);
      
      // Verify token was stored
      const storedToken = TokenStorage.get();
      console.log('[API] Token verification after login:', {
        stored: !!storedToken,
        matches: storedToken === response.data.access_token,
        preview: storedToken?.substring(0, 30) + '...'
      });
      
      return response.data;
    },

    /**
     * Clear local auth state
     */
    logout: (): void => {
      TokenStorage.remove();
      setAuthHeader(null);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
      return TokenStorage.isAuthenticated();
    },
  },

  // ─────────────────────────────────────────────────────────────
  // PROFILE MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  profile: {
    /**
     * Get current user's profile
     */
    get: async (): Promise<UserProfile> => {
      const response = await axiosInstance.get<UserProfile>('/profile/');
      return response.data;
    },

    /**
     * Update user profile
     * Backend automatically calculates current_stage
     */
    update: async (data: Partial<Omit<UserProfile, 'id' | 'user_id' | 'current_stage'>>): Promise<UserProfile> => {
      const response = await axiosInstance.post<UserProfile>('/profile/update', data);
      return response.data;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // UNIVERSITY DISCOVERY
  // ─────────────────────────────────────────────────────────────
  universities: {
    /**
     * Seed university database (dev only)
     */
    seed: async (): Promise<{ message: string }> => {
      const response = await axiosInstance.post('/universities/seed');
      return response.data;
    },

    /**
     * Get AI-recommended universities based on profile
     * Returns filtered list with match_tier calculated
     */
    getRecommendations: async (): Promise<University[]> => {
      const response = await axiosInstance.get<University[]>('/universities/recommend');
      return response.data;
    },

    /**
     * Lock a university (commit to application)
     * Creates auto-generated tasks and advances stage
     */
    lock: async (universityId: number): Promise<{ message: string; tasks_created: number }> => {
      const response = await axiosInstance.post(`/universities/lock/${universityId}`);
      return response.data;
    },

    /**
     * Get user's shortlisted universities
     */
    getShortlist: async (): Promise<University[]> => {
      const response = await axiosInstance.get('/universities/shortlist');
      return response.data;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // AI CHAT
  // ─────────────────────────────────────────────────────────────
  chat: {
    /**
     * Send message to AI counsellor
     * Supports context via message history
     * May return [RENDER_CARD: UniName] tags for UI rendering
     */
    sendMessage: async (message: string, history: ChatMessage[] = []): Promise<ChatResponse> => {
      const response = await axiosInstance.post<ChatResponse>('/chat/message', {
        message,
        history,
      });
      return response.data;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // TASK MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  tasks: {
    /**
     * Get all tasks for current user
     */
    getAll: async (): Promise<{ tasks: Task[]; all_cleared: boolean }> => {
      const response = await axiosInstance.get('/tasks/');
      return response.data;
    },

    /**
     * Update task status
     */
    update: async (taskId: number, status: 'pending' | 'done'): Promise<Task> => {
      const response = await axiosInstance.patch<Task>(`/tasks/${taskId}`, { status });
      return response.data;
    },

    /**
     * Get AI assistance for a specific task
     */
    getAssistance: async (taskId: number): Promise<{ content: string }> => {
      const response = await axiosInstance.post('/tasks/assist', { task_id: taskId });
      return response.data;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // SYSTEM
  // ─────────────────────────────────────────────────────────────
  health: async (): Promise<{ status: string }> => {
    const response = await axiosInstance.get('/health');
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════
// UTILITY HOOKS & HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if an error is a network error (backend offline)
 */
export function isNetworkError(error: unknown): error is ApiError {
  return (error as ApiError)?.isNetworkError === true;
}

/**
 * Get error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if ((error as ApiError)?.message) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred';
}

export default API;
