import { z } from 'zod'

export const voteSchema = z.object({
    content_id: z.string(),
    vote: z.union([z.literal(1), z.literal(-1)])
})