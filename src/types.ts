/**
 * Configuration options for the retry mechanism
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in milliseconds between retries (default: 1000) */
  baseDelay: number;
  /** Maximum delay in milliseconds for exponential backoff (default: 30000) */
  maxDelay: number;
  /** Whether to use exponential backoff (default: false) */
  exponential: boolean;
  /** Backoff multiplier for exponential strategy (default: 2) */
  backoffMultiplier: number;
  /** HTTP status codes that should trigger a retry (default: [429, 500, 502, 503, 504]) */
  retryStatusCodes: number[];
  /** Function to determine if a non-HTTP error should be retried */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponential: false,
  backoffMultiplier: 2,
  retryStatusCodes: [429, 500, 502, 503, 504]
};

/**
 * Result of a fetch operation with retry metadata
 */
export interface FetchWithRetryResult<T> {
  /** The fetched data */
  data: T;
  /** Number of attempts made */
  attempts: number;
  /** Duration of the operation in milliseconds */
  duration: number;
  /** Whether the operation succeeded on the first attempt */
  succeededOnRetry: boolean;
}