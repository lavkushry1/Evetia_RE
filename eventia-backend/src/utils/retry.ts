import logger from '../services/logger.service';

/**
 * A generic retry function that will attempt to execute a given function multiple times
 * with a delay between attempts if it fails.
 * 
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param delayMs Delay in milliseconds between retries
 * @returns The result of the successful function call
 * @throws The last error encountered if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(
        `Attempt ${attempt}/${maxRetries} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
} 