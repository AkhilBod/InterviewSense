import { prisma } from '../src/lib/prisma';

async function verifyDatabaseConnection() {
  try {
    console.log('🔍 Verifying database connection...');
    console.log('Expected DB URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Get database connection info
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `;
    
    console.log('📊 Database Connection Info:', result);
    
    // List all tables to see what we have
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 Available Tables:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if our specific tables exist
    const userProgressExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserProgress'
      )
    `;
    
    console.log('🎯 UserProgress table exists:', (userProgressExists as any[])[0].exists);
    
    // Test if we can count records
    if ((userProgressExists as any[])[0].exists) {
      const count = await prisma.userProgress.count();
      console.log('✅ UserProgress records:', count);
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    console.log('🔧 Checking environment variables...');
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql://'));
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseConnection();
