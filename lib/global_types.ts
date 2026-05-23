
export type AbilityKey = 'str'|'dex'|'con'|'wis'|'cha'|'int';

export interface Ability {
    raw: number,
    mod: number,
    save_proficiency?: boolean,
}

export interface Skill {
    proficiency?: null | 'proficient' | 'expertise',
    ability: AbilityKey,
}
export type SkillsStructure = Record<string, Skill>

export type HealthTypes = 'curr' | 'max' | 'temp';
export type HealthStructure = Record<HealthTypes, number>;

export interface Character {
    name: string,
    race: string,
    abilities: Record<AbilityKey, Ability>,
    health: HealthStructure,
    levels: Record<string, number>,
    skills: SkillsStructure
};