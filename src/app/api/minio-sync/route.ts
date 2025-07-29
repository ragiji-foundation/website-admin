import { NextResponse } from 'next/server';
import { listAllFiles } from '@/lib/minio';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Starting MinIO file scan and database sync...');
    
    // Get all files from MinIO
    const allFiles = await listAllFiles();
    
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    
    for (const [bucketName, files] of Object.entries(allFiles)) {
      console.log(`Processing ${files.length} files from bucket: ${bucketName}`);
      
      for (const file of files) {
        totalProcessed++;
        
        // Check if this file already exists in database
        const existingFile = await prisma.minioFile.findUnique({
          where: {
            bucketName_objectName: {
              bucketName,
              objectName: file.name
            }
          }
        });
        
        const fileData = {
          bucketName,
          objectName: file.name,
          originalName: file.name.split('-').slice(1).join('-'), // Remove timestamp prefix
          url: `/api/image-proxy/${bucketName}/${file.name}`,
          contentType: getContentTypeFromFileName(file.name),
          size: BigInt(file.size || 0),
          etag: file.etag || null,
          lastModified: file.lastModified || null,
          hasReference: false, // Mark as no reference initially, we'll check references later
        };
        
        if (existingFile) {
          // Update existing record
          await prisma.minioFile.update({
            where: { id: existingFile.id },
            data: fileData
          });
          totalUpdated++;
        } else {
          // Insert new record
          await prisma.minioFile.create({
            data: fileData
          });
          totalInserted++;
        }
      }
    }
    
    // Now check for references in carousel table
    await updateFileReferences();
    
    // Get orphaned files
    const orphanedFiles = await prisma.minioFile.findMany({
      where: { hasReference: false }
    });
    
    console.log(`MinIO scan complete. Processed: ${totalProcessed}, Inserted: ${totalInserted}, Updated: ${totalUpdated}, Orphaned: ${orphanedFiles.length}`);
    
    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed,
        totalInserted,
        totalUpdated,
        orphanedCount: orphanedFiles.length
      },
      orphanedFiles: orphanedFiles.map(f => ({
        id: f.id,
        bucket: f.bucketName,
        name: f.objectName,
        url: f.url,
        size: Number(f.size),
        lastModified: f.lastModified
      }))
    });
    
  } catch (error) {
    console.error('Error scanning MinIO files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scan MinIO files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function updateFileReferences() {
  // Check carousel references
  const carouselItems = await prisma.carousel.findMany({
    select: { id: true, imageUrl: true, videoUrl: true }
  });
  
  for (const item of carouselItems) {
    // Check image URL
    if (item.imageUrl) {
      const imagePath = item.imageUrl.replace('/api/image-proxy/', '');
      const [bucketName, objectName] = imagePath.split('/', 2);
      
      if (bucketName && objectName) {
        await prisma.minioFile.updateMany({
          where: {
            bucketName: decodeURIComponent(bucketName),
            objectName: decodeURIComponent(objectName)
          },
          data: {
            referencedBy: 'carousel',
            referenceId: item.id.toString(),
            hasReference: true
          }
        });
      }
    }
    
    // Check video URL
    if (item.videoUrl) {
      const videoPath = item.videoUrl.replace('/api/image-proxy/', '');
      const [bucketName, objectName] = videoPath.split('/', 2);
      
      if (bucketName && objectName) {
        await prisma.minioFile.updateMany({
          where: {
            bucketName: decodeURIComponent(bucketName),
            objectName: decodeURIComponent(objectName)
          },
          data: {
            referencedBy: 'carousel',
            referenceId: item.id.toString(),
            hasReference: true
          }
        });
      }
    }
  }
  
  // Check references in all tables that use file URLs
  await checkElectronicMediaReferences();
  await checkNewsArticleReferences();
  await checkInitiativeReferences();
  await checkCenterReferences();
  await checkGalleryReferences();
  await checkSettingsReferences();
  await checkBannerReferences();
  await checkAwardReferences();
  await checkFeatureReferences();
  await checkSuccessStoryReferences();
  await checkTheNeedReferences();
  await checkOurModelReferences();
  await checkPageContentReferences();
}

// Helper function to update file references
async function updateFileReference(url: string, tableName: string, recordId: string) {
  if (!url || !url.includes('/api/image-proxy/')) return;
  
  const imagePath = url.replace('/api/image-proxy/', '');
  const [bucketName, objectName] = imagePath.split('/', 2);
  
  if (bucketName && objectName) {
    await prisma.minioFile.updateMany({
      where: {
        bucketName: decodeURIComponent(bucketName),
        objectName: decodeURIComponent(objectName)
      },
      data: {
        referencedBy: tableName,
        referenceId: recordId,
        hasReference: true
      }
    });
  }
}

// Check ElectronicMedia table references
async function checkElectronicMediaReferences() {
  const mediaItems = await prisma.electronicMedia.findMany({
    select: { id: true, videoUrl: true, thumbnail: true }
  });
  
  for (const item of mediaItems) {
    if (item.videoUrl) {
      await updateFileReference(item.videoUrl, 'electronicMedia', item.id.toString());
    }
    if (item.thumbnail) {
      await updateFileReference(item.thumbnail, 'electronicMedia', item.id.toString());
    }
  }
}

// Check NewsArticle table references
async function checkNewsArticleReferences() {
  const articles = await prisma.newsArticle.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const article of articles) {
    if (article.imageUrl) {
      await updateFileReference(article.imageUrl, 'newsArticle', article.id.toString());
    }
  }
}

