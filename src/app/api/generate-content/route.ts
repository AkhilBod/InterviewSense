import { NextRequest, NextResponse } from 'next/server';
import { ContentManager } from '@/lib/content-manager';
import { join } from 'path';

/**
 * API Route for Content Generation
 * Provides programmatic access to the content generation system
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      outputDir = join(process.cwd(), 'generated-content'),
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      batchSize = 50,
      generateSitemap = true,
      generateIndex = true
    } = body;

    console.log('🚀 Starting API content generation...');

    const contentManager = new ContentManager({
      baseUrl,
      defaultImage: `${baseUrl}/og-image.png`,
      companyName: 'InterviewSense'
    });

    const stats = await contentManager.generateAllContent({
      outputDir,
      seoConfig: {
        baseUrl,
        defaultImage: `${baseUrl}/og-image.png`,
        companyName: 'InterviewSense'
      },
      generateSitemap,
      generateIndex,
      batchSize
    });

    return NextResponse.json({
      success: true,
      stats,
      message: 'Content generation completed successfully'
    });

  } catch (error) {
    console.error('❌ API content generation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Content generation failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outputDir = searchParams.get('outputDir') || join(process.cwd(), 'generated-content');

    const contentManager = new ContentManager({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      defaultImage: '/og-image.png',
      companyName: 'InterviewSense'
    });

    // Get latest data and statistics
    const latestData = await contentManager.getLatestData(outputDir);
    const generatedArticles = await contentManager.getGeneratedArticles(outputDir);

    if (!latestData) {
      return NextResponse.json({
        success: false,
        message: 'No generated content found. Run content generation first.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        lastUpdated: latestData.lastUpdated,
        totalListings: latestData.totalListings,
        activeListings: latestData.activeListings,
        categories: latestData.categories,
        generatedArticles: generatedArticles.length
      }
    });

  } catch (error) {
    console.error('❌ API status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to get content status'
    }, { status: 500 });
  }
}
