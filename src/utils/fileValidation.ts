/**
 * Server-side utilities for handling file uploads
 * 
 * Note: In server-side code (API routes), the global File constructor
 * is not available, so we need alternative ways to check file objects.
 */

/**
 * Type guard to check if an object is a File-like object
 * This works in both client and server environments
 */
export function isFileObject(obj: any): obj is File {
  if (!obj) return false;
  
  // Check for File properties that are available in FormData
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.size === 'number' &&
    obj.size >= 0 &&
    (typeof obj.type === 'string' || obj.type === undefined) &&
    (typeof obj.lastModified === 'number' || obj.lastModified === undefined)
  );
}

/**
 * Validates file size
 */
export function isValidFileSize(file: File | any, maxSizeMB: number = 10): boolean {
  if (!isFileObject(file)) return false;
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validates file type
 */
export function isValidFileType(file: File | any, allowedTypes: string[]): boolean {
  if (!isFileObject(file)) return false;
  
  return allowedTypes.includes(file.type || '');
}

/**
 * Validates image file
 */
export function isValidImageFile(file: File | any): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return isFileObject(file) && isValidFileType(file, allowedTypes);
}

/**
 * Validates video file
 */
export function isValidVideoFile(file: File | any): boolean {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
  return isFileObject(file) && isValidFileType(file, allowedTypes);
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  file: File | any,
  options: {
    type?: 'image' | 'video' | 'any';
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { type = 'any', maxSizeMB = 10, allowedTypes } = options;

  if (!isFileObject(file)) {
    return { valid: false, error: 'Invalid file object' };
  }

  if (!isValidFileSize(file, maxSizeMB)) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (allowedTypes && !isValidFileType(file, allowedTypes)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  if (type === 'image' && !isValidImageFile(file)) {
    return { valid: false, error: 'File must be a valid image (JPEG, PNG, WebP, GIF)' };
  }

  if (type === 'video' && !isValidVideoFile(file)) {
    return { valid: false, error: 'File must be a valid video (MP4, WebM, OGG, AVI, MOV)' };
  }

  return { valid: true };
}
