import { config } from 'dotenv';
import { minioClient, BUCKETS, listAllFiles } from '../src/lib/minio';

// Load environment variables from .env file
config();

async function listMinioImages() {
  try {
    console.log('🔍 Connecting to MinIO server...');
    console.log(`📡 Server: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
    console.log(`🔑 Access Key: ${process.env.MINIO_ACCESS_KEY}`);
    console.log(`🔒 SSL: ${process.env.MINIO_USE_SSL}`);
    console.log('🔍 Listing images...');
    
    // List all files in all buckets
    const allFiles = await listAllFiles();
    
    console.log('\n📦 MinIO Buckets Content:');
    console.log('='.repeat(50));
    
    for (const [bucketName, files] of Object.entries(allFiles)) {
      console.log(`\n🪣 ${bucketName.toUpperCase()} (${files.length} files)`);
      console.log('-'.repeat(30));
      
      if (files.length === 0) {
        console.log('  (No files found)');
      } else {
        files.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (${file.size} bytes, ${file.lastModified})`);
        });
      }
    }
    
    // Focus on images bucket
    const imageFiles = allFiles[BUCKETS.IMAGES] || [];
    console.log(`\n🖼️  IMAGES FOR SEED FILE (${imageFiles.length} total):`);
    console.log('='.repeat(50));
    
    if (imageFiles.length === 0) {
      console.log('❌ No images found in MinIO bucket!');
      console.log('💡 You may need to upload some sample images first.');
    } else {
      // Categorize images for seed file
      const categorizedImages = {
        successStories: imageFiles.filter(f => f.name.includes('success') || f.name.includes('story')),
        initiatives: imageFiles.filter(f => f.name.includes('initiative') || f.name.includes('program')),
        centers: imageFiles.filter(f => f.name.includes('center') || f.name.includes('location')),
        awards: imageFiles.filter(f => f.name.includes('award') || f.name.includes('trophy')),
        gallery: imageFiles.filter(f => f.name.includes('gallery') || f.name.includes('event')),
        banners: imageFiles.filter(f => f.name.includes('banner') || f.name.includes('hero')),
        features: imageFiles.filter(f => f.name.includes('feature')),
        general: imageFiles.filter(f => 
          !f.name.includes('success') && !f.name.includes('story') &&
          !f.name.includes('initiative') && !f.name.includes('program') &&
          !f.name.includes('center') && !f.name.includes('location') &&
          !f.name.includes('award') && !f.name.includes('trophy') &&
          !f.name.includes('gallery') && !f.name.includes('event') &&
          !f.name.includes('banner') && !f.name.includes('hero') &&
          !f.name.includes('feature')
        )
      };
      
      for (const [category, files] of Object.entries(categorizedImages)) {
        if (files.length > 0) {
          console.log(`\n📁 ${category.toUpperCase()}:`);
          files.forEach(file => {
            const url = `/api/image-proxy/${BUCKETS.IMAGES}/${file.name}`;
            console.log(`  • ${file.name} → ${url}`);
          });
        }
      }
      
      // Generate seed data format
      console.log('\n🌱 SEED DATA FORMAT:');
      console.log('='.repeat(50));
      console.log('// Add these URLs to your seed-consolidated.ts file:');
      console.log('const imageUrls = {');
      
      for (const [category, files] of Object.entries(categorizedImages)) {
        if (files.length > 0) {
          console.log(`  ${category}: [`);
          files.forEach(file => {
            const url = `/api/image-proxy/${BUCKETS.IMAGES}/${file.name}`;
            console.log(`    '${url}',`);
          });
          console.log('  ],');
        }
      }
      
      console.log('};');
    }
    
  } catch (error) {
    console.error('❌ Error listing MinIO images:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if MinIO server is running');
    console.log('2. Verify MinIO credentials in .env file');
    console.log('3. Ensure buckets are created and accessible');
  }
}

// Run the script
listMinioImages();
