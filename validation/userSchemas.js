import { z } from 'zod'

export const profileUpdateSchema = z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    birthDate: z.date().optional(),
    profilePicture: z.url().optional(),
    bio: z.string().max(500).optional(),
    website: z.url().optional(),
})