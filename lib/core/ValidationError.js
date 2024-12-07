"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(details) {
        super(`Validation failed: ${details}`);
        this.name = 'ValidationError';
        this.details = details;
        // Ensures the stack trace is correctly preserved in V8 engines
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}
exports.ValidationError = ValidationError;
