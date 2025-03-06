import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * This script creates a default admin user with ID 1
 * Run this script once using ts-node or similar to ensure
 * the blog API has a valid user to reference
 */
async function createAdminUser() {
  try {
    // Check if user with ID 1 already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 1 }
    });

    if (existingUser) {
      console.log('Admin user already exists with ID 1:', existingUser.name);
      return;
    }

    // Hash the password (use a proper password in production)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Create admin user with ID 1
    const adminUser = await prisma.user.create({
      data: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();

// To run this script:
// 1. Navigate to project root
// 2. Use: npx ts-node src/scripts/create-admin-user.ts
