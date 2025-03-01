import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as seedData from './data';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ragijifoundation.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@ragijifoundation.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    }
  });

  // Create all seed data
  await Promise.all([
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

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
