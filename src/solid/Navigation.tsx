import { Show, createSignal, onMount } from "solid-js";
import { auth } from "../lib/auth";

export default () => {
    const [isHydrated, setIsHydrated] = createSignal(false);
    const [isOpen, setIsOpen] = createSignal(false);

    onMount(() => {
        setIsHydrated(true);
    });

    const handleLogout = () => {
        auth.logout();
        window.location.href = '/';
    };

    const toggleMenu = () => setIsOpen(!isOpen());

    return (
        <div class="nav-container">
            <div class="nav-header">
                <a href="/" class="nav-brand">Scorimundi</a>
                <button class="mobile-nav-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
                    <span class="toggle-icon">{isOpen() ? '×' : '☰'}</span>
                </button>
            </div>
            
            <ul class={isOpen() ? 'show' : 'hide'}>
                <li class="nav-links-group">
                    <a href="/">Home</a>
                    <Show when={isHydrated() && auth.token()}>
                        <a href="/character">Heroes</a>
                    </Show>
                    <a href="/wiki">Wiki</a>
                </li>
                
                <li class="nav-spacer"></li>

                <li class="nav-auth-group">
                    <Show when={isHydrated() && auth.token()} fallback={
                        <>
                            <a href="/login">Login</a>
                            <a href="/register">Register</a>
                        </>
                    }>
                        <div class="user-display">
                            <span class="username">{auth.user()?.username}</span>
                        </div>
                        <button class="nav-btn-logout" onClick={handleLogout}>Logout</button>
                    </Show>
                </li>
            </ul>
        </div>
    );
};
