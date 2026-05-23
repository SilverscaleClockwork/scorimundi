import type { Ability, AbilityKey } from "@lib/global_types";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    abilities: Record<AbilityKey, Ability>,
    setAbilities: SetStoreFunction<Record<AbilityKey, Ability>>,
}) => {
    const headings: Record<AbilityKey, string> = {
        str: 'Strength',
        dex: 'Dexterity',
        con: 'Constitution',
        int: 'Intelligence',
        wis: 'Wisdom',
        cha: 'Charisma',
    };

    return (
        <div class="card ability-list-card">
            <ul class="ability-list">
                <For each={Object.entries(props.abilities)}>
                    {
                        ([key, ability]) => (
                            <li>
                                <div class="ability-name">
                                    {key}
                                </div>
                                <div class="mod">
                                    {ability.mod}
                                </div>
                            </li>
                        )
                    }
                </For>
            </ul>
        </div>
    );
}