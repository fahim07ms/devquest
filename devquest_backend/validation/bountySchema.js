import { z } from 'zod';

export const bountySchema = z.object({
    amount: z.number().min(50, { message: 'Bounty amount must be at least 50.' }),
    reason: z.string().trim().min(1, { message: 'Bounty reason must be at least 1 characters.' }),
});