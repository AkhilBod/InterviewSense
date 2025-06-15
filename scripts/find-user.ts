import { prisma } from '../src/lib/prisma';

async function findUserId() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true
      }
    });

    console.log('Available users:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUserId();
