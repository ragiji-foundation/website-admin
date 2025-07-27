/**
 * Centralized API Configuration
 * 
 * This file consolidates all API configuration and utilities to eliminate
 * the duplicate API base URL patterns found across the application.
 */

// Environment variables validation
const validateEnvVars = () => {
  const required = ['NEXT_PUBLIC_ADMIN_API_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
  }
};

validateEnvVars();

// Centralized API configuration
export const API_CONFIG = {
  // Primary admin API URL
  ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://admin.ragijifoundation.com',
  
  // Public landing page API URL  
  PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://www.ragijifoundation.com',
  
  // Generic base URL (fallback)
  BASE_API_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ragijifoundation.com',
  
  // Timeout configurations
  DEFAULT_TIMEOUT: 8000,
  UPLOAD_TIMEOUT: 30000,
  
  // Feature flags
  USE_FALLBACKS: process.env.NEXT_PUBLIC_USE_FALLBACK_DATA === 'true',
  DISABLE_API: process.env.NEXT_PUBLIC_DISABLE_API === 'true',
  
  // Environment detection
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache'
} as const;

// CORS headers for API responses
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, X-Auth-Token, Origin',
  'Access-Control-Allow-Credentials': 'true'
} as const;

/**
 * Get the appropriate API URL based on context
 */
export function getApiUrl(context: 'admin' | 'public' | 'base' = 'admin'): string {
  switch (context) {
    case 'admin':
      return API_CONFIG.ADMIN_API_URL;
    case 'public':
      return API_CONFIG.PUBLIC_API_URL;
    case 'base':
      return API_CONFIG.BASE_API_URL;
    default:
      return API_CONFIG.ADMIN_API_URL;
  }
}

/**
 * Build full URL with endpoint
 */
export function buildApiUrl(endpoint: string, context: 'admin' | 'public' | 'base' = 'admin'): string {
  const baseUrl = getApiUrl(context);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Enhanced fetch wrapper with centralized configuration
 */
export async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit & {
    context?: 'admin' | 'public' | 'base';
    timeout?: number;
    fallbackData?: T;
  } = {}
): Promise<T> {
  const {
    context = 'admin',
    timeout = API_CONFIG.DEFAULT_TIMEOUT,
    fallbackData,
    ...fetchOptions
  } = options;

  // Build full URL
  const url = buildApiUrl(endpoint, context);
  
  // Merge headers
  const headers = {
    ...DEFAULT_HEADERS,
    ...fetchOptions.headers
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out after ${timeout}ms`);
    }

    // Use fallback data if provided
    if (fallbackData !== undefined) {
      console.warn(`API error for ${endpoint}, using fallback data:`, error);
      return fallbackData;
    }

    throw error;
  }
}

/**
 * Specialized fetch functions for different contexts
 */
export const adminApi = {
  get: <T>(endpoint: string, fallbackData?: T) => 
    apiFetch<T>(endpoint, { method: 'GET', context: 'admin', fallbackData }),
  
  post: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      context: 'admin', 
      body: JSON.stringify(data) 
    }),
  
  put: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      context: 'admin', 
      body: JSON.stringify(data) 
    }),
  
  delete: <T>(endpoint: string) => 
    apiFetch<T>(endpoint, { method: 'DELETE', context: 'admin' }),
  
  patch: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'PATCH', 
      context: 'admin', 
      body: JSON.stringify(data) 
    })
};

export const publicApi = {
  get: <T>(endpoint: string, fallbackData?: T) => 
    apiFetch<T>(endpoint, { method: 'GET', context: 'public', fallbackData }),
  
  post: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      context: 'public', 
      body: JSON.stringify(data) 
    })
};

/**
 * Upload specific configuration
 */
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  getUploadUrl: (context: 'admin' | 'public' = 'admin') => 
    buildApiUrl('/api/upload', context),
  
  validateFile: (file: File, type: 'image' | 'video' | 'document' = 'image') => {
    const errors: string[] = [];
    
    if (file.size > uploadConfig.maxFileSize) {
      errors.push(`File size must be less than ${uploadConfig.maxFileSize / 1024 / 1024}MB`);
    }
    
    let allowedTypes: string[] = [];
    switch (type) {
      case 'image':
        allowedTypes = uploadConfig.allowedImageTypes;
        break;
      case 'video':
        allowedTypes = uploadConfig.allowedVideoTypes;
        break;
      case 'document':
        allowedTypes = uploadConfig.allowedDocumentTypes;
        break;
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed for ${type} uploads`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Debug utilities for development
 */
export const debugApi = {
  logConfig: () => {
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.group('🔧 API Configuration');
      console.log('Admin API URL:', API_CONFIG.ADMIN_API_URL);
      console.log('Public API URL:', API_CONFIG.PUBLIC_API_URL);
      console.log('Base API URL:', API_CONFIG.BASE_API_URL);
      console.log('Use Fallbacks:', API_CONFIG.USE_FALLBACKS);
      console.log('API Disabled:', API_CONFIG.DISABLE_API);
      console.groupEnd();
    }
  },
  
  testConnection: async (context: 'admin' | 'public' = 'admin') => {
    try {
      const response = await apiFetch('/api/health', { context, timeout: 5000 });
      console.log(`✅ ${context} API connection successful:`, response);
      return true;
    } catch (error) {
      console.error(`❌ ${context} API connection failed:`, error);
      return false;
    }
  }
};

// Initialize debug logging in development
if (API_CONFIG.IS_DEVELOPMENT) {
  debugApi.logConfig();
}
