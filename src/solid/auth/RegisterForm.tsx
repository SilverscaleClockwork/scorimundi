import { createSignal } from 'solid-js';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default () => {
    const [username, setUsername] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [error, setError] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const [rememberMe, setRememberMe] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');

        if (password() !== confirmPassword()) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username(), 
                    email: email(), 
                    password: password() 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            window.location.href = `/login?registered=true&email=${encodeURIComponent(email())}`;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="card auth-card">
            <h2>Born from the Ashes</h2>
            <form onSubmit={handleSubmit}>
                <div class="scori-input-group-vertical">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        class="scori-input" 
                        placeholder="AshWalker"
                        onInput={(e) => setUsername(e.currentTarget.value)}
                        required
                        disabled={loading()}
                    />
                </div>
                <div class="scori-input-group-vertical">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="scori-input" 
                        placeholder="ash@scorimundi.com"
                        onInput={(e) => setEmail(e.currentTarget.value)}
                        required
                        disabled={loading()}
                    />
                </div>
                <div class="scori-input-group-vertical">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        class="scori-input" 
                        placeholder="••••••••"
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        required
                        disabled={loading()}
                    />
                </div>
                <div class="scori-input-group-vertical">
                    <label for="confirmPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        class="scori-input" 
                        placeholder="••••••••"
                        onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                        required
                        disabled={loading()}
                    />
                </div>

                <div class="auth-options">
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            onChange={(e) => setRememberMe(e.currentTarget.checked)}
                        />
                        <span>Remember Me</span>
                    </label>
                    <p class="gdpr-notice">This will store a persistent token on your device after login.</p>
                </div>

                {error() && <p class="auth-error">{error()}</p>}
                <button type="submit" class="scori-btn auth-btn" disabled={loading()}>
                    {loading() ? 'Rising...' : 'Register'}
                </button>
            </form>
            <p class="auth-link">
                Already have a flame? <a href="/login">Login here</a>.
            </p>
        </div>
    );
};
