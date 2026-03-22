import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
})
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: 'custom',
                message: "Passwords do not match",
                path: ["confirmPassword"]
            })
        }
    })

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(8)
})

export type LoginInput = z.infer<typeof loginSchema>

export const askFormSchema = z.object({
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

export type AskFormValues = z.infer<typeof askFormSchema>
