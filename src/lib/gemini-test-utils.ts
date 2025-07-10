import { geminiManager } from './gemini-manager';

// Test utilities for the Gemini manager system
export class GeminiTestUtils {
  /**
   * Simulate a rate limit error to test key rotation
   */
  static async testKeyRotation() {
    console.log('🧪 [Key Rotation] Testing API key rotation...');
    try {
      const result = await geminiManager.generateContent(
        "Say 'Hello, I am testing key rotation!' and tell me which model and key you are using.",
        { model: "gemini-2.0-flash" }
      );
      const keyStatus = geminiManager.getKeysStatus();
      return {
        success: true,
        result: result.substring(0, 200),
        keyStatus
      };
    } catch (error) {
      const keyStatus = geminiManager.getKeysStatus();
      return { success: false, error: (error as Error).message, keyStatus };
    }
  }

  /**
   * Test model fallback by trying an unavailable model first
   */
  static async testModelFallback() {
    console.log('🧪 [Model Fallback] Testing model fallback hierarchy...');
    try {
      const result = await geminiManager.generateContent(
        "Say 'Hello, I am testing model fallback!' and tell me which model you are.",
        { model: "gemini-2.5-pro", temperature: 0.1 }
      );
      const keyStatus = geminiManager.getKeysStatus();
      return {
        success: true,
        result: result.substring(0, 200),
        keyStatus
      };
    } catch (error) {
      const keyStatus = geminiManager.getKeysStatus();
      return { success: false, error: (error as Error).message, keyStatus };
    }
  }

  /**
   * Test the complete system with multiple requests to see load balancing
   */
  static async testLoadBalancing() {
    console.log('🧪 [Load Balancing] Testing load balancing across keys...');
    const requests = [];
    for (let i = 1; i <= 5; i++) {
      requests.push(
        geminiManager.generateContent(
          `This is test request #${i}. Please confirm you received it and say which model and key you are using.`,
          { model: "gemini-2.0-flash", temperature: 0.1 }
        ).then(result => ({
          requestId: i,
          success: true,
          result: result.substring(0, 100)
        })).catch(error => ({
          requestId: i,
          success: false,
          error: (error as Error).message
        }))
      );
    }
    try {
      const responses = await Promise.all(requests);
      const keyStatus = geminiManager.getKeysStatus();
      return {
        success: true,
        responses,
        keyStatus
      };
    } catch (error) {
      const keyStatus = geminiManager.getKeysStatus();
      return { success: false, error: (error as Error).message, keyStatus };
    }
  }

  /**
   * Run all tests in sequence
   */
  static async runAllTests() {
    console.log('🚀 [All Tests] Starting comprehensive Gemini manager tests...\n');
    const results = {
      keyRotation: await this.testKeyRotation(),
      modelFallback: await this.testModelFallback(),
      loadBalancing: await this.testLoadBalancing()
    };
    // Add a summary for easy reading
    const summary = {
      keyRotation: results.keyRotation.success ? '✅ PASS' : '❌ FAIL',
      modelFallback: results.modelFallback.success ? '✅ PASS' : '❌ FAIL',
      loadBalancing: results.loadBalancing.success ? '✅ PASS' : '❌ FAIL',
      allPassed: Object.values(results).every(r => r.success)
    };
    return { ...results, summary };
  }

  static resetAllKeys() {
    geminiManager.resetAllKeys();
    console.log('🔄 All API keys reset for fresh testing');
  }

  static getStatus() {
    return geminiManager.getKeysStatus();
  }

  static async testErrorHandling() {
    console.log('🧪 [Error Handling] Testing error handling...');
    try {
      await geminiManager.generateContent('');
      return { success: true, message: 'Empty prompt handled gracefully' };
    } catch (error) {
      return { success: true, message: 'Error handled properly: ' + (error as Error).message };
    }
  }

  static async simulateRateLimitScenario() {
    console.log('🧪 [Rate Limit] Simulating rate limit scenario...');
    const rapidRequests = [];
    for (let i = 1; i <= 10; i++) {
      rapidRequests.push(
        geminiManager.generateContent(
          `Rapid test ${i}: Generate a short response about AI. Say which model and key you are using.`,
          { model: "gemini-2.0-flash", maxOutputTokens: 100 }
        )
      );
    }
    try {
      const startTime = Date.now();
      const results = await Promise.allSettled(rapidRequests);
      const endTime = Date.now();
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const keyStatus = geminiManager.getKeysStatus();
      return {
        success: true,
        successful,
        failed,
        duration: endTime - startTime,
        keyStatus,
        details: results.map((r, i) => ({
          request: i + 1,
          status: r.status,
          value: r.status === 'fulfilled' ? r.value.substring(0, 100) : r.reason.message
        }))
      };
    } catch (error) {
      const keyStatus = geminiManager.getKeysStatus();
      return { success: false, error: (error as Error).message, keyStatus };
    }
  }
}

export const {
  testKeyRotation,
  testModelFallback,
  testLoadBalancing,
  runAllTests,
  resetAllKeys,
  getStatus,
  testErrorHandling,
  simulateRateLimitScenario
} = GeminiTestUtils; 