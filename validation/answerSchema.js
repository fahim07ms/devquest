// validation/answerSchemas.js
import { z } from 'zod';

export const answerSchema = z.object({
    body: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()).optional(),
    }),
});