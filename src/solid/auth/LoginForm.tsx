import { createSignal } from 'solid-js';
import { auth } from '../../lib/auth';
import { client } from '../../lib/api';

export default (props: { email?: string, registered?: boolean }) => {
    const [email, setEmail] = createSignal(props.email || '');
    const [password, setPassword] = createSignal('');
    const [error, setError] = createSignal(props.registered ? 'Registration successful! Ignite your session.' : '');
    const [loading, setLoading] = createSignal(false);

    const [rememberMe, setRememberMe] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await client.auth.login.$post({
                json: { email: email(), password: password() }
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
                throw new Error(data.error || 'Login failed');
            }

            // @ts-ignore
            auth.login(data.token, data.user, rememberMe());
            window.location.href = '/character';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div class="card auth-card">
            <h2>Ignite your Session</h2>
            <form onSubmit={handleSubmit}>
                <div class="scori-input-group-vertical">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="scori-input" 
                        placeholder="ash@scorimundi.com"
                        value={email()}
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
                
                <div class="auth-options">
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            onChange={(e) => setRememberMe(e.currentTarget.checked)}
                        />
                        <span>Remember Me</span>
                    </label>
                    <p class="gdpr-notice">This will store a persistent token on your device.</p>
                </div>

                {error() && <p class="auth-error">{error()}</p>}
                <button type="submit" class="scori-btn auth-btn" disabled={loading()}>
                    {loading() ? 'Igniting...' : 'Login'}
                </button>
            </form>
            <p class="auth-link">
                New to the ashen wastes? <a href="/register">Register here</a>.
            </p>
        </div>
    );
};
