import { z } from 'zod'

export function getZodErrors(
  result: { success: false; error: z.ZodError } | { success: true; data: unknown },
): Record<string, string> {
  if (result.success) return {}
  const flat = result.error.flatten()
  const entries = Object.entries(flat.fieldErrors as Record<string, string[] | undefined>)
  return Object.fromEntries(entries.map(([key, msgs]) => [key, msgs?.[0] ?? '']))
}
