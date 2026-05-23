import type { RollResult } from "@lib/roller"
import { For, Show, type Accessor } from "solid-js"

export default (props: {
    logs: Accessor<RollResult[]>
}) => {
    const logs = props.logs;


    function printRoll(log: RollResult) {
        if(log.success == false) {
            return (
                <li>
                    <div class="warn">
                        Roll failed!
                    </div>
                </li>
            );
        }

        return (
            <li class="log-item">
                <div>
                    {log.original}
                </div>
                <div>
                    {log.total}
                </div>
                <ul>
                    <For each={log.breakdown}>
                        {
                            breakdown => (
                                <li>
                                    <div>
                                        {breakdown.dice}
                                    </div>
                                    <div>
                                        {breakdown.results.join(', ')}
                                    </div>
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
                when={logs()}
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