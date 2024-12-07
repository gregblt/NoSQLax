"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentNotFoundError = void 0;
class DocumentNotFoundError extends Error {
    constructor(selector) {
        super(`Document not found for the given criteria`);
        this.name = 'DocumentNotFindError';
        this.selector = selector;
        // Ensures the stack trace is correctly preserved in V8 engines
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DocumentNotFoundError);
        }
    }
}
exports.DocumentNotFoundError = DocumentNotFoundError;
