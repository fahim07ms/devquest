'use client';

import React, {useEffect, useState} from 'react';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {CircleAlert, Loader} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

function SignInPage() {

    // Router, search params, and from prop for redirecting after successful login
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/';

    // State for username and password and errors
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Loading state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auth store for managing user session
    const login = useAuthStore((state) => state.login);

    // Set error empty when typed something
    useEffect(() => {
        setErrors({});
    }, [username, password]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Verify the data submitted
            await loginSchema.parseAsync({
                username,
                password,
            });


            // Sign in request to the server
            const response = await api.post('/auth/login', {
                "username": username,
                "password": password
            });

            if (!response.data) {
                toast.error("Something went wrong. Please try again later.");
            }

            // Check if the response is successful
            login(response.data.data.user);

            // Clear the input fields
            setUsername('');
            setPassword('');

            // Redirect to the `from` prop or home page
            router.push(from);
        } catch (error: Error | z.ZodError | any) {
            // Handle error for validation
            if (error instanceof z.ZodError) {
                const fieldErrors = error.flatten().fieldErrors;
                setErrors(fieldErrors as unknown as Record<string, string>);
            }

            // Handle error for server response
            else if (!error.response) {
                toast("No response from server");
            } else if (error.response.status === 401) {
                toast("Invalid credentials!");
            } else {
                toast("Something went wrong. Please try again later.")
            }
        } finally {

            // Refresh to change some session-based UI data
            router.refresh();

            toast.success("Signed in successfully!");

            setIsSubmitting(false);
        }
    }

    return (
        <div className={"flex justify-center items-center h-screen"}>
            <Card className="w-full max-w-sm bg-background ">
                <CardHeader>
                    <CardTitle className={"text-center text-2xl"}>Login to your account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="username"
                                    placeholder="johndoe"
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                {errors.username &&
                                    <p className="text-red-500 flex items-center bg-red-300/10 p-2 rounded-md">
                                        <CircleAlert className={"size-4 mr-2 inline"} /> {errors.username}
                                    </p>
                                }
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {errors.password &&
                                    <p className="text-red-500 flex items-center bg-red-300/10 p-2 rounded-md">
                                        <CircleAlert className={"size-4 mr-2 inline"} /> {errors.password}
                                    </p>
                                }
                            </div>

                            <div
                                className="flex items-center gap-3"
                            >
                                {/*<Checkbox*/}
                                {/*    id="terms"*/}
                                {/*    onClick={togglePersist}*/}
                                {/*    checked={persist}*/}
                                {/*/>*/}
                                {/*<Label htmlFor="terms">Remember me</Label>*/}
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-4 cursor-pointer">
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader className="animate-spin h-4 w-4" />
                                    Signing In...
                                </div>
                            ) : (
                                "Sign In"
                            )}
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