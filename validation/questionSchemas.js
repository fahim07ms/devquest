import { z } from 'zod';

export const questionSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters.')
        .max(300, 'Title must be at most 300 characters.'),
    body: z.any().refine(
        (val) => val && JSON.stringify(val) !== '{}' && val?.content?.length > 0,
        { message: 'Description is required.' }
    ),
    tags: z.array(
        z.object({
            tag_id: z.string(),
            name: z.string(),
        })
    ).max(5),
})
