import { createSignal } from 'solid-js';

export default () => {
    const [username, setUsername] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [error, setError] = createSignal('');

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');

        if (password() !== confirmPassword()) {
            setError('Passwords do not match');
            return;
        }
        
        console.log('Registering:', username(), email(), password());
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
                <div class="scori-input-group-vertical">
                    <label for="confirmPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        class="scori-input" 
                        placeholder="••••••••"
                        onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                        required
                    />
                </div>
                {error() && <p class="auth-error">{error()}</p>}
                <button type="submit" class="scori-btn auth-btn">Register</button>
            </form>
            <p class="auth-link">
                Already have a flame? <a href="/login">Login here</a>.
            </p>
        </div>
    );
};
