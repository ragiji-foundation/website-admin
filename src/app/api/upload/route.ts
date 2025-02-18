import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

console.log('Environment variables:', {
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
});

// Validate environment variables
const validateEnv = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      isValid: false,
      missing
    };
  }

  return {
    isValid: true,
    missing: []
  };
};

// Initialize S3 client
let s3: S3Client;

try {
  const envValidation = validateEnv();
  
  if (!envValidation.isValid) {
    console.error(`Missing environment variables: ${envValidation.missing.join(', ')}`);
    throw new Error('Invalid environment configuration');
  }

  s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
} catch (error) {
  console.error('Failed to initialize S3 client:', error);
}

export async function POST(request: NextRequest) {
  try {
    if (!s3) {
      return NextResponse.json(
        { error: 'S3 client not initialized' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `blog-images/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    
    });

    const result = await s3.send(command);

    if (!result) {
      throw new Error('Failed to upload to S3');
    }

    // Generate URL
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};