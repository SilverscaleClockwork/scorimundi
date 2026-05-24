import type { RollResult } from "@lib/roller"
import { For, Show, type Accessor } from "solid-js"

export default (props: {
    logs: Accessor<RollResult[]>
}) => {
    const logs = props.logs;

    function printRoll(log: RollResult) {
        if(log.success === false) {
            return (
                <li>
                    <div class="warn">
                        Invalid roll syntax. Please refer to <a href="/wiki/dice-roller" class="guide-link">the guide</a>.
                    </div>
                </li>
            );
        }

        return (
            <li class="log-item">
                <div class="log-header">
                    <span class="original-roll">
                        {log.original}
                    </span>
                    <span class="total-value">
                        {log.total}
                    </span>
                </div>
                <ul class="breakdown-list">
                    <For each={log.breakdown}>
                        {
                            breakdown => (
                                <li class="breakdown-item">
                                    <span class="dice-type">
                                        {breakdown.dice}
                                    </span>
                                    <span class="individual-results">
                                        [{breakdown.results.join(', ')}]
                                    </span>
                                </li>
                            )
                        }
                    </For>
                </ul>
            </li>
        )
    }

    return (
        <div class="log">
            <Show 
                when={logs().length > 0}
                fallback={<p class="empty-log">No spins yet. Ignite the fire!</p>}
            >
                <ul>
                    <For each={logs()}>
                        {printRoll}
                    </For>
                </ul>
            </Show>
        </div>
    )
}
