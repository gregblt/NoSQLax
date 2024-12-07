export class DocumentNotFoundError extends Error {
    public selector: Record<string, any>;
  
    constructor(selector: Record<string, any>) {
      super(`Document not found for the given criteria`);
      this.name = 'DocumentNotFindError';
      this.selector = selector;
  
      // Ensures the stack trace is correctly preserved in V8 engines
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DocumentNotFoundError);
      }
    }
  }