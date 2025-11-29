import { 
  fetchWithRetry, 
  createFetcher, 
  mockApiCall, 
  resetMockAttemptCount,
  MaxRetriesError 
} from '../src/index';

// Global fetch mock for Node.js environment
(global as any).fetch = async (url: string, options?: any): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate different responses based on URL
  if (url.includes('always-fail')) {
    throw new Error('Network failure - cannot connect');
  }
  
  if (url.includes('sometimes-fail')) {
    // 30% success rate
    if (Math.random() < 0.3) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: `Success from ${url}`,
          timestamp: new Date().toISOString(),
          attempt: resetMockAttemptCount() // This doesn't work right, but for demo
        })
      };
    } else {
      // Return HTTP error
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
    }
  }
  
  if (url.includes('slow-success')) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: `Slow success from ${url}`,
        timestamp: new Date().toISOString()
      })
    };
  }
  
  // Default success
  return {
    ok: true,
    status: 200,
    json: async () => ({
      data: `Default success from ${url}`,
      timestamp: new Date().toISOString()
    })
  };
};

async function demonstrateFetchWithRetry(): Promise<void> {
  console.log('🚀 EaglePoint AI FetchWithRetry Demo\n');

  // Test 1: Basic retry functionality
  console.log('1. Basic Retry Functionality:');
  console.log('=============================');
  
  try {
    const result = await fetchWithRetry(
      'https://api.sometimes-fail.com/data',
      { method: 'GET' },
      { 
        maxRetries: 2, 
        baseDelay: 1000,
        retryStatusCodes: [500, 502, 503]
      }
    );
    console.log('✅ Success:', result.data);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
  } catch (error) {
    if (error instanceof MaxRetriesError) {
      console.log('❌ All retries failed (expected):', error.message);
    } else {
      console.log('❌ Unexpected error:', error);
    }
  }

  // Test 2: Pre-configured fetcher with exponential backoff
  console.log('\n2. Exponential Backoff Fetcher:');
  console.log('===============================');
  
  const exponentialFetcher = createFetcher({
    maxRetries: 3,
    baseDelay: 500,
    exponential: true,
    backoffMultiplier: 2,
    retryStatusCodes: [500, 502, 503, 429]
  });

  try {
    const result = await exponentialFetcher('https://api.sometimes-fail.com/users');
    console.log('✅ Success with exponential backoff:', result.data);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
    console.log(`   Succeeded on retry: ${result.succeededOnRetry}`);
  } catch (error) {
    console.log('❌ Exponential fetcher failed:', (error as Error).message);
  }

  // Test 3: Different retry strategies comparison
  console.log('\n3. Retry Strategy Comparison:');
  console.log('=============================');
  
  const strategies = [
    { 
      name: 'Fixed Delay (1s)', 
      config: { exponential: false, baseDelay: 1000, maxRetries: 2 }
    },
    { 
      name: 'Exponential Backoff', 
      config: { exponential: true, baseDelay: 500, backoffMultiplier: 2, maxRetries: 3 }
    }
  ];

  for (const strategy of strategies) {
    console.log(`\nTesting: ${strategy.name}`);
    
    const startTime = Date.now();
    try {
      const result = await fetchWithRetry(
        'https://api.sometimes-fail.com/test',
        {},
        strategy.config
      );
      const duration = Date.now() - startTime;
      console.log(`   ✅ Succeeded in ${duration}ms (attempt ${result.attempts})`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Failed after ${duration}ms: ${(error as Error).message}`);
    }
  }

  // Test 4: Success case (reliable endpoint)
  console.log('\n4. Testing Reliable Endpoint:');
  console.log('=============================');
  
  try {
    const result = await fetchWithRetry(
      'https://api.reliable.com/data',
      {},
      { maxRetries: 2, baseDelay: 1000 }
    );
    console.log('✅ Reliable endpoint success:', result.data);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
    console.log(`   First attempt success: ${!result.succeededOnRetry}`);
  } catch (error) {
    console.log('❌ Unexpected failure:', error);
  }

  // Test 5: Custom retry logic
  console.log('\n5. Custom Retry Logic:');
  console.log('=====================');
  
  try {
    const result = await fetchWithRetry(
      'https://api.custom.com/data',
      {},
      {
        maxRetries: 2,
        baseDelay: 800,
        shouldRetry: (error: any) => {
          // Custom retry logic: only retry on specific errors
          return error?.status === 429 || error?.message?.includes('timeout');
        }
      }
    );
    console.log('✅ Custom retry logic success:', result.data);
  } catch (error) {
    console.log('❌ Custom retry logic failed:', (error as Error).message);
  }

  console.log('\n🎉 FetchWithRetry Demo Completed!');
}

// Run the demonstration
demonstrateFetchWithRetry().catch(console.error);