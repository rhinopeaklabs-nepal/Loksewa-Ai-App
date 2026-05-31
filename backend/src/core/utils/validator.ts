import { z, type ZodSchema } from "zod";
import { ValidationError } from "../errors/ValidationError";

export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value;
}

export function parseWithSchema<T>(schema: ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join("; "));
  }
  return result.data;
}

export const uuidSchema = z.string().uuid();
