import { Validator, ValidationSeverity } from "svelte-jsoneditor"
import { z } from "zod"
import { fromZodIssue } from "zod-validation-error"

export default function createZodValidator<Schema extends z.ZodSchema>(
  schema: Schema,
  params?: Partial<z.ParseParams>
): Validator {
  return (json) => {
    const result = schema.safeParse(json, params)

    if (result.success) return []

    return result.error.issues.map((issue) => {
      const message = fromZodIssue(issue).message.slice(
        "Validation Error: ".length
      )

      return {
        path: issue.path.map((p) => p.toString()),
        message: message,
        severity: issue.fatal
          ? ValidationSeverity.error
          : ValidationSeverity.warning,
      }
    })
  }
}
