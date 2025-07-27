/**
 * @deprecated This file is deprecated. Use centralized upload utilities instead.
 * 
 * Migration:
 * - Replace imports from this file with: import { uploadFile, uploadImage } from '@/utils/centralized'
 * - The centralized utilities provide better validation, error handling, and consistency
 */

// Re-export from centralized utilities for backward compatibility
export {
  uploadFile as uploadToMinio,
  uploadImage,
  uploadVideo,
  getTransformedUrl,
  getPublicIdFromUrl, 
  getVideoThumbnail
} from './centralized';

// Legacy alias - will be removed in future versions
export { uploadFile as uploadToCloudinary } from './centralized';
