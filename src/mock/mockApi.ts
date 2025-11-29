/**
 * Mock API response interface
 */
export interface MockApiResponse {
  id: number;
  message: string;
  timestamp: string;
  attempt: number;
}

/**
 * Configuration for mock API behavior
 */
export interface MockApiConfig {
  /** Probability of success (0-1) */
  successProbability: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Whether to simulate random delays */
  randomDelay: boolean;
  /** Maximum delay in milliseconds */
  maxDelay: number;
}

/**
 * Default mock API configuration
 */
const DEFAULT_MOCK_CONFIG: MockApiConfig = {
  successProbability: 0.3,
  baseDelay: 100,
  randomDelay: true,
  maxDelay: 2000
};

let attemptCount = 0;

/**
 * Simulates an API call that randomly succeeds or fails
 * @param config - Mock API configuration
 * @returns Promise with mock response data
 */
export async function mockApiCall(
  config: Partial<MockApiConfig> = {}
): Promise<MockApiResponse> {
  const fullConfig: MockApiConfig = { ...DEFAULT_MOCK_CONFIG, ...config };
  attemptCount++;

  return new Promise((resolve, reject) => {
    const random = Math.random();
    const delay = fullConfig.randomDelay
      ? Math.min(fullConfig.baseDelay + Math.random() * 500, fullConfig.maxDelay)
      : fullConfig.baseDelay;

    setTimeout(() => {
      if (random < fullConfig.successProbability) {
        resolve({
          id: Date.now(),
          message: `Successfully fetched data from mock API (attempt ${attemptCount})`,
          timestamp: new Date().toISOString(),
          attempt: attemptCount
        });
      } else {
        reject(new Error(`Mock API call failed on attempt ${attemptCount} (random: ${random.toFixed(2)})`));
      }
    }, delay);
  });
}

/**
 * Resets the attempt counter for testing
 */
export function resetMockAttemptCount(): void {
  attemptCount = 0;
}