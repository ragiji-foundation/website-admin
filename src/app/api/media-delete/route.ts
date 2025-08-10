import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    // Remove "/api/image-proxy/" prefix and get actual file path
    const imagePath = url.replace('/api/image-proxy/', '');
    const filePath = path.join(process.cwd(), 'public', imagePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (err) {
    console.error('Error deleting image:', err);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
    
