import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
export const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
};

export const createTestUser = async () => {
  const hashedPassword = await hashPassword(testUser.password);

  return prisma.user.create({
    data: {
      email: testUser.email,
      password: hashedPassword,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      emailVerified: true,
    },
  });
};

export const cleanupTestUser = async () => {
  try {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  } catch (e) {
    // Ignore if user doesn't exist
  }
};
