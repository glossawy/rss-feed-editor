export const isBlank = (value: string | null | undefined) =>
  value == null || value.trim() === ""
