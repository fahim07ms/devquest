import { z } from 'zod'

export const profileUpdateSchema = z.object({
    firstName: z.string().max(100).optional().nullable(),
    lastName: z.string().max(100).optional().nullable(),
    birthDate: z.string().date().optional().nullable(),
    profilePicture: z.url().optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    website: z.url().optional().nullable(),
})