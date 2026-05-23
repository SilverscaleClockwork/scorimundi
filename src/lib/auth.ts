import { createSignal, createRoot } from "solid-js";

function createAuthManager() {
    const [token, setToken] = createSignal<string | null>(null);
    const [user, setUser] = createSignal<any | null>(null);

    const login = (newToken: string, userData: any, rememberMe: boolean = false) => {
        setToken(newToken);
        setUser(userData);
        
        if (typeof window !== 'undefined') {
            if (rememberMe) {
                localStorage.setItem('scori-token', newToken);
                localStorage.setItem('scori-remember', 'true');
            } else {
                sessionStorage.setItem('scori-token', newToken);
                localStorage.removeItem('scori-remember');
            }
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('scori-token');
            localStorage.removeItem('scori-remember');
            sessionStorage.removeItem('scori-token');
        }
    };

    // Initialize from storage
    if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('scori-token') || sessionStorage.getItem('scori-token');
        if (storedToken) {
            setToken(storedToken);
            try {
                // Extract user data from JWT payload (middle part)
                const base64Url = storedToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                setUser(JSON.parse(jsonPayload));
            } catch (e) {
                console.error('Failed to parse stored token', e);
                logout(); // Clear invalid token
            }
        }
    }

    return { token, user, login, logout };
}

export const auth = createRoot(createAuthManager);
