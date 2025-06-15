import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Environment check:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Test database connection
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_address
    `;
    
    console.log('📊 Connected to:', dbInfo);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 Available tables:', tables);
    
    // Test UserProgress table
    const userProgressCount = await prisma.userProgress.count();
    
    return NextResponse.json({
      success: true,
      database: (dbInfo as any[])[0],
      tables: tables,
      userProgressCount,
      message: 'Database connection working correctly!'
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        preview: process.env.DATABASE_URL?.substring(0, 50) + '...'
      }
    }, { status: 500 });
  }
}
