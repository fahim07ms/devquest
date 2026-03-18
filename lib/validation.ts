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

export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(8)
})
