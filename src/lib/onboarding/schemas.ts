import { z } from 'zod';

export const dealbreakerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('no_smoking') }),
  z.object({ kind: z.literal('no_pets') }),
  z.object({ kind: z.literal('gender'), value: z.enum(['male_only', 'female_only']) }),
  z.object({ kind: z.literal('faith_match') }),
  z.object({ kind: z.literal('no_drinking') }),
  z.object({ kind: z.literal('budget_max'), value: z.number().positive() }),
]);

export type Dealbreaker = z.infer<typeof dealbreakerSchema>;
export const dealbreakersSchema = z.array(dealbreakerSchema).max(10);
