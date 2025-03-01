import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Sample content' }]
    }
  ]
};

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

  // Create success stories
  const successStories = await prisma.successStory.createMany({
    data: [
      {
        title: "From Street to Success: Ravi's Journey",
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Once a child laborer, Ravi is now pursuing his dreams.' }
              ]
            }
          ]
        },
        personName: 'Ravi Kumar',
        location: 'Delhi',
        imageUrl: '/success-stories/ravi.jpg',
        featured: true,
        order: 1
      },
      {
        title: "Empowering Women: Priya's Story",
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Through skill development, Priya started her own business.' }
              ]
            }
          ]
        },
        personName: 'Priya Singh',
        location: 'Mumbai',
        imageUrl: '/success-stories/priya.jpg',
        featured: true,
        order: 2
      }
    ],
    skipDuplicates: true
  });

  // Create stats
  const stats = await prisma.stat.createMany({
    data: [
      {
        label: 'Children Educated',
        value: '5000+',
        icon: 'school',
        order: 1
      },
      {
        label: 'Communities Served',
        value: '100+',
        icon: 'community',
        order: 2
      },
      {
        label: 'Success Stories',
        value: '1000+',
        icon: 'heart',
        order: 3
      }
    ],
    skipDuplicates: true
  });

  // Create features
  const features = await prisma.feature.createMany({
    data: [
      {
        title: 'Education For All',
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Providing quality education to underprivileged children.' }
              ]
            }
          ]
        },
        mediaType: 'image',
        mediaUrl: '/features/education.jpg',
        section: 'core-programs',
        order: 1
      },
      {
        title: 'Women Empowerment',
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Empowering women through skill development.' }
              ]
            }
          ]
        },
        mediaType: 'image',
        mediaUrl: '/features/women.jpg',
        section: 'core-programs',
        order: 2
      }
    ],
    skipDuplicates: true
  });

  // Create feature sections
  const featureSections = await prisma.featureSection.createMany({
    data: [
      {
        identifier: 'core-programs',
        heading: 'Our Core Programs',
        ctaText: 'Support Our Cause',
        ctaUrl: '/donate'
      }
    ],
    skipDuplicates: true
  });

  // Create settings
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Ragi Ji Foundation',
      siteDescription: 'Empowering Lives Through Education',
      contactEmail: 'contact@ragijifoundation.com',
      socialLinks: {
        facebook: 'https://facebook.com/ragijifoundation',
        twitter: 'https://twitter.com/ragijifoundation',
        instagram: 'https://instagram.com/ragijifoundation'
      }
    }
  });

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
