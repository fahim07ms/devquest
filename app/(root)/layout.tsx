'use client'

import {useAuthStore} from "@/store/authStore";
import {useEffect, useState} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";

export default function RootLayout({ children } : { children: React.ReactNode }) {
    const { isAuthenticated, user, login, logout } = useAuthStore();
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const router = useRouter();

    // Verify authentication with the backend on the mount
    useEffect(() => {
        const verifyAuth = async () => {
            setIsLoading(true);

            try {
                const response = await api.get('/users/me');
                if (response.data.data.user) {
                    login(response.data.data.user);
                }
            } catch (error) {
                console.log('Authentication failed:', error);
                // If verification fails, logout and redirect to login
                logout();
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        }

        verifyAuth();
    }, []);

    // Show loading state while verifying
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated after verification
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const handleLogout = async () => {
        try {
            await api.get("/auth/logout");
            logout();
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
            // Force logout on a client even if the server fails
            logout();
            router.push("/login");
        }
    };

    if (isAuthenticated) {
        return (
            <div>
                <div>Hello, {user?.username} </div>
                <Button onClick={handleLogout}>Logout</Button>
            </div>
        )
    }
    else {
        return (
            <div>
                <Button onClick={() => router.push('/login')}>Login</Button>
            </div>
        )
    }
}