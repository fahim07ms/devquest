'use client';

import React, {useState} from 'react';
import {Controller, useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { toast } from "sonner";

import { loginSchema, LoginInput } from "@/lib/validation";

import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Loader} from "lucide-react";


function SignInPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    // Search params and from prop for redirecting after successful login
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/dashboard';

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    })

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', data);
            login(response.data.data.user);
            toast.success("Signed in successfully!");
            router.push(from);
        } catch (error) {
            console.error("Login failed", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className={"flex justify-center items-center h-screen"}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className={"text-center text-2xl"}>Login to your account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form id={"login-form"} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FieldGroup>
                            {/* Username field */}
                            <Controller
                                name={"username"}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={"login-form-username"}>Username</FieldLabel>
                                        <Input
                                            {...field}
                                            id={"login-form-username"}
                                            placeholder="Enter your username"
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
                                        <FieldLabel htmlFor={"login-form-password"}>Password</FieldLabel>
                                        <Input
                                            {...field}
                                            id={"login-form-password"}
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
                        </FieldGroup>

                        {/* Submit button */}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader className="animate-spin" /> : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <p>
                        Don&#39;t have an account? <a href="/register" className="text-primary hover:underline">Create one</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SignInPage;