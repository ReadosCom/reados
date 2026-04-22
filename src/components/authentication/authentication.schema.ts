import { z } from 'zod';

export const identifierLoginSchema = z.object({
  email: z.email(`Enter a valid email address.`).trim().toLowerCase(),
});

export type IdentifierLoginFormValues = z.infer<typeof identifierLoginSchema>;
