import { NextResponse } from 'next/server';
import { minioClient } from '@/lib/minio';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Starting orphaned file cleanup...');
    
    // Get all orphaned files from database
    const orphanedFiles = await prisma.minioFile.findMany({
      where: {
        hasReference: false
      }
    });

    if (orphanedFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned files found to clean up',
        deletedCount: 0
      });
    }

    console.log(`Found ${orphanedFiles.length} orphaned files to clean up`);

    let deletedCount = 0;
    let errors: string[] = [];

    for (const file of orphanedFiles) {
      try {
        // Delete file from MinIO
        await minioClient.removeObject(file.bucketName, file.objectName);
        console.log(`Deleted from MinIO: ${file.bucketName}/${file.objectName}`);

        // Remove record from database
        await prisma.minioFile.delete({
          where: { id: file.id }
        });

        deletedCount++;
        console.log(`Cleaned up orphaned file: ${file.objectName}`);
      } catch (error) {
        const errorMsg = `Failed to delete ${file.objectName}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} orphaned files.`,
      deletedCount,
      totalOrphaned: orphanedFiles.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clean up orphaned files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to just list orphaned files without deleting
export async function GET() {
  try {
    const orphanedFiles = await prisma.minioFile.findMany({
      where: {
        hasReference: false
      },
      select: {
        id: true,
        bucketName: true,
        objectName: true,
        url: true,
        size: true,
        lastModified: true
      }
    });

    return NextResponse.json({
      success: true,
      orphanedFiles: orphanedFiles.map(f => ({
        id: f.id,
        bucketName: f.bucketName,
        objectName: f.objectName,
        url: f.url,
        size: f.size ? Number(f.size) : null, // Convert BigInt to Number
        lastModified: f.lastModified
      })),
      count: orphanedFiles.length
    });

  } catch (error) {
    console.error('Error fetching orphaned files:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orphaned files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing specific files (original functionality preserved)
export async function DELETE(request: Request) {
  try {
    const { bucketName, objectName } = await request.json();
    
    console.log(`Deleting specific file: ${bucketName}/${objectName}`);
    
    // Delete from MinIO
    await minioClient.removeObject(bucketName, objectName);
    
    // Remove from database if exists
    await prisma.minioFile.deleteMany({
      where: {
        bucketName,
        objectName
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `File ${objectName} deleted from ${bucketName}`
    });
  } catch (error) {
    console.error('Error deleting specific file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
