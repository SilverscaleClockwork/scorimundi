import { createStore } from "solid-js/store";
import { createMemo, createSignal, For } from "solid-js";

import { type Ability, type AbilityKey, type Character, type HealthStructure, type SkillsStructure } from '@lib/global_types';
import Healthbar from "./healthbar";
import AbilityCard from "./AbilityCard";
import SkillListCard from "./SkillListCard";


export default () => {
    const [abilities, setAbilities] = createStore<Record<AbilityKey, Ability>>({
        str: {
            raw: 15,
            mod: -1
        },
        dex: {
            raw: 20,
            mod: 5
        },
        con: {
            raw: 12,
            mod: 1
        },
        int: {
          raw: 14,
          mod: 1  
        },
        wis: {
            raw: 16,
            mod: 3
        },
        cha: {
            raw: 8,
            mod: -1
        },
    })
    const [name, setName] = createSignal('Rose');
    const [race, setRace] = createSignal('wood_elf');
    const [levels, setLevels] = createStore({
        rogue: 9
    });
    const [health, setHealth] = createStore<HealthStructure>({
        max: 54,
        curr: 54,
        temp: 0
    });
    const [skills, setSkills] = createStore<SkillsStructure>({
        acrobatics: {
            ability: 'dex',
        },
        animal_handling: {
            ability: 'wis',
        },
        arcana: {
            ability: 'int',
        },
        athletics: {
            proficiency: 'proficient',
            ability: 'str',
        },
        deception: {
            ability: 'cha',
        },
        history: {
            ability: 'int'
        },
        insight: {
            proficiency: 'expertise',
            ability: 'wis'
        },
        intimidation: {
            ability: 'cha'
        },
        investigation: {
            proficiency: 'expertise',
            ability: 'int'
        },
        medicine: {
            ability: 'wis'
        },
        nature: {
            ability: 'int'
        },
        perception: {
            proficiency: 'proficient',
            ability: 'wis'
        },
        performance: {
            ability: 'wis'
        },
        persuasion: {
            ability: 'cha',
        },
        religion: {
            ability: 'int',
        },
        sleight_of_hand: {
            proficiency: 'expertise',
            ability: 'dex',
        },
        stealth: {
            proficiency: 'expertise',
            ability: 'dex',
        },
        survival: {
            ability: 'wis'
        }
    })

    let character = createMemo(() : Character => ({
        name: name(),
        race: race(),
        abilities: abilities,
        levels: levels,
        health: health,
        skills: skills
    }));



    return (
        <div>
            <div>
                <h1>{name()}</h1>
                <small>{race()}</small>
                
                <For each={Object.entries(levels)}>
                {
                    ([class_name, level]) => (
                        <small>{class_name} {level}</small>
                    )
                }
                </For>
            </div>
            <Healthbar health={health} setHealth={setHealth}></Healthbar>
            <AbilityCard abilities={abilities} setAbilities={setAbilities}></AbilityCard>
            <SkillListCard skills={skills} setSkills={setSkills}></SkillListCard>
        </div>
    );
}