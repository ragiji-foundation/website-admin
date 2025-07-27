/**
 * CENTRALIZED API UTILITIES
 * 
 * This provides unified error handling, CORS, and response patterns
 * for all API routes to eliminate duplication.
 */

import { NextRequest, NextResponse } from 'next/server';

// Centralized CORS configuration
const CORS_CONFIG = {
  allowedOrigins: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://www.ragijifoundation.com',
    'https://ragijifoundation.com',
    'https://admin.ragijifoundation.com'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Cache-Control',
    'X-Auth-Token',
    'Origin',
    'Pragma',
    'Referer',
    'User-Agent'
  ],
  maxAge: 86400, // 24 hours
  credentials: true
} as const;

// Standardized error types
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Centralized CORS handler
 */
export function addCorsHeaders<T>(response: NextResponse<T>, request?: NextRequest): NextResponse<T> {
  const origin = request?.headers.get('origin') || '*';
  const allowedOrigin = (CORS_CONFIG.allowedOrigins as readonly string[]).includes(origin) ? origin : '*';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());

  return response;
}

/**
 * Centralized success response
 */
export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse<ApiSuccess<T>> {
  const response = NextResponse.json({
    success: true as const,
    data,
    message
  }, { status });
  
  return addCorsHeaders(response);
}

/**
 * Centralized error response
 */
export function apiError(
  message: string, 
  status = 400, 
  details?: string, 
  code?: string
): NextResponse<ApiError> {
  const response = NextResponse.json({
    error: message,
    details,
    code
  }, { status });
  
  return addCorsHeaders(response);
}

/**
 * Centralized OPTIONS handler for regular routes
 */
export function handleOptions(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, request);
}

/**
 * Centralized OPTIONS handler for dynamic routes
 * Accepts the same parameters as other route handlers for consistency
 */
export function handleOptionsWithParams(
  request: NextRequest, 
  _context: { params: Promise<{ id: string }> }
): NextResponse {
  // We don't need to use context/params for OPTIONS handler
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, request);
}

/**
 * Centralized validation helpers
 */
export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export function validateId(id: string | null | undefined): number {
  if (!id || isNaN(Number(id))) {
    throw new Error('Invalid ID provided');
  }
  return Number(id);
}

/**
 * Centralized async handler wrapper
 */
export function withApiHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Handler Error:', error);
      
      if (error instanceof Error) {
        return apiError(error.message, 500);
      }
      
      return apiError('Internal server error', 500);
    }
  };
}

/**
 * Centralized request body parser
 */
export async function parseRequestBody<T = unknown>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Centralized form data parser
 */
export async function parseFormData(request: NextRequest): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    throw new Error('Invalid form data in request');
  }
}

/**
 * Centralized database error handler
 */
export function handleDatabaseError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error);
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if (error.code === 'P2002') {
      throw new Error('Duplicate entry. This record already exists.');
    }
    
    if (error.code === 'P2025') {
      throw new Error('Record not found.');
    }
  }
  
  throw new Error(`Failed to ${operation}`);
}

/**
 * Standardized CRUD response helpers
 */
export const CrudResponses = {
  created: <T>(data: T) => apiSuccess(data, 'Resource created successfully', 201),
  updated: <T>(data: T) => apiSuccess(data, 'Resource updated successfully'),
  deleted: () => apiSuccess(null, 'Resource deleted successfully'),
  notFound: () => apiError('Resource not found', 404),
  duplicateEntry: () => apiError('Duplicate entry. This record already exists.', 409),
  validationError: (message: string) => apiError(`Validation error: ${message}`, 400),
} as const;

/**
 * Centralized logging utility
 */
export function logApiCall(request: NextRequest, action: string): void {
  const { method, url } = request;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url} - ${action}`);
}

/**
 * Helper to extract pagination params
 */
export function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return apiSuccess({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}
