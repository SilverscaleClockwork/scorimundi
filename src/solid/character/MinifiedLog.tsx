import { createSignal, Show, type Accessor } from "solid-js";
import { type RollResult } from "@lib/roller";
import RollLog from "../DemoRollLog";

interface MinifiedLogProps {
    logs: Accessor<RollResult[]>;
    onManualRoll: (notation: string) => void;
}

export default (props: MinifiedLogProps) => {
    const [isOpen, setIsOpen] = createSignal(false);
    let manualInput!: HTMLInputElement;

    const handleManualSubmit = (e: Event) => {
        e.preventDefault();
        if (manualInput.value.trim()) {
            props.onManualRoll(manualInput.value.trim());
            manualInput.value = '';
        }
    };

    return (
        <div class="minified-tools-container">
            <div class="minified-tool log-tool" classList={{ open: isOpen() }}>
                <button 
                    class="tool-trigger" 
                    onClick={() => setIsOpen(!isOpen())}
                >
                    <span class="icon">📜</span>
                    <span class="label">Roll Log</span>
                    <Show when={props.logs().length > 0}>
                        <span class="badge">{props.logs().length}</span>
                    </Show>
                </button>
                <div class="tool-content">
                    <div class="tool-header">
                        <h3>Roll History</h3>
                        <button class="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    
                    <form class="manual-roll-form" onSubmit={handleManualSubmit}>
                        <div class="scori-input-group">
                            <input 
                                ref={manualInput}
                                type="text" 
                                class="scori-input btn-small" 
                                placeholder="Manual roll (e.g. 2d6 + 3)..."
                            />
                            <button type="submit" class="scori-btn btn-small">Roll</button>
                        </div>
                    </form>

                    <div class="log-wrapper">
                        <RollLog logs={props.logs} />
                    </div>
                </div>
            </div>
        </div>
    );
};
