import { createSignal } from 'solid-js';
import { client } from '../../lib/api';

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
            const res = await client.auth.register.$post({
                json: { 
                    username: username(), 
                    email: email(), 
                    password: password() 
                }
            });

            const contentType = res.headers.get('content-type');
            let data: any;

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
            }

            if (!res.ok) {
                // @ts-ignore
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
