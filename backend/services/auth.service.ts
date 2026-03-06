// Auth service stub — app uses localStorage-based auth (see frontend/contexts/AuthContext.tsx)
// This file is kept for API compatibility but is not actively used.

export const authService = {
    async signUp(_email: string, _password: string, _fullName: string) {
        throw new Error('Auth is handled via localStorage. Use AuthContext.enterApp() instead.');
    },

    async signIn(_email: string, _password: string) {
        throw new Error('Auth is handled via localStorage. Use AuthContext.enterApp() instead.');
    },

    async signOut() {
        // No-op: handled by AuthContext
    },

    async getSession() {
        return null;
    },

    onAuthStateChange(_callback: (event: string, session: any) => void) {
        return { data: { subscription: { unsubscribe: () => { } } } };
    },
};
