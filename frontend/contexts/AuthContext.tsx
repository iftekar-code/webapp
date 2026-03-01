import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface UserProfile {
    name: string;
    email: string;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    enterApp: (name: string, email: string) => Promise<void>;
    signOut: () => void;
}

const STORAGE_KEY = 'studyeasily_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    const enterApp = async (name: string, email: string) => {
        const profile: UserProfile = { name, email };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setUser(profile);
    };

    const signOut = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, enterApp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