// Check Initiative table references
async function checkInitiativeReferences() {
  const initiatives = await prisma.initiative.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const initiative of initiatives) {
    if (initiative.imageUrl) {
      await updateFileReference(initiative.imageUrl, 'initiative', initiative.id.toString());
    }
  }
}

// Check Center table references
async function checkCenterReferences() {
  const centers = await prisma.center.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const center of centers) {
    if (center.imageUrl) {
      await updateFileReference(center.imageUrl, 'center', center.id.toString());
    }
  }
}

// Check Gallery table references
async function checkGalleryReferences() {
  const galleryItems = await prisma.gallery.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const item of galleryItems) {
    if (item.imageUrl) {
      await updateFileReference(item.imageUrl, 'gallery', item.id.toString());
    }
  }
}

// Check Settings table references
async function checkSettingsReferences() {
  const settings = await prisma.settings.findMany({
    select: { id: true, logoUrl: true }
  });
  
  for (const setting of settings) {
    if (setting.logoUrl) {
      await updateFileReference(setting.logoUrl, 'settings', setting.id.toString());
    }
  }
}

// Check Banner table references
async function checkBannerReferences() {
  const banners = await prisma.banner.findMany({
    select: { id: true, backgroundImage: true }
  });
  
  for (const banner of banners) {
    if (banner.backgroundImage) {
      await updateFileReference(banner.backgroundImage, 'banner', banner.id);
    }
  }
}

// Check Award table references
async function checkAwardReferences() {
  const awards = await prisma.award.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const award of awards) {
    if (award.imageUrl) {
      await updateFileReference(award.imageUrl, 'award', award.id);
    }
  }
}

// Check Feature table references
async function checkFeatureReferences() {
  const features = await prisma.feature.findMany({
    select: { id: true, mediaUrl: true, thumbnail: true }
  });
  
  for (const feature of features) {
    if (feature.mediaUrl) {
      await updateFileReference(feature.mediaUrl, 'feature', feature.id);
    }
    if (feature.thumbnail) {
      await updateFileReference(feature.thumbnail, 'feature', feature.id);
    }
  }
}

// Check SuccessStory table references
async function checkSuccessStoryReferences() {
  const stories = await prisma.successStory.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const story of stories) {
    if (story.imageUrl) {
      await updateFileReference(story.imageUrl, 'successStory', story.id);
    }
  }
}

// Check TheNeed table references
async function checkTheNeedReferences() {
  const needItems = await prisma.theNeed.findMany({
    select: { id: true, imageUrl: true, statsImageUrl: true }
  });
  
  for (const item of needItems) {
    if (item.imageUrl) {
      await updateFileReference(item.imageUrl, 'theNeed', item.id);
    }
    if (item.statsImageUrl) {
      await updateFileReference(item.statsImageUrl, 'theNeed', item.id);
    }
  }
}

// Check OurModel table references
async function checkOurModelReferences() {
  const models = await prisma.ourModel.findMany({
    select: { id: true, imageUrl: true }
  });
  
  for (const model of models) {
    if (model.imageUrl) {
      await updateFileReference(model.imageUrl, 'ourModel', model.id);
    }
  }
}

// Check PageContent table references (for mediaUrl field)
async function checkPageContentReferences() {
  const pageContents = await prisma.pageContent.findMany({
    select: { id: true, mediaUrl: true }
  });
  
  for (const content of pageContents) {
    if (content.mediaUrl) {
      await updateFileReference(content.mediaUrl, 'pageContent', content.id);
    }
  }
}

function getContentTypeFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
