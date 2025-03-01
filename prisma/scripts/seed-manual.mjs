import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcrypt';
import * as data from '../seed/data.mjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function manualSeed() {
  try {
    console.log('Starting manual seed...');

    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Clear existing data (optional)
    console.log('Clearing existing data...');
    try {
      const modelNames = [
        'User',
        'SuccessStory',
        'Stat',
        'Initiative',
        'Center',
        'Career',
        'Gallery',
        'NewsArticle',
        'ElectronicMedia',
        'Category',
        'Tag',
        'Banner',
        'Award',
        'Feature',
        'FeatureSection'
      ];

      for (const model of modelNames) {
        if (prisma[model.charAt(0).toLowerCase() + model.slice(1)]) {
          console.log(`Clearing ${model}...`);
          await prisma[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany();
        } else {
          console.warn(`Model ${model} not found in Prisma client`);
        }
      }
    } catch (clearError) {
      console.error('Error clearing data:', clearError);
      throw clearError;
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@ragijifoundation.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    console.log('Admin user created:', adminUser.email);

    // Create seed data sequentially to avoid any race conditions
    console.log('Creating seed data...');

    if (data.successStoriesData?.length) {
      console.log('Creating success stories...');
      await prisma.successStory.createMany({
        data: data.successStoriesData,
        skipDuplicates: true
      });
    }

    if (data.statsData?.length) {
      console.log('Creating stats...');
      await prisma.stat.createMany({
        data: data.statsData,
        skipDuplicates: true
      });
    }

    // Continue with other data in sequence
    const seedOperations = [
      { name: 'initiatives', data: data.initiativesData },
      { name: 'centers', data: data.centersData },
      { name: 'careers', data: data.careersData },
      { name: 'gallery', data: data.galleryData },
      { name: 'newsArticle', data: data.newsArticlesData },
      { name: 'electronicMedia', data: data.electronicMediaData },
      { name: 'category', data: data.categoriesData },
      { name: 'tag', data: data.tagsData },
      { name: 'banner', data: data.bannersData },
      { name: 'award', data: data.awardsData },
      { name: 'feature', data: data.featuresData },
      { name: 'featureSection', data: data.featureSectionsData }
    ];

    for (const operation of seedOperations) {
      if (operation.data?.length) {
        console.log(`Creating ${operation.name}...`);
        try {
          await prisma[operation.name].createMany({
            data: operation.data,
            skipDuplicates: true
          });
        } catch (error) {
          console.error(`Error creating ${operation.name}:`, error);
          // Continue with other operations even if one fails
        }
      }
    }

    console.log('Manual seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
manualSeed()
  .catch((error) => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  });
