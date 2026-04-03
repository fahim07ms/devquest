'use client'

import {useAuthStore} from "@/store/authStore";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function RSLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/questions');
        }
    }, [isAuthenticated, router]);

    return (
        <main className={"flex flex-col h-screen justify-between"}>

            <div>
                {children}
            </div>


        </main>
    );
}