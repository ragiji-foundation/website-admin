import { PrismaClient } from '@prisma/client';

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
  console.log('Start seeding carousel data...');

  for (const item of carouselData) {
    const carousel = await prisma.carousel.create({
      data: item,
    });
    console.log(`Created carousel item with id: ${carousel.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
