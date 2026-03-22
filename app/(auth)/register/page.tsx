'use client'

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {useAuthStore} from "@/store/authStore";
import {Controller, useForm} from "react-hook-form";
import {RegisterInput, registerSchema} from "@/lib/validation";
import {zodResolver} from "@hookform/resolvers/zod";
import api from "@/lib/api";
import {toast} from "sonner";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader} from "lucide-react";
import {Navbar} from "@/components/landing/Navbar";

export function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);

        try {
            const response = await api.post('/auth/register', data);
            toast.success("Account created successfully!");
            router.push('/login');
        } catch (error) {
            console.error("Registration failed", error);
            toast.error(error.response.data.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header section */}
            <Navbar />

            {/* Registration Form */}
            <div className={"flex justify-center items-center h-screen"}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className={"text-center text-2xl"}>Create an account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id={"register-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FieldGroup>
                                {/* Username field */}
                                <Controller
                                    name={"username"}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"register-form-username"}>Username</FieldLabel>
                                            <Input
                                                {...field}
                                                id={"register-form-username"}
                                                placeholder="john123"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isLoading}
                                            />
                                            {fieldState.error && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* Email field */}
                                <Controller
                                    name={"email"}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"register-form-email"}>Email</FieldLabel>
                                            <Input
                                                {...field}
                                                id={"register-form-email"}
                                                type="email"
                                                placeholder="example@app.com"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isLoading}
                                            />
                                            {fieldState.error && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* Password field */}
                                <Controller
                                    name={"password"}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"register-form-password"}>Password</FieldLabel>
                                            <Input
                                                {...field}
                                                id={"register-form-password"}
                                                type="password"
                                                placeholder="Enter your password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isLoading}
                                            />
                                            {fieldState.error && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* Confirm Password field */}
                                <Controller
                                    name={"confirmPassword"}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"register-form-confirm-password"}>Confirm Password</FieldLabel>
                                            <Input
                                                {...field}
                                                id={"register-form-confirm-password"}
                                                type="password"
                                                placeholder="Confirm your password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isLoading}
                                            />
                                            {fieldState.error && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            {/* Submit button */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader className="animate-spin" /> : "Register"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <p>
                            Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default RegisterPage;