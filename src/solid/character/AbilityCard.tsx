import type { Ability, AbilityKey } from "@lib/global_types";
import { formatModifier, calculateAbilityMod } from "@lib/character_utils";
import { For, Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    abilities: Record<AbilityKey, Ability>,
    setAbilities: SetStoreFunction<Record<AbilityKey, Ability>>,
    proficiencyBonus: number,
    isEditing?: boolean,
    onAbilityChange?: (key: AbilityKey, score: number, save: boolean) => void,
    onRoll?: (name: string, mod: number) => void,
}) => {
    return (
        <div class="card ability-list-card">
            <ul class="ability-list">
                <For each={Object.entries(props.abilities)}>
                    {
                        ([key, ability]) => {
                            const mod = calculateAbilityMod(ability.raw);
                            const save = mod + (ability.save_proficiency ? props.proficiencyBonus : 0);

                            return (
                                <li onClick={() => !props.isEditing && props.onRoll?.(key, mod)}>
                                    <div class="ability-name">
                                        {key}
                                    </div>
                                    <Show when={props.isEditing} fallback={
                                        <>
                                            <Show when={save !== mod}>
                                                <small class="save-mod">
                                                    Save: {formatModifier(save)}
                                                </small>
                                            </Show>
                                            <div class="mod">
                                                {formatModifier(mod)}
                                            </div>
                                        </>
                                    }>
                                        <div class="edit-controls">
                                            <input 
                                                type="number" 
                                                class="scori-input score-input" 
                                                value={ability.raw}
                                                onInput={(e) => props.onAbilityChange?.(key as AbilityKey, parseInt(e.currentTarget.value) || 0, !!ability.save_proficiency)}
                                            />
                                            <label class="save-prof-toggle">
                                                <input 
                                                    type="checkbox" 
                                                    checked={ability.save_proficiency}
                                                    onChange={(e) => props.onAbilityChange?.(key as AbilityKey, ability.raw, e.currentTarget.checked)}
                                                />
                                                Save
                                            </label>
                                        </div>
                                    </Show>
                                </li>
                            );
                        }
                    }
                </For>
            </ul>
        </div>
    );
}
