// check-user-schema.js
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Try to query a user with the credits field
    const users = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    console.log('User table columns:', users);
    
    // Also try to get an actual user with credits
    const firstUser = await prisma.user.findFirst();
    console.log('User object keys:', Object.keys(firstUser || {}));
    console.log('First user data:', firstUser);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
