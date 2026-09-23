import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Sanitizes any string to remove sensitive patterns such as:
 * - PostgreSQL / database connection URLs with passwords
 * - API keys / tokens
 * - Environment variable strings
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg || typeof msg !== 'string') return '';
  return msg
    // Replace postgres/postgresql URLs: postgresql://user:password@host:port/db
    .replace(/(postgres(?:ql)?:\/\/)([^:@\s]+):([^@\s]+)@/gi, '$1$2:***@')
    // Replace generic password / secret parameters
    .replace(/(password|passwd|pwd|secret|apiKey|token)=([^\s&]+)/gi, '$1=***')
    // Replace admin key or bearer token values
    .replace(/(Bearer\s+)[A-Za-z0-9_\-\.]+/gi, '$1***');
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Determine if this is a body-parser JSON syntax error
  const isSyntaxError = err instanceof SyntaxError && 'status' in err && (err as any).status === 400;

  // Safe console log for diagnostics
  console.error('[API Server Error]:', err.message || err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = isSyntaxError ? 400 : (typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500);

  let customerMessage: string;
  if (isSyntaxError) {
    customerMessage = 'Malformed JSON payload. Please check your request formatting.';
  } else if (statusCode < 500 && err.message) {
    customerMessage = sanitizeErrorMessage(err.message);
  } else {
    customerMessage = 'An unexpected error occurred while processing your request. Please try again or contact the salon directly.';
  }

  // Never expose raw stack traces in production, and sanitize dev error details
  const errorDetails = isProduction
    ? undefined
    : sanitizeErrorMessage(err.message || 'Internal server error');

  return sendError(
    res,
    customerMessage,
    statusCode,
    errorDetails
  );
}
