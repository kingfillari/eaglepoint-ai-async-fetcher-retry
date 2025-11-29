/**
 * Custom error class for retry failures
 */
export class MaxRetriesError extends Error {
  public readonly lastError: Error;
  public readonly attempts: number;
  public readonly url: string;

  constructor(url: string, attempts: number, lastError: Error) {
    super(
      `Failed to fetch ${url} after ${attempts} attempts. Last error: ${lastError.message}`
    );
    this.name = 'MaxRetriesError';
    this.lastError = lastError;
    this.attempts = attempts;
    this.url = url;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MaxRetriesError);
    }
  }
}

/**
 * Error for network failures
 */
export class NetworkError extends Error {
  public readonly originalError: unknown;

  constructor(message: string, originalError: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Error for HTTP non-2xx responses
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`HTTP Error ${status}: ${statusText} for ${url}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
  }
}