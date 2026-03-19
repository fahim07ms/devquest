'use client'

import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Navbar } from '@/components/layout/Navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { login, logout } = useAuthStore()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()

    // // Verify session with backend on mount
    // useEffect(() => {
    //     const verifyAuth = async () => {
    //         setIsLoading(true)
    //         try {
    //             const response = await api.get('/users/me');
    //             if (response.data.data.user) {
    //                 login(response.data.data.user);
    //             }
    //         } catch (error) {
    //             console.log('Authentication failed:', error);
    //             // If verification fails, logout and redirect to login
    //             logout();
    //             router.push('/login');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }

    //     verifyAuth();
    // }, []);

    // // Show loading state while verifying
    // if (isLoading) {
    //     return (
    //         <div className="flex min-h-screen items-center justify-center bg-background">
    //             <div className="text-center space-y-3">
    //                 <div className="relative mx-auto h-12 w-12">
    //                     <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
    //                     <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
    //                 </div>
    //                 <p className="text-sm text-muted-foreground animate-pulse">Loading DevQuest…</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <AppSidebar />
                <div className="flex flex-1 flex-col min-w-0">
                    <Navbar />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}