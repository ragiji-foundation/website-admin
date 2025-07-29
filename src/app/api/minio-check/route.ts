import { NextResponse } from 'next/server';
import { listAllFiles, BUCKETS } from '@/lib/minio';

export async function GET() {
  try {
    console.log('Checking MinIO files...');
    
    const allFiles = await listAllFiles();
    
    // Count files in each bucket
    const summary = {
      total: 0,
      buckets: {} as Record<string, number>
    };
    
    for (const [bucketName, files] of Object.entries(allFiles)) {
      summary.buckets[bucketName] = files.length;
      summary.total += files.length;
    }
    
    console.log('MinIO Summary:', summary);
    console.log('Files by bucket:', allFiles);
    
    return NextResponse.json({
      success: true,
      summary,
      files: allFiles,
      buckets: Object.values(BUCKETS)
    });
  } catch (error) {
    console.error('Error checking MinIO files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check MinIO files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
