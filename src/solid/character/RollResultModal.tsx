import { Show, onCleanup, createEffect } from "solid-js";
import { type RollResult } from "@lib/roller";

interface RollResultModalProps {
    result: RollResult | null;
    onClose: () => void;
    duration?: number;
}

export default (props: RollResultModalProps) => {
    let timer: number;
    const duration = () => props.duration || 1500;

    createEffect(() => {
        if (timer) clearTimeout(timer);
        if (props.result) {
            timer = window.setTimeout(() => {
                props.onClose();
            }, duration());
        }
    });

    onCleanup(() => {
        if (timer) clearTimeout(timer);
    });

    return (
        <Show when={props.result}>
            <div class="roll-modal-overlay" onClick={props.onClose}>
                <div class="roll-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div class="roll-modal-header">
                        <span class="roll-label">
                            {props.result?.success ? props.result.original.split(':')[0] : 'Error'}
                        </span>
                        <button class="close-btn" onClick={props.onClose}>&times;</button>
                    </div>
                    
                    <Show when={props.result?.success} fallback={
                        <div class="roll-error">
                            Invalid Syntax
                        </div>
                    }>
                        <div class="roll-main">
                            <div class="roll-total">
                                {props.result?.total}
                            </div>
                            <div class="roll-details">
                                {props.result?.original.split(':')[1] || props.result?.original}
                            </div>
                        </div>
                    </Show>

                    <div class="timer-bar" style={{ "animation-duration": `${duration()}ms` }} />
                </div>
            </div>
        </Show>
    );
};
