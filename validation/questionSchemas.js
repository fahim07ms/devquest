import { z } from 'zod';

export const questionSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters long.")
        .max(300, "Title must be less than 300 characters long."),
    body: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()).optional()
    }),
    tags: z.array(z.uuid()).optional(),
});
