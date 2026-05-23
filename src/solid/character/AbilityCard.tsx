import type { Ability, AbilityKey } from "@lib/global_types";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    abilities: Record<AbilityKey, Ability>,
    setAbilities: SetStoreFunction<Record<AbilityKey, Ability>>,
}) => {
    return (
        <ul class="card">
            <For each={Object.entries(props.abilities)}>
                {
                    ([key, ability]) => (
                        <li>
                            <div>
                                {key}
                            </div>
                            <div>
                                {ability.mod}
                            </div>
                        </li>
                    )
                }
            </For>
        </ul>
    );
}