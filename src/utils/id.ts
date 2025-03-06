/**
 * Generates a unique ID with a specified prefix
 * 
 * @param prefix Optional prefix for the ID
 * @returns A string ID in the format "prefix_randomString"
 */
export function generateId(prefix = ''): string {
  // Create a timestamp component (high precision)
  const timestamp = Date.now().toString(36);

  // Create a random component
  const randomPart = Math.random().toString(36).substring(2, 10);

  // Combine with optional prefix
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Checks if a string is a valid UUID format
 * 
 * @param id The string to check
 * @returns boolean indicating if string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

/**
 * Generates a RFC4122 compliant UUID v4
 * 
 * @returns A UUID v4 string
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
