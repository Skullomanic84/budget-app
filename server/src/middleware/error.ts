// server/src/middleware/error.ts
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import type { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt


/** Stable error codes for the client to branch on */
type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_NOT_ACTIVE'
  | 'AUTH_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'

/** Consistent wire payload */
export type ApiErrorResponse = {
  error: ErrorCode
  message?: string
  details?: unknown
  debug?: { cause?: unknown }
}

/** App-level error with HTTP status + code */
export class AppError extends Error {
  public status: number
  public code: ErrorCode
  public details?: unknown
  constructor(
    code: ErrorCode,
    message: string,
    status = 400,
    details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Type guards to keep `no-explicit-any` happy */
function hasStringProp<T extends string>(
  obj: unknown,
  key: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj
}
function getMessage(err: unknown): string | undefined {
  if (err instanceof Error) return err.message
  if (hasStringProp(err, 'message') && typeof err.message === 'string')
    return err.message
  return undefined
}

/** Narrow Prisma known request errors without `any` */
function isPrismaKnownError(
  err: unknown
): err is Prisma.PrismaClientKnownRequestError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as Prisma.PrismaClientKnownRequestError).code === 'string'
  )
}

/** Map Prisma codes to HTTP + ErrorCode */
function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  status: number
  code: ErrorCode
  message: string
  details?: unknown
} {
  switch (err.code) {
    case 'P2002': {
      const fields =
        (Array.isArray(err.meta?.target)
          ? (err.meta?.target as string[]).join(', ')
          : undefined) ?? undefined
      return {
        status: 409,
        code: 'CONFLICT',
        message: 'Unique constraint violated.',
        details: { fields },
      }
    }
    case 'P2003':
      return {
        status: 409,
        code: 'CONFLICT',
        message: 'Foreign key constraint failed.',
        details: err.meta,
      }
    case 'P2025':
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Requested resource was not found.',
        details: err.meta,
      }
    default:
      return {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database error.',
        details: { prismaCode: err.code, meta: err.meta },
      }
  }
}

/** Convert any thrown error into a consistent API shape (hides internals in prod) */
function toApiError(err: unknown): {
  status: number
  payload: ApiErrorResponse
} {
  const isProd = process.env.NODE_ENV === 'production'

  // Zod validation
  if (err instanceof ZodError) {
    return {
      status: 400,
      payload: {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.flatten(),
        ...(isProd ? {} : { debug: { cause: err.issues } }),
      },
    }
  }

  // AppError
  if (err instanceof AppError) {
    return {
      status: err.status,
      payload: {
        error: err.code,
        message: err.message,
        details: err.details,
        ...(isProd ? {} : { debug: { cause: err.cause } }),
      },
    }
  }

  // Prisma
  if (isPrismaKnownError(err)) {
    const mapped = mapPrismaError(err)
    return {
      status: mapped.status,
      payload: {
        error: mapped.code,
        message: mapped.message,
        details: mapped.details,
        ...(isProd
          ? {}
          : { debug: { cause: { code: err.code, meta: err.meta } } }),
      },
    }
  }

  // JWT
  if (err instanceof TokenExpiredError) {
    return {
      status: 401,
      payload: {
        error: 'AUTH_TOKEN_EXPIRED',
        message: 'Authentication token has expired.',
        ...(isProd ? {} : { debug: { cause: err.message } }),
      },
    }
  }
  if (err instanceof NotBeforeError) {
    return {
      status: 401,
      payload: {
        error: 'AUTH_TOKEN_NOT_ACTIVE',
        message: 'Authentication token is not active yet.',
        ...(isProd ? {} : { debug: { cause: err.message } }),
      },
    }
  }
  if (err instanceof JsonWebTokenError) {
    return {
      status: 401,
      payload: {
        error: 'AUTH_INVALID_TOKEN',
        message: 'Invalid authentication token.',
        ...(isProd ? {} : { debug: { cause: err.message } }),
      },
    }
  }

  // Fallback
  const msg = getMessage(err) ?? 'Unexpected error.'
  return {
    status: 500,
    payload: {
      error: 'INTERNAL_SERVER_ERROR',
      message: isProd ? 'An unexpected error occurred.' : msg,
      ...(isProd ? {} : { debug: { cause: err } }),
    },
  }
}

/** Centralized error handler (keep 4 args so Express knows it's an error middleware) */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {

   void _next
  // Structured server-side logging without leaking stacks in prod
  const log = {
    time: new Date().toISOString(),
    name: err instanceof Error ? err.name : undefined,
    message: getMessage(err),
    stack:
      process.env.NODE_ENV === 'production'
        ? undefined
        : err instanceof Error
          ? err.stack
          : undefined,
  }

  console.error('[ERROR]', log)

  const { status, payload } = toApiError(err)
  res.status(status).json(payload)
}
