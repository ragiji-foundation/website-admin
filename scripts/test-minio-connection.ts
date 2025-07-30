import { config } from 'dotenv';
import { Client } from 'minio';

// Load environment variables
config();

async function testMinioConnection() {
  try {
    console.log('🔍 Testing MinIO connection...');
    console.log(`📡 Server: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
    console.log(`🔑 Access Key: ${process.env.MINIO_ACCESS_KEY}`);
    console.log(`🔒 SSL: ${process.env.MINIO_USE_SSL}`);
    
    // Create MinIO client directly with environment variables
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    });

    console.log('📡 MinIO client created successfully');
    
    // List buckets first to test connection
    console.log('🪣 Listing buckets...');
    const buckets = await minioClient.listBuckets();
    console.log(`✅ Found ${buckets.length} buckets:`);
    
    for (const bucket of buckets) {
      console.log(`   • ${bucket.name} (created: ${bucket.creationDate})`);
    }

    // List files in ragiji-images bucket if it exists
    const ragijiBucket = buckets.find(b => b.name === 'ragiji-images');
    if (ragijiBucket) {
      console.log('\n🖼️ Listing files in ragiji-images bucket...');
      
      const objects: any[] = [];
      const stream = minioClient.listObjects('ragiji-images', '', true);
      
      await new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          objects.push(obj);
          console.log(`   📄 ${obj.name} (${obj.size} bytes, ${obj.lastModified})`);
        });
        
        stream.on('error', (err) => {
          console.error('❌ Error listing objects:', err);
          reject(err);
        });
        
        stream.on('end', () => {
          console.log(`✅ Total files found: ${objects.length}`);
          resolve(objects);
        });
      });

      // Generate seed data if we have images
      if (objects.length > 0) {
        console.log('\n🌱 SAMPLE SEED DATA URLs:');
        console.log('='.repeat(50));
        
        objects.forEach((obj, index) => {
          const url = `/api/image-proxy/ragiji-images/${obj.name}`;
          console.log(`// Image ${index + 1}: ${obj.name}`);
          console.log(`imageUrl: '${url}',\n`);
        });
      }
    } else {
      console.log('❌ ragiji-images bucket not found');
    }

  } catch (error) {
    console.error('❌ Error connecting to MinIO:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'ECONNREFUSED':
          console.log('\n💡 Connection refused. Check:');
          console.log('   1. MinIO server is running on 147.93.153.51:9000');
          console.log('   2. Port 9000 is accessible from your network');
          console.log('   3. Firewall is not blocking the connection');
          break;
        case 'ENOTFOUND':
          console.log('\n💡 Host not found. Check:');
          console.log('   1. MINIO_ENDPOINT is correct (147.93.153.51)');
          console.log('   2. DNS resolution is working');
          break;
        case 'AccessDenied':
          console.log('\n💡 Access denied. Check:');
          console.log('   1. MINIO_ACCESS_KEY and MINIO_SECRET_KEY are correct');
          console.log('   2. User has proper permissions');
          break;
        default:
          console.log(`\n💡 Error code: ${error.code}`);
      }
    }
  }
}

// Run the test
testMinioConnection();
