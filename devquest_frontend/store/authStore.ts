import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            updateUser: (updates) => set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                })
            )
        }),
        {
            name: 'auth-storage'
        }
    ),
)