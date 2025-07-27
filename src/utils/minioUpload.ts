/**
 * @deprecated Use uploadService instead
 * Re-export from centralized upload service for backward compatibility
 */
export { 
  uploadFile as uploadToMinio,
  uploadFile as uploadToCloudinary, // For legacy compatibility
  getTransformedUrl,
  getPublicIdFromUrl,
  getVideoThumbnail 
} from '@/services/uploadService';
