export class ValidationError extends Error {
    public details: string;
  
    constructor(details: string) {
      super(`Validation failed: ${details}`);
      this.name = 'ValidationError';
      this.details = details;
  
      // Ensures the stack trace is correctly preserved in V8 engines
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ValidationError);
      }
    }
  }
  