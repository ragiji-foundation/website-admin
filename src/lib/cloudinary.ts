import { v2 as cloudinary } from 'cloudinary';

// Initialize the Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Define proper types for Cloudinary options
interface CloudinaryUploadOptions {
  folder: string;
  upload_preset: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  tags?: string[];
  public_id?: string;
  [key: string]: any; // Allow any additional properties that Cloudinary might accept
}

/**
 * Upload a file to Cloudinary
 * @param file The file to upload
 * @param options Upload options
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: {
    folder?: string;
    upload_preset?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    tags?: string[];
    public_id?: string;
  } = {}
) {
  try {
    // Default options with proper typing
    const uploadOptions: CloudinaryUploadOptions = {
      folder: options.folder || 'uploads',
      upload_preset: options.upload_preset || 'ragiji',
      resource_type: options.resource_type || 'auto',
    };

    // Add optional parameters
    if (options.tags && options.tags.length > 0) {
      uploadOptions.tags = options.tags; // Now TypeScript knows this property exists
    }

    if (options.public_id) {
      uploadOptions.public_id = options.public_id; // Now TypeScript knows this property exists
    }

    // Handle different input types
    let dataToUpload = file;

    // If it's a File object from the browser, convert to buffer
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString('base64');
      dataToUpload = `data:${file.type};base64,${base64Data}`;
    }

    // Perform the upload
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataToUpload as string, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
