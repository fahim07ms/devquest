import { z } from "zod";

export const registerSchema = z.object({
    username: z.string()
        .min(1, "Username must be at least 1 character long."),
    email: z
        .email("Invalid email address."),
    password: z.string()
        .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string()
        .refine(data => data.password === data.confirmPassword, {
            message: "Passwords do not match.",
            path: ["confirmPassword"]
        })
})

export const loginSchema = z.object({
    username: z.string()
        .min(1, "Username is required."),
    password: z.string()
        .min(1, "Password is required.")
})

