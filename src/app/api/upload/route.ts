import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhyetvc2r',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: NextRequest) {
  try {
    // Check if formData can be parsed
    let file: File | null = null;
    let folder = 'uploads';
    let tags = '';

    try {
      const formData = await request.formData();
      const fileEntry = formData.get('file');

      // Proper type checking and casting
      if (fileEntry && fileEntry instanceof File) {
        file = fileEntry;
      } else {
        throw new Error('Invalid file format');
      }

      if (formData.has('folder')) {
        folder = formData.get('folder') as string;
      }

      if (formData.has('tags')) {
        tags = formData.get('tags') as string;
      }
    } catch (error) {
      console.error('Error parsing formData:', error);
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // We need to convert the File to a buffer that can be uploaded to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the file to a base64 data URI
    const base64Data = buffer.toString('base64');
    // Now we can safely access file.type since we've properly typed the variable
    const dataURI = `data:${file.type};base64,${base64Data}`;

    console.log(`Processing file: ${file.name}, size: ${buffer.length} bytes`);

    // Upload to Cloudinary using the Node SDK instead of direct API call
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        upload_preset: 'ragiji',
        resource_type: 'auto',
      };

      if (tags) {
        uploadOptions['tags'] = tags.split(',');
      }

      cloudinary.uploader.upload(dataURI, uploadOptions, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
          return;
        }
        resolve(result);
      });
    });

    console.log('Upload successful:', uploadResult);

    return NextResponse.json({
      url: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id,
      width: (uploadResult as any).width,
      height: (uploadResult as any).height,
      format: (uploadResult as any).format,
      resourceType: (uploadResult as any).resource_type
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};