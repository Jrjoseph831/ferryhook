import type { ZodSchema, ZodError } from "zod";
import type { ErrorDetail } from "@ferryhook/core";

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  errors: ErrorDetail[];
}

export function validateBody<T>(
  body: string | undefined,
  schema: ZodSchema<T>
): ValidationResult<T> | ValidationError {
  if (!body) {
    return {
      success: false,
      errors: [{ field: "body", message: "Request body is required" }],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {
      success: false,
      errors: [{ field: "body", message: "Invalid JSON" }],
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  return { success: true, data: result.data };
}

function formatZodErrors(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
