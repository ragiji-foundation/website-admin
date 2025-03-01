import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as seedData from '../seed/data';

const prisma = new PrismaClient();

async function manualSeed() {
  try {
    console.log('Starting manual seed...');

    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.successStory.deleteMany(),
      prisma.stat.deleteMany(),
      prisma.initiative.deleteMany(),
      prisma.center.deleteMany(),
      prisma.career.deleteMany(),
      prisma.gallery.deleteMany(),
      prisma.newsArticle.deleteMany(),
      prisma.electronicMedia.deleteMany(),
      prisma.category.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.banner.deleteMany(),
      prisma.award.deleteMany(),
      prisma.feature.deleteMany(),
      prisma.featureSection.deleteMany(),
    ]);

    // Your existing seed logic
    console.log('Creating admin user...');
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@ragijifoundation.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });

    console.log('Creating other data...');
    await Promise.all([
      prisma.successStory.createMany({
        data: seedData.successStoriesData,
        skipDuplicates: true
      }),
      prisma.successStory.createMany({
        data: seedData.successStoriesData,
        skipDuplicates: true
      }),
      prisma.stat.createMany({
        data: seedData.statsData,
        skipDuplicates: true
      }),
      prisma.initiative.createMany({
        data: seedData.initiativesData,
        skipDuplicates: true
      }),
      prisma.center.createMany({
        data: seedData.centersData,
        skipDuplicates: true
      }),
      prisma.career.createMany({
        data: seedData.careersData,
        skipDuplicates: true
      }),
      prisma.gallery.createMany({
        data: seedData.galleryData,
        skipDuplicates: true
      }),
      prisma.newsArticle.createMany({
        data: seedData.newsArticlesData,
        skipDuplicates: true
      }),
      prisma.electronicMedia.createMany({
        data: seedData.electronicMediaData,
        skipDuplicates: true
      }),
      prisma.category.createMany({
        data: seedData.categoriesData,
        skipDuplicates: true
      }),
      prisma.tag.createMany({
        data: seedData.tagsData,
        skipDuplicates: true
      }),
      prisma.banner.createMany({
        data: seedData.bannersData,
        skipDuplicates: true
      }),
      prisma.award.createMany({
        data: seedData.awardsData,
        skipDuplicates: true
      }),
      prisma.feature.createMany({
        data: seedData.featuresData,
        skipDuplicates: true
      }),
      prisma.featureSection.createMany({
        data: seedData.featureSectionsData,
        skipDuplicates: true
      })

    ]);

    console.log('Manual seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
manualSeed();
