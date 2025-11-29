import { 
  fetchWithRetry, 
  createFetcher, 
  mockApiCall, 
  resetMockAttemptCount,
  MaxRetriesError 
} from '../src/index';

/**
 * Creates a mock fetch function that uses our mockApiCall
 * This simulates real fetch behavior without requiring actual HTTP requests
 */
function createMockFetch(successProbability: number = 0.3) {
  return async (url: string): Promise<Response> => {
    try {
      const result = await mockApiCall({ successProbability });
      
      // Create a mock Response object that matches the Fetch API
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        url: url,
        json: async () => result,
        text: async () => JSON.stringify(result),
        headers: new Headers(),
      } as Response;
    } catch (error) {
      // Simulate different types of HTTP errors
      const randomStatus = Math.random() > 0.5 ? 500 : 429;
      
      return {
        ok: false,
        status: randomStatus,
        statusText: error instanceof Error ? error.message : 'Unknown error',
        url: url,
        json: async () => ({ error: 'Mock API failure' }),
        text: async () => 'Mock API failure',
        headers: new Headers(),
      } as Response;
    }
  };
}

/**
 * Demonstration of the fetchWithRetry functionality with proper mocking
 */
async function demonstrateFetcher(): Promise<void> {
  console.log('🚀 Starting EaglePoint AI Async Fetcher Demo\n');

  // Test 1: Basic usage with low success probability to demonstrate retries
  console.log('1. Testing with Low Success Rate (30%):');
  console.log('='.repeat(50));
  
  // Replace global fetch with our mock for testing
  const originalFetch = global.fetch;
  (global as any).fetch = createMockFetch(0.3);
  
  resetMockAttemptCount();
  try {
    const result = await fetchWithRetry(
      'https://api.mock.com/data',
      { method: 'GET' },
      { maxRetries: 3, baseDelay: 500 }
    );
    console.log('✅ Success:', result.data);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
  } catch (error) {
    if (error instanceof MaxRetriesError) {
      console.log('❌ Expected failure after retries:', error.message);
    } else {
      console.log('❌ Unexpected error:', error);
    }
  }

  // Test 2: Using createFetcher with higher success probability
  console.log('\n2. Testing Pre-configured Fetcher (70% Success):');
  console.log('='.repeat(50));
  
  const robustFetcher = createFetcher({
    maxRetries: 3,
    baseDelay: 1000,
    exponential: true,
    backoffMultiplier: 2
  });

  (global as any).fetch = createMockFetch(0.7);
  resetMockAttemptCount();
  
  try {
    const result = await robustFetcher('https://api.robust.com/data');
    console.log('✅ Success with configured fetcher:', result.data.message);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
    console.log(`   Succeeded on retry: ${result.succeededOnRetry}`);
  } catch (error) {
    console.log('❌ Configured fetcher failed:', (error as Error).message);
  }

  // Test 3: Testing with different retry strategies
  console.log('\n3. Comparing Retry Strategies (50% Success):');
  console.log('='.repeat(50));
  
  const strategies = [
    { name: 'Fixed Delay', exponential: false, baseDelay: 1000 },
    { name: 'Exponential Backoff', exponential: true, baseDelay: 500, backoffMultiplier: 2 }
  ];

  (global as any).fetch = createMockFetch(0.5);
  
  for (const strategy of strategies) {
    console.log(`\nTesting ${strategy.name}:`);
    resetMockAttemptCount();
    
    const startTime = Date.now();
    try {
      const result = await fetchWithRetry(
        'https://api.strategy.com/test',
        {},
        { ...strategy, maxRetries: 3 }
      );
      const duration = Date.now() - startTime;
      console.log(`✅ ${strategy.name} succeeded in ${duration}ms (attempt ${result.attempts})`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${strategy.name} failed after ${duration}ms: ${(error as Error).message}`);
    }
  }

  // Test 4: Testing HTTP error retry logic
  console.log('\n4. Testing HTTP Error Retry Logic:');
  console.log('='.repeat(50));
  
  // Create a mock that only returns HTTP errors
  (global as any).fetch = async (url: string): Promise<Response> => {
    return {
      ok: false,
      status: 503, // Service Unavailable - should trigger retry
      statusText: 'Service Unavailable',
      url: url,
      json: async () => ({ error: 'Service temporarily unavailable' }),
      text: async () => 'Service temporarily unavailable',
      headers: new Headers(),
    } as Response;
  };

  resetMockAttemptCount();
  try {
    await fetchWithRetry(
      'https://api.error-test.com/data',
      {},
      { maxRetries: 2, baseDelay: 800 }
    );
    console.log('✅ Unexpected success - this should not happen');
  } catch (error) {
    if (error instanceof MaxRetriesError) {
      console.log('✅ Correctly handled HTTP errors after retries');
      console.log(`   Failed after ${error.attempts} attempts`);
    } else {
      console.log('❌ Unexpected error type:', error);
    }
  }

  // Test 5: Direct mock API testing
  console.log('\n5. Direct Mock API Testing:');
  console.log('='.repeat(50));
  
  console.log('Testing mock API with 5 calls (50% success rate):');
  for (let i = 0; i < 5; i++) {
    resetMockAttemptCount();
    try {
      const result = await mockApiCall({ successProbability: 0.5 });
      console.log(`   Call ${i + 1}: ✅ Success - ${result.message}`);
    } catch (error) {
      console.log(`   Call ${i + 1}: ❌ Failed - ${(error as Error).message}`);
    }
  }

  // Restore original fetch
  (global as any).fetch = originalFetch;

  console.log('\n🎉 Demo completed!');
}

// Run the demonstration
demonstrateFetcher().catch(console.error);