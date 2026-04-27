import { z } from 'zod';

export const identifierLoginSchema = z.object({
  email: z.string().check(z.trim(), z.email(`Enter a valid email address.`), z.toLowerCase()),
});

export type IdentifierLoginFormValues = z.infer<typeof identifierLoginSchema>;
