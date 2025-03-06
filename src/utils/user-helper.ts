import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Gets a valid user ID for operations that require a user
 * Either returns an existing user's ID or creates a default user
 */
export async function getValidUserId(): Promise<number> {
  // First try to find any existing user
  const existingUser = await prisma.user.findFirst({
    orderBy: { id: 'asc' }
  });

  if (existingUser) {
    return existingUser.id;
  }

  // Create a default admin user if none exists
  // In a real application, you should use proper password hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);

  const newUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      role: "admin"
    }
  });

  return newUser.id;
}

/**
 * Checks if a user exists with the given ID
 */
export async function userExists(id: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  return !!user;
}
