import { NextRequest, NextResponse } from 'next/server';
import { uploadFileFromInput, deleteFile, getBucketForFileType } from '@/lib/minio';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated (add your auth logic here)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 });
    }

    const { url, objectName } = await uploadFileFromInput(file);

    return NextResponse.json({
      success: true,
      url,
      secure_url: url, // For compatibility with existing code
      public_id: objectName,
      original_filename: file.name,
      bytes: file.size,
      format: file.type.split('/')[1],
      resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectName = searchParams.get('objectName');
    const bucketName = searchParams.get('bucket');

    if (!objectName || !bucketName) {
      return NextResponse.json({ 
        error: 'Object name and bucket name are required' 
      }, { status: 400 });
    }

    await deleteFile(bucketName, objectName);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}