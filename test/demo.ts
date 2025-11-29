import { mockApiCall, resetMockAttemptCount } from '../src/index';

async function runDemo() {
  console.log('🎯 EaglePoint AI Fetcher - Working Demo\n');

  // Demo 1: Show different success rates
  console.log('1. Testing Success Rates:');
  console.log('=========================');
  
  const rates = [0.9, 0.5, 0.1];
  
  for (const rate of rates) {
    console.log(`\n📊 Testing ${rate * 100}% success rate:`);
    let successCount = 0;
    
    for (let i = 0; i < 3; i++) {
      resetMockAttemptCount();
      try {
        const result = await mockApiCall({ successProbability: rate });
        successCount++;
        console.log(`   ✅ Call ${i + 1}: ${result.message}`);
      } catch (error) {
        console.log(`   ❌ Call ${i + 1}: ${(error as Error).message}`);
      }
    }
    
    console.log(`   📈 Success rate: ${successCount}/3 (${(successCount / 3 * 100).toFixed(1)}%)`);
  }

  // Demo 2: Manual retry simulation
  console.log('\n2. Manual Retry Simulation:');
  console.log('===========================');
  
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    resetMockAttemptCount();
    
    try {
      const result = await mockApiCall({ successProbability: 0.2 });
      console.log(`🎉 Success on attempt ${attempt}!`);
      console.log(`   Message: ${result.message}`);
      break;
    } catch (error) {
      console.log(`   Attempt ${attempt} failed: ${(error as Error).message}`);
      
      if (attempt <= maxRetries) {
        console.log('   ⏳ Waiting 1 second before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('   💥 All retry attempts exhausted!');
      }
    }
  }

  console.log('\n✨ Demo completed successfully!');
}

// Run the demo
runDemo().catch(console.error);