import type { Ability, AbilityKey, Skill, SkillsStructure } from "@lib/global_types";
import { calculateSkillMod, formatModifier } from "@lib/character_utils";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    skills: SkillsStructure,
    setSkills: SetStoreFunction<SkillsStructure>,
    abilities: Record<AbilityKey, Ability>,
    proficiencyBonus: number,
}) => {
    const htmlSymb = (skill: Skill) => {
        const proficiency = skill.proficiency ?? 'none';
        const label = proficiency === 'none' ? 'not proficient in' : `${proficiency} in`;
        return <span class="proficiency-indicator" data-value={proficiency} aria-label={label}></span>
    }
    return (
        <div class="card skill-list-card">
            <ul class="skill-list">
                <For each={Object.entries(props.skills)}>
                    {
                        ([key, skill]) => (
                            <li 
                                class="skill-item"
                            >
                                {htmlSymb(skill)}
                                <div 
                                    class="skill-view" 
                                >
                                    {key}
                                </div>
                                <div class="skill-mod">
                                    {formatModifier(calculateSkillMod(key, props.skills, props.abilities, props.proficiencyBonus))}
                                </div>
                                <small class="skill-ability">
                                    {skill.ability}
                                </small>
                            </li>
                        )
                    }
                </For>
            </ul>
        </div>
    );
}