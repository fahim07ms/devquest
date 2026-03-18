'use client'

import {Button} from "@/components/ui/button";
import {useAuthStore} from "@/store/authStore";
import api from "@/lib/api";
import {toast} from "sonner";

export default function Home() {
    const authStore = useAuthStore();

    const handleLogout = async () => {
        await api.get('/auth/logout');

        const authStore = useAuthStore.getState();
        authStore.logout();

        toast.success('Successfully logged out.')
    }
    if (authStore.isAuthenticated) {
        return (
            <div>
                <div>Hello, {authStore.user.username} </div>
                <Button onClick={handleLogout}>Logout</Button>
            </div>
        )
    }
    else {
        return (
            <div>
                <Button onClick={() => window.location.href = '/login'}>Login</Button>
            </div>
        )
    }
}
