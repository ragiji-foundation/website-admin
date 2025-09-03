import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, get the admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      name: 'Admin'
    }
  });

  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  // Create or update the English version of the environmental blog
  await prisma.blog.upsert({
    where: {
      slug_locale: {
        slug: 'environmental-responsibility-for-future-generations',
        locale: 'en'
      }
    },
    update: {
      content: `<p>A healthy environment is essential for a thriving community. Pollution, improper waste management, and neglect of natural resources pose serious threats to our health and future.</p>
<p>The Ragiji Foundation conducts cleanliness drives, tree planting programs, and environmental awareness sessions in schools and communities. We promote sustainable practices that conserve resources and maintain harmony with nature.</p>
<p>By teaching children the importance of environmental care today, we are sowing the seeds for a cleaner, greener, and sustainable tomorrow.</p>`,
      status: 'published',
      title: 'Environmental Responsibility for Future Generations',
      metaDescription: 'A healthy environment is essential for a thriving community. Explore how Ragiji Foundation promotes environmental responsibility through community action and education.',
      ogTitle: 'Environmental Responsibility for Future Generations | Ragiji Foundation',
      ogDescription: 'Learn about our initiatives in environmental conservation, sustainable practices, and community awareness for a cleaner, greener future.',
      authorName: 'Admin',
      authorId: adminUser.id
    },
    create: {
      slug: 'environmental-responsibility-for-future-generations',
      locale: 'en',
      content: `<p>A healthy environment is essential for a thriving community. Pollution, improper waste management, and neglect of natural resources pose serious threats to our health and future.</p>
<p>The Ragiji Foundation conducts cleanliness drives, tree planting programs, and environmental awareness sessions in schools and communities. We promote sustainable practices that conserve resources and maintain harmony with nature.</p>
<p>By teaching children the importance of environmental care today, we are sowing the seeds for a cleaner, greener, and sustainable tomorrow.</p>`,
      status: 'published',
      title: 'Environmental Responsibility for Future Generations',
      metaDescription: 'A healthy environment is essential for a thriving community. Explore how Ragiji Foundation promotes environmental responsibility through community action and education.',
      ogTitle: 'Environmental Responsibility for Future Generations | Ragiji Foundation',
      ogDescription: 'Learn about our initiatives in environmental conservation, sustainable practices, and community awareness for a cleaner, greener future.',
      authorName: 'Admin',
      authorId: adminUser.id
    }
  });

  console.log('Updated environmental blog post');
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
