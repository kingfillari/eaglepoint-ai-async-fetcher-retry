import { RetryConfig, DEFAULT_RETRY_CONFIG, FetchWithRetryResult } from './types';
import { MaxRetriesError, NetworkError, HttpError } from './errors';

/**
 * Delays execution for a specified duration
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculates the delay for the current retry attempt
 * @param attempt - Current attempt number (1-based)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  if (!config.exponential) {
    return config.baseDelay;
  }

  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(exponentialDelay, config.maxDelay);
};

/**
 * Determines if a request should be retried based on the error or response
 * @param error - The error that occurred
 * @param config - Retry configuration
 * @returns boolean indicating whether to retry
 */
const shouldRetryRequest = (error: unknown, config: RetryConfig): boolean => {
  if (error instanceof HttpError) {
    return config.retryStatusCodes.includes(error.status);
  }

  if (config.shouldRetry) {
    return config.shouldRetry(error);
  }

  // Retry on network errors by default
  return error instanceof NetworkError;
};

/**
 * Fetches data from a URL with configurable retry logic
 * @param url - The URL to fetch data from
 * @param options - Fetch options (method, headers, etc.)
 * @param retryConfig - Configuration for retry behavior
 * @returns Promise with the fetched data and retry metadata
 * @throws {MaxRetriesError} When all retry attempts fail
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<FetchWithRetryResult<T>> {
  const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt} of ${config.maxRetries + 1} to fetch ${url}`);

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, url);
      }

      const data: T = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ Successfully fetched data on attempt ${attempt} (${duration}ms)`);

      return {
        data,
        attempts: attempt,
        duration,
        succeededOnRetry: attempt > 1
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Wrap non-Error objects in NetworkError
      if (!(error instanceof Error)) {
        lastError = new NetworkError('Unknown network error', error);
      }

      // Check if we should retry
      if (attempt <= config.maxRetries && shouldRetryRequest(error, config)) {
        const retryDelay = calculateDelay(attempt, config);
        console.warn(`⚠️ Attempt ${attempt} failed: ${lastError.message}. Retrying in ${retryDelay}ms...`);
        
        await delay(retryDelay);
        continue;
      }

      // If we shouldn't retry or we're out of retries, break
      break;
    }
  }

  const duration = Date.now() - startTime;
  console.error(`❌ All ${config.maxRetries} retry attempts failed for ${url} (${duration}ms)`);
  
  throw new MaxRetriesError(url, config.maxRetries + 1, lastError!);
}

/**
 * Creates a pre-configured fetcher with specific retry settings
 * @param defaultConfig - Default retry configuration
 * @returns Configured fetch function
 */
export function createFetcher<T = any>(defaultConfig: Partial<RetryConfig> = {}) {
  return (url: string, options?: RequestInit, retryConfig?: Partial<RetryConfig>) =>
    fetchWithRetry<T>(url, options, { ...defaultConfig, ...retryConfig });
}