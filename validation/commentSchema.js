// validation/commentSchemas.js
import { z } from 'zod';

export const commentSchema = z.object({
    body: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()).optional(),
    }),
    recipientId: z.guid().optional(),
});