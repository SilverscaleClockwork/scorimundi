import { Show, createSignal, onMount } from "solid-js";
import { auth } from "../lib/auth";

export default () => {
    const [isHydrated, setIsHydrated] = createSignal(false);

    onMount(() => {
        setIsHydrated(true);
    });

    const handleLogout = () => {
        auth.logout();
        window.location.href = '/';
    };

    return (
        <ul>
            <li>
                <a href="/">Home</a>
            </li>
            <Show when={isHydrated() && auth.token()}>
                <li>
                    <a href="/character">Heroes</a>
                </li>
            </Show>
            <li>
                <a href="/wiki">Wiki</a>
            </li>
            
            <li class="nav-spacer"></li>

            <Show when={isHydrated() && auth.token()} fallback={
                <>
                    <li>
                        <a href="/login">Login</a>
                    </li>
                    <li>
                        <a href="/register">Register</a>
                    </li>
                </>
            }>
                <li class="user-display">
                    <span class="username">{auth.user()?.username}</span>
                </li>
                <li>
                    <button class="nav-btn-logout" onClick={handleLogout}>Logout</button>
                </li>
            </Show>
        </ul>
    );
};
