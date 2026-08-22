import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown, context: Context) {
  const requestId = context.get("requestId") as string;

  if (error instanceof ApiError) {
    return context.json(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
      error.status,
    );
  }

  console.error(`[${requestId}] Unhandled API error`, error);
  return context.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        requestId,
      },
    },
    500,
  );
}
