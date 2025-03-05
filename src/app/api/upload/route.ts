import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

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
    let fileData: Blob | null = null;
    let fileName: string = '';
    let fileType: string = '';
    let folder = 'uploads';
    let tags = '';

    try {
      const formData = await request.formData();
      const fileEntry = formData.get('file');

      // Check if fileEntry exists and has necessary properties
      if (fileEntry &&
        typeof fileEntry === 'object' &&
        'arrayBuffer' in fileEntry &&
        typeof fileEntry.arrayBuffer === 'function' &&
        'name' in fileEntry &&
        'type' in fileEntry) {
        fileData = fileEntry as Blob;
        fileName = fileEntry.name as string;
        fileType = fileEntry.type as string;
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

    if (!fileData) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // We need to convert the Blob to a buffer that can be uploaded to Cloudinary
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the file to a base64 data URI
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${fileType};base64,${base64Data}`;

    console.log(`Processing file: ${fileName}, size: ${buffer.length} bytes`);

    // Upload to Cloudinary using the Node SDK
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        upload_preset: 'ragiji',
        resource_type: 'auto',
      } as any;

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

// This is not needed for Next.js App Router API routes
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };