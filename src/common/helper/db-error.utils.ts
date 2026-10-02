export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  cause?: {
    code?: string;
    detail?: string;
  };
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null;
}
