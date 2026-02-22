import { prisma } from './src/lib/prisma';

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'akkiisan9@gmail.com' }
    });
    
    console.log('User found:', {
      id: user?.id,
      email: user?.email,
      questionnaireCompleted: (user as any)?.questionnaireCompleted,
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
