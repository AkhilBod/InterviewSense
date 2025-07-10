import { NextRequest, NextResponse } from 'next/server';
import { GeminiTestUtils } from '@/lib/gemini-test-utils';
import { geminiManager } from '@/lib/gemini-manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'status';

  try {
    switch (testType) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            keyStatus: geminiManager.getKeysStatus(),
            timestamp: new Date().toISOString()
          }
        });

      case 'rotation':
        const rotationResult = await GeminiTestUtils.testKeyRotation();
        return NextResponse.json({
          success: true,
          test: 'Key Rotation',
          data: rotationResult,
          keyStatus: geminiManager.getKeysStatus()
        });

      case 'fallback':
        const fallbackResult = await GeminiTestUtils.testModelFallback();
        return NextResponse.json({
          success: true,
          test: 'Model Fallback',
          data: fallbackResult,
          keyStatus: geminiManager.getKeysStatus()
        });

      case 'load':
        const loadResult = await GeminiTestUtils.testLoadBalancing();
        return NextResponse.json({
          success: true,
          test: 'Load Balancing',
          data: loadResult,
          keyStatus: geminiManager.getKeysStatus()
        });

      case 'ratelimit':
        const rateLimitResult = await GeminiTestUtils.simulateRateLimitScenario();
        return NextResponse.json({
          success: true,
          test: 'Rate Limit Simulation',
          data: rateLimitResult,
          keyStatus: geminiManager.getKeysStatus()
        });

      case 'all':
        const allResults = await GeminiTestUtils.runAllTests();
        return NextResponse.json({
          success: true,
          test: 'All Tests',
          data: allResults,
          keyStatus: geminiManager.getKeysStatus()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type',
          availableTests: ['status', 'rotation', 'fallback', 'load', 'ratelimit', 'all']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      keyStatus: geminiManager.getKeysStatus()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, options } = body;

    switch (action) {
      case 'reset':
        geminiManager.resetAllKeys();
        return NextResponse.json({
          success: true,
          message: 'All API keys reset',
          keyStatus: geminiManager.getKeysStatus()
        });

      case 'test-request':
        if (!prompt) {
          return NextResponse.json({
            success: false,
            error: 'Prompt is required for test request'
          }, { status: 400 });
        }

        const result = await geminiManager.generateContent(
          prompt,
          options || { model: "gemini-2.0-flash" }
        );

        return NextResponse.json({
          success: true,
          result: result.substring(0, 500) + (result.length > 500 ? '...' : ''),
          fullLength: result.length,
          keyStatus: geminiManager.getKeysStatus()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['reset', 'test-request']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Test API POST error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      keyStatus: geminiManager.getKeysStatus()
    }, { status: 500 });
  }
} 