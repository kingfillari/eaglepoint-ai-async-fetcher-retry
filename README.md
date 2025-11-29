# EaglePoint AI Async Fetcher with Retry with typescript

A robust, production-ready TypeScript library for fetching data with configurable retry logic, exponential backoff, and comprehensive error handling.

## Features

- 🔄 **Configurable Retry Logic**: Fixed delay or exponential backoff
- 🛡️ **TypeScript First**: Full type safety and IntelliSense support
- 🎯 **Smart Retry Detection**: Automatic retry on specific HTTP status codes
- 📊 **Metadata Tracking**: Get attempt counts, durations, and success metrics
- 🧪 **Mock API Included**: Comprehensive testing utilities
- 🚀 **Production Ready**: Error handling, logging, and performance optimizations

## Installation

***bash
npm install eaglepoint-ai-async-fetcher-retry
Quick Start
typescript
import { fetchWithRetry } from 'eaglepoint-ai-async-fetcher-retry';

// Basic usage
const result = await fetchWithRetry('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
}, {
  maxRetries: 3,
  baseDelay: 1000
});

console.log(result.data); // Your fetched data
console.log(result.attempts); // Number of attempts made
console.log(result.duration); // Total duration in ms
Advanced Usage
Pre-configured Fetcher
typescript
import { createFetcher } from 'eaglepoint-ai-async-fetcher-retry';

const apiFetcher = createFetcher({
  maxRetries: 5,
  exponential: true,
  baseDelay: 1000,
  backoffMultiplier: 2,
  retryStatusCodes: [429, 500, 502, 503, 504]
});

const result = await apiFetcher('https://api.example.com/users');
Custom Retry Logic
typescript
const result = await fetchWithRetry('https://api.example.com/data', {}, {
  maxRetries: 3,
  shouldRetry: (error) => {
    // Custom retry logic
    return error.message.includes('timeout') || error.status === 429;
  }
});
API Reference
fetchWithRetry(url, options?, retryConfig?)
Fetches data from a URL with retry logic.

createFetcher(defaultConfig)
Creates a pre-configured fetcher instance.

RetryConfig Options
maxRetries: Maximum retry attempts (default: 3)

baseDelay: Base delay between retries in ms (default: 1000)

exponential: Use exponential backoff (default: false)

backoffMultiplier: Multiplier for exponential backoff (default: 2)

retryStatusCodes: HTTP status codes that trigger retry (default: [429, 500, 502, 503, 504])

shouldRetry: Custom function to determine retry behavior

Error Handling
The library provides custom error classes for better error management:

MaxRetriesError: When all retry attempts fail

HttpError: For non-2xx HTTP responses

NetworkError: For network-related failures

typescript
try {
  await fetchWithRetry('https://api.example.com/data');
} catch (error) {
  if (error instanceof MaxRetriesError) {
    console.log(`Failed after ${error.attempts} attempts`);
    console.log(`Last error: ${error.lastError.message}`);
  }
}
Testing
typescript
import { mockApiCall, resetMockAttemptCount } from 'eaglepoint-ai-async-fetcher-retry';

// Test with mock API
const result = await mockApiCall({ successProbability: 0.5 });
License
MIT

text

### LICENSE
***text
MIT License

Copyright (c) 2025 EaglePoint AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


.gitignore
gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# TypeScript
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
🚀 Usage Instructions
Install dependencies:

bash
npm install
Build the project:

bash
npm run build
Run tests:

bash
npm run test
Develop with hot reload:

bash
npm run dev

This TypeScript project provides a comprehensive, production-ready solution for async data fetching with retry logic, featuring excellent TypeScript support, comprehensive error handling, and extensive configuration options.

