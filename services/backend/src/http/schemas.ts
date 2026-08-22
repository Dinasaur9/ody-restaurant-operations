import { z } from "@hono/zod-openapi";

export const ApiErrorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: "VALIDATION_ERROR" }),
      message: z.string().openapi({ example: "The request could not be processed." }),
      requestId: z.string().openapi({ example: "3c8d253b-c4fc-43d9-9893-d66cdcca87dc" }),
      details: z.unknown().optional(),
    }),
  })
  .openapi("ApiError");

export const HealthSchema = z
  .object({
    status: z.literal("ok"),
    service: z.literal("ody-restaurant-api"),
    version: z.string(),
    timestamp: z.string().datetime(),
  })
  .openapi("Health");

export const jsonResponse = <T extends z.ZodType>(
  schema: T,
  description = "Successful response",
) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});
