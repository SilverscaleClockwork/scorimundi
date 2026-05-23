import { createMemo, createEffect, untrack, createSignal, onMount } from "solid-js";
import type { HealthStructure, HealthTypes } from "@lib/global_types";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    health: HealthStructure,
    setHealth: SetStoreFunction<HealthStructure>
}) => {
    const [isHydrated, setIsHydrated] = createSignal(false);

    onMount(() => {
        setTimeout(() => setIsHydrated(true), 100);
    });
    
    const currPct = createMemo(() => {
        const c = Number(props.health.curr);
        const m = Number(props.health.max) || 1;
        return Math.min(100, Math.max(0, (c / m) * 100));
    });

    const tempPct = createMemo(() => {
        const t = Number(props.health.temp);
        const m = Number(props.health.max) || 1;
        return Math.min(100, Math.max(0, (t / m) * 100));
    });

    const createStableBinding = (key: HealthTypes) => {
        let el: HTMLDivElement | undefined;

        const onInput = (e: InputEvent & { currentTarget: HTMLDivElement }) => {
            const text = e.currentTarget.textContent || "";
            const clean = text.replace(/[^0-9]/g, '');
            const num = clean === '' ? 0 : parseInt(clean, 10);
            props.setHealth(key, num);
        };

        createEffect(() => {
            const value = String(props.health[key]);
            if (el && document.activeElement !== el && el.textContent !== value) {
                el.textContent = value;
            }
        });

        return {
            ref: (element: HTMLDivElement) => { el = element; },
            onInput,
            onBlur: () => {
                if (el) el.textContent = String(props.health[key]);
            }
        };
    };

    const currBinding = createStableBinding('curr');
    const maxBinding = createStableBinding('max');
    const tempBinding = createStableBinding('temp');

    return (
        <div class="card health-card" classList={{ 'is-loading': !isHydrated() }}>
            <div class="health-stats">
                <div class="stat-item">
                    <label>Current</label>
                    <div 
                        class="editable-value curr-hp" 
                        contentEditable={true}
                        ref={currBinding.ref}
                        onInput={currBinding.onInput}
                        onBlur={currBinding.onBlur}
                        textContent={untrack(() => String(props.health.curr))}
                    />
                </div>
                <div class="stat-divider">/</div>
                <div class="stat-item">
                    <label>Max</label>
                    <div 
                        class="editable-value max-hp" 
                        contentEditable={true}
                        ref={maxBinding.ref}
                        onInput={maxBinding.onInput}
                        onBlur={maxBinding.onBlur}
                        textContent={untrack(() => String(props.health.max))}
                    />
                </div>
                <div class="stat-item temp-hp-stat">
                    <label>Temp</label>
                    <div 
                        class="editable-value temp-hp" 
                        contentEditable={true}
                        ref={tempBinding.ref}
                        onInput={tempBinding.onInput}
                        onBlur={tempBinding.onBlur}
                        textContent={untrack(() => String(props.health.temp))}
                    />
                </div>
            </div>

            <div class="health-bar-container">
                <div 
                    class="health-bar-fill" 
                    style={{ width: `${currPct()}%` }}
                ></div>
                <div 
                    class="health-bar-temp" 
                    style={{ 
                        width: `${tempPct()}%`,
                        "z-index": 3
                    }}
                ></div>
            </div>
        </div>
    );
}
