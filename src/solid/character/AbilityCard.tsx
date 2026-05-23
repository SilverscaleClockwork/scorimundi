import type { Ability, AbilityKey } from "@lib/global_types";
import { formatModifier, calculateAbilityMod } from "@lib/character_utils";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    abilities: Record<AbilityKey, Ability>,
    setAbilities: SetStoreFunction<Record<AbilityKey, Ability>>,
    proficiencyBonus: number,
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
                        ([key, ability]) => {
                            const mod = calculateAbilityMod(ability.raw);
                            const save = mod + (ability.save_proficiency ? props.proficiencyBonus : 0);

                            return (
                                <li>
                                    <div class="ability-name">
                                        {key}
                                    </div>
                                    <Show when={save !== mod}>
                                        <small class="save-mod">
                                            Save: {formatModifier(save)}
                                        </small>
                                    </Show>
                                    <div class="mod">
                                        {formatModifier(mod)}
                                    </div>
                                </li>
                            );
                        }
                    }
                </For>
            </ul>
        </div>
    );
}