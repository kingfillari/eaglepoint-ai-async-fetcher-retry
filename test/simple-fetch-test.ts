import { 
  fetchWithRetry, 
  createFetcher, 
  MaxRetriesError 
} from '../src/index';

// Simple fetch mock that works reliably
function createSimpleMockFetch(successOnAttempt: number = 2) {
  let attemptCount = 0;
  
  return async (url: string): Promise<any> => {
    attemptCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log(`   Mock fetch attempt ${attemptCount} for ${url}`);
    
    if (attemptCount < successOnAttempt) {
      // Simulate HTTP error
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
    } else {
      // Success
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: `Success on attempt ${attemptCount}`,
          url: url,
          timestamp: new Date().toISOString()
        })
      };
    }
  };
}

async function simpleFetchTest(): Promise<void> {
  console.log('🎯 Simple FetchWithRetry Test\n');

  // Test 1: Success on second attempt
  console.log('1. Success on Second Attempt:');
  console.log('=============================');
  
  (global as any).fetch = createSimpleMockFetch(2);
  
  try {
    const result = await fetchWithRetry(
      'https://api.test.com/data',
      {},
      { maxRetries: 3, baseDelay: 500 }
    );
    console.log('✅ Success:', result.data);
    console.log(`   Attempts: ${result.attempts}, Retry Success: ${result.succeededOnRetry}`);
  } catch (error) {
    console.log('❌ Unexpected failure:', error);
  }

  // Test 2: All retries fail
  console.log('\n2. All Retries Fail:');
  console.log('===================');
  
  (global as any).fetch = createSimpleMockFetch(5); // Will never succeed within retry limit
  
  try {
    await fetchWithRetry(
      'https://api.failing.com/data',
      {},
      { maxRetries: 2, baseDelay: 300 }
    );
    console.log('❌ Unexpected success - should have failed');
  } catch (error) {
    if (error instanceof MaxRetriesError) {
      console.log('✅ Correctly failed after all retries');
      console.log(`   Attempts: ${error.attempts}, Last error: ${error.lastError.message}`);
    } else {
      console.log('❌ Wrong error type:', error);
    }
  }

  // Test 3: Pre-configured fetcher
  console.log('\n3. Pre-configured Fetcher:');
  console.log('=========================');
  
  const robustFetcher = createFetcher({
    maxRetries: 4,
    baseDelay: 1000,
    exponential: true
  });

  (global as any).fetch = createSimpleMockFetch(3);
  
  try {
    const result = await robustFetcher('https://api.robust.com/users');
    console.log('✅ Robust fetcher success:', result.data);
    console.log(`   Attempts: ${result.attempts}, Duration: ${result.duration}ms`);
  } catch (error) {
    console.log('❌ Robust fetcher failed:', (error as Error).message);
  }

  console.log('\n✨ Simple Fetch Test Completed!');
}

// Run the test
simpleFetchTest().catch(console.error);