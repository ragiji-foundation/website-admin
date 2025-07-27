/**
 * CENTRALIZED UTILITIES INDEX
 * 
 * Single import point for all centralized utilities.
 * This reduces import duplication across the codebase.
 */

import { NextRequest } from 'next/server';

// Upload utilities
export {
  uploadFile,
  uploadImage,
  uploadVideo,
  uploadForEditor,
  validateFile,
  getTransformedUrl,
  getPublicIdFromUrl,
  getVideoThumbnail,
  // Legacy compatibility
  uploadToMinio,
  uploadToCloudinary,
  handleImageUpload,
  handleVideoUpload,
  type UploadOptions,
  type UploadResult
} from './upload';

// API utilities
export {
  addCorsHeaders,
  apiSuccess,
  apiError,
  handleOptions,
  handleOptionsWithParams,
  validateRequired,
  validateId,
  withApiHandler,
  parseRequestBody,
  parseFormData,
  handleDatabaseError,
  CrudResponses,
  logApiCall,
  getPaginationParams,
  createPaginatedResponse,
  type ApiError,
  type ApiSuccess
} from './api';

// Import for convenience functions
import { uploadFile } from './upload';
import { withApiHandler, apiSuccess, parseRequestBody, validateRequired } from './api';

/**
 * Convenience re-exports for common patterns
 */

// Most common upload pattern
export const uploadFileWithProgress = (
  file: File,
  folder: string,
  onProgress: (progress: number) => void
) => uploadFile(file, { folder, progressCallback: onProgress });

// Most common API pattern
export const createStandardApiRoute = <T>(
  handler: () => Promise<T>
) => withApiHandler(async () => {
  const data = await handler();
  return apiSuccess(data);
});

// Common validation pattern
export const validateAndParse = async <T>(
  request: NextRequest,
  requiredFields: string[]
): Promise<T> => {
  const data = await parseRequestBody<T>(request);
  validateRequired(data as Record<string, unknown>, requiredFields);
  return data;
};
