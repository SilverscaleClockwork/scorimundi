import type { AbilityKey, SkillsStructure, Ability } from "./global_types";

export function calculateAbilityMod(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(totalLevel: number): number {
    return 1 + Math.ceil(totalLevel / 4);
}

export function calculateSkillMod(
    skillName: string, 
    skills: SkillsStructure, 
    abilities: Record<AbilityKey, Ability>, 
    proficiencyBonus: number
): number {
    const skill = skills[skillName];
    if (!skill) return 0;
    
    const ability = abilities[skill.ability];
    const abilityMod = calculateAbilityMod(ability.raw);
    
    let multiplier = 0;
    if (skill.proficiency === 'proficient') multiplier = 1;
    if (skill.proficiency === 'expertise') multiplier = 2;
    
    return abilityMod + (proficiencyBonus * multiplier);
}

export function formatModifier(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}
