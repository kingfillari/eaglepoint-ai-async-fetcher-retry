import { 
  mockApiCall, 
  resetMockAttemptCount 
} from '../src/index';

/**
 * Simple demonstration using only the mock API
 */
async function simpleDemo(): Promise<void> {
  console.log('🚀 Simple EaglePoint AI Fetcher Demo\n');

  // Test the mock API directly
  console.log('1. Testing Mock API with different success rates:');
  console.log('='.repeat(50));
  
  const testCases = [
    { probability: 0.8, name: 'High Success' },
    { probability: 0.5, name: 'Medium Success' },
    { probability: 0.2, name: 'Low Success' }
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.name} (${testCase.probability * 100}% success rate):`);
    
    let successes = 0;
    let failures = 0;
    
    for (let i = 0; i < 5; i++) {
      resetMockAttemptCount();
      try {
        const result = await mockApiCall({ successProbability: testCase.probability });
        successes++;
        if (i === 0) console.log(`   Example success: ${result.message}`);
      } catch (error) {
        failures++;
        if (i === 0) console.log(`   Example failure: ${(error as Error).message}`);
      }
    }
    
    console.log(`   Results: ${successes} ✅ successes, ${failures} ❌ failures`);
  }

  console.log('\n2. Testing Retry Logic with Mock API:');
  console.log('='.repeat(50));
  
  // Simulate retry logic manually using the mock API
  const maxRetries = 3;
  let attempt = 1;
  
  while (attempt <= maxRetries + 1) {
    console.log(`\nAttempt ${attempt} of ${maxRetries + 1}:`);
    
    try {
      const result = await mockApiCall({ successProbability: 0.3 });
      console.log(`✅ Success on attempt ${attempt}: ${result.message}`);
      break;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${(error as Error).message}`);
      
      if (attempt <= maxRetries) {
        console.log('⏳ Waiting 1 second before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempt++;
      } else {
        console.log(`💥 All ${maxRetries} retry attempts failed!`);
        break;
      }
    }
  }

  console.log('\n🎉 Simple demo completed!');
}

// Run the simple demonstration
simpleDemo().catch(console.error);