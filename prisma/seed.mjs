import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  successStoriesData,
  initiativesData,
  centersData,
  careersData,
  galleryData,
  newsArticlesData,
  electronicMediaData,
  categoriesData,
  tagsData,
  bannersData,
  awardsData,
  featuresData,
  featureSectionsData
} from './seed/data.js';

const prisma = new PrismaClient();

const carouselData = [
  {
    title: 'Best forests to visit in North America',
    imageUrl: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    link: '#',
    active: true,
    order: 0,
  },
  {
    title: 'Hawaii beaches review: better than you think',
    imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    link: '#',
    active: true,
    order: 1,
  },
  {
    title: 'Mountains at night: 12 best locations to enjoy the view',
    imageUrl: 'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    link: '#',
    active: true,
    order: 2,
  },
  {
    title: 'Aurora in Norway: when to visit for best experience',
    imageUrl: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    link: '#',
    active: true,
    order: 3,
  },
];

async function main() {
  console.log('Start seeding...');

  // Create admin user
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
  console.log(`Created/Updated admin user with id: ${adminUser.id}`);

  // Create categories first
  for (const categoryData of categoriesData) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData
    });
  }
  console.log(`Created ${categoriesData.length} categories`);

  // Create tags
  for (const tagData of tagsData) {
    await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: tagData,
      create: tagData
    });
  }
  console.log(`Created ${tagsData.length} tags`);

  // Create success stories
  for (const storyData of successStoriesData) {
    await prisma.successStory.upsert({
      where: { slug: storyData.slug },
      update: storyData,
      create: storyData
    });
  }
  console.log(`Created ${successStoriesData.length} success stories`);

  // Create initiatives
  for (const initiativeData of initiativesData) {
    await prisma.initiative.create({
      data: initiativeData
    });
  }
  console.log(`Created ${initiativesData.length} initiatives`);

  // Create centers
  for (const centerData of centersData) {
    await prisma.center.create({
      data: centerData
    });
  }
  console.log(`Created ${centersData.length} centers`);

  // Create careers
  for (const careerData of careersData) {
    await prisma.career.upsert({
      where: { slug: careerData.slug },
      update: careerData,
      create: careerData
    });
  }
  console.log(`Created ${careersData.length} careers`);

  // Create gallery items
  for (const galleryItem of galleryData) {
    await prisma.gallery.create({
      data: galleryItem
    });
  }
  console.log(`Created ${galleryData.length} gallery items`);

  // Create news articles
  for (const newsData of newsArticlesData) {
    await prisma.newsArticle.create({
      data: newsData
    });
  }
  console.log(`Created ${newsArticlesData.length} news articles`);

  // Create electronic media
  for (const mediaData of electronicMediaData) {
    await prisma.electronicMedia.create({
      data: mediaData
    });
  }
  console.log(`Created ${electronicMediaData.length} electronic media items`);

  // Create banners
  for (const bannerData of bannersData) {
    await prisma.banner.create({
      data: bannerData
    });
  }
  console.log(`Created ${bannersData.length} banners`);

  // Create awards
  for (const awardData of awardsData) {
    await prisma.award.create({
      data: awardData
    });
  }
  console.log(`Created ${awardsData.length} awards`);

  // Create feature sections
  for (const sectionData of featureSectionsData) {
    await prisma.featureSection.upsert({
      where: { identifier: sectionData.identifier },
      update: sectionData,
      create: sectionData
    });
  }
  console.log(`Created ${featureSectionsData.length} feature sections`);

  // Create features (convert description object to string)
  for (const featureData of featuresData) {
    const featureToCreate = {
      ...featureData,
      description: JSON.stringify(featureData.description)
    };
    await prisma.feature.create({
      data: featureToCreate
    });
  }
  console.log(`Created ${featuresData.length} features`);

  // Create carousel items
  for (const item of carouselData) {
    await prisma.carousel.create({
      data: item,
    });
  }
  console.log(`Created ${carouselData.length} carousel items`);

  // Create settings
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Ragi Ji Foundation',
      siteDescription: 'Empowering lives through education and healthcare',
      contactEmail: 'contact@ragijifoundation.com',
      socialLinks: {
        facebook: 'https://facebook.com/ragijifoundation',
        twitter: 'https://twitter.com/ragijifoundation',
        instagram: 'https://instagram.com/ragijifoundation'
      }
    }
  });
  console.log(`Created/Updated settings with id: ${settings.id}`);

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
