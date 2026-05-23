import type { HealthStructure } from "@lib/global_types";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    health: HealthStructure,
    setHealth: SetStoreFunction<HealthStructure>
}) => {
    return (
        <ul>
            <For each={Object.entries(props.health)}>
                {
                    ([key, health]) => (
                        <li>
                            <div>
                                {key}
                            </div>
                            <div>
                                {health}
                            </div>
                        </li>
                    )
                }
            </For>
        </ul>
    );
}