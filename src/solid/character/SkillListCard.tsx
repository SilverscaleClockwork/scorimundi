import { For, Show } from "solid-js";
import type { AbilityKey, SkillsStructure } from "@lib/global_types";
import { formatModifier, calculateAbilityMod } from "@lib/character_utils";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    skills: SkillsStructure,
    setSkills: SetStoreFunction<SkillsStructure>,
    abilities: Record<AbilityKey, Ability>,
    proficiencyBonus: number,
    isEditing?: boolean,
    onSkillChange?: (key: string, level: string) => void,
    onRoll?: (name: string, mod: number) => void,
}) => {
    const proficiencyLevels = ['none', 'proficient', 'expertise'];

    const calculateMod = (skillName: string, abilityKey: AbilityKey, proficiency: string | null) => {
        const ability = props.abilities[abilityKey];
        if (!ability) return 0;
        const abilityMod = calculateAbilityMod(ability.raw);
        
        let multiplier = 0;
        if (proficiency === 'proficient') multiplier = 1;
        if (proficiency === 'expertise') multiplier = 2;
        
        return abilityMod + (props.proficiencyBonus * multiplier);
    };

    return (
        <div class="card skill-list-card">
            <div class="skill-hint">
                <span class="hint-item"><span class="proficiency-indicator" data-value="none"></span> None</span>
                <span class="hint-item"><span class="proficiency-indicator" data-value="proficient"></span> Proficient</span>
                <span class="hint-item"><span class="proficiency-indicator" data-value="expertise"></span> Expertise</span>
            </div>
            <ul class="skill-list">
                <For each={Object.entries(props.skills)}>
                    {
                        ([key, skill]) => {
                            const proficiency = () => skill.proficiency ?? 'none';
                            const mod = () => calculateMod(key, skill.ability, proficiency());
                            
                            return (
                                <li class="skill-item" onClick={() => !props.isEditing && props.onRoll?.(key.replace(/_/g, ' '), mod())}>
                                    <Show when={props.isEditing} fallback={
                                        <span class="proficiency-indicator" data-value={proficiency()}></span>
                                    }>
                                        <div class="proficiency-editor">
                                            <For each={proficiencyLevels}>
                                                {(level) => (
                                                    <label class="proficiency-radio" title={level}>
                                                        <input 
                                                            type="radio" 
                                                            name={`prof-${key}`} 
                                                            value={level} 
                                                            checked={proficiency() === level}
                                                            onInput={() => {
                                                                console.log(`Radio clicked: ${key} -> ${level}`);
                                                                props.onSkillChange?.(key, level);
                                                            }}
                                                        />
                                                        <span class="proficiency-indicator" data-value={level}></span>
                                                    </label>
                                                )}
                                            </For>
                                        </div>
                                    </Show>

                                    <div class="skill-view">
                                        {key.replace(/_/g, ' ')}
                                    </div>

                                    <div class="skill-mod">
                                        {formatModifier(calculateMod(key, skill.ability, proficiency()))}
                                    </div>

                                    <small class="skill-ability">
                                        {skill.ability}
                                    </small>
                                </li>
                            );
                        }
                    }
                </For>
            </ul>
        </div>
    );
}

interface Ability {
    raw: number;
    mod: number;
    save_proficiency?: boolean;
}
