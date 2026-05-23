import { createSignal } from 'solid-js';

export default () => {
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [error, setError] = createSignal('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');
        
        // This will be handled by the Astro action or API route
        console.log('Logging in with:', email(), password());
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
                        onInput={(e) => setEmail(e.currentTarget.value)}
                        required
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
                    />
                </div>
                {error() && <p class="auth-error">{error()}</p>}
                <button type="submit" class="scori-btn auth-btn">Login</button>
            </form>
            <p class="auth-link">
                New to the ashen wastes? <a href="/register">Register here</a>.
            </p>
        </div>
    );
};
