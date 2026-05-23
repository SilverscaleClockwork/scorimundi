import { createStore } from "solid-js/store";
import { createMemo, createSignal, For, Show } from "solid-js";

import { type Ability, type AbilityKey, type Character, type HealthStructure, type SkillsStructure } from '@lib/global_types';
import { calculateAbilityMod, calculateProficiencyBonus } from "@lib/character_utils";
import Healthbar from "./healthbar";
import AbilityCard from "./AbilityCard";
import SkillListCard from "./SkillListCard";
import NotesCard from "./NotesCard";


export default () => {
    const [abilities, setAbilities] = createStore<Record<AbilityKey, Ability>>({
        str: {
            raw: 15,
            mod: calculateAbilityMod(15)
        },
        dex: {
            raw: 20,
            mod: calculateAbilityMod(20),
            save_proficiency: true
        },
        con: {
            raw: 12,
            mod: calculateAbilityMod(12)
        },
        int: {
            raw: 14,
            mod: calculateAbilityMod(14),
            save_proficiency: true
        },
        wis: {
            raw: 16,
            mod: calculateAbilityMod(16)
        },
        cha: {
            raw: 8,
            mod: calculateAbilityMod(8)
        },
    })
    const [name, setName] = createSignal('Rose');
    const [race, setRace] = createSignal('wood_elf');
    const [levels, setLevels] = createStore({
        rogue: 9
    });

    const totalLevel = createMemo(() => Object.values(levels).reduce((sum, lvl) => sum + lvl, 0));
    const proficiencyBonus = createMemo(() => calculateProficiencyBonus(totalLevel()));

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

    const [activeTab, setActiveTab] = createSignal<'skills' | 'notes'>('skills');

    let character = createMemo((): Character => ({
        name: name(),
        race: race(),
        abilities: abilities,
        levels: levels,
        health: health,
        skills: skills
    }));



    return (
        <div class="sheet-container" classList={{ 'ui-minified': activeTab() === 'notes' }}>
            <header class="sheet-header">
                <div class="character-info">
                    <h1 class="char-name">{name()}</h1>
                    <div class="char-meta">
                        <span class="char-race">{race()}</span>
                        <div class="char-levels">
                            <For each={Object.entries(levels)}>
                                {([class_name, level]) => (
                                    <span class="class-tag">{class_name} {level}</span>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
                <div class="prof-bonus-card">
                    <label>Proficiency</label>
                    <div class="value">+{proficiencyBonus()}</div>
                </div>
            </header>

            <Healthbar health={health} setHealth={setHealth} />
            
            <div class="sheet-grid">
                <aside class="sidebar">
                    <AbilityCard
                        abilities={abilities}
                        setAbilities={setAbilities}
                        proficiencyBonus={proficiencyBonus()}
                    />
                </aside>

                <main class="main-content">
                    <nav class="sheet-tabs">
                        <button 
                            class="tab-btn" 
                            classList={{ active: activeTab() === 'skills' }}
                            onClick={() => setActiveTab('skills')}
                        >
                            Skills
                        </button>
                        <button 
                            class="tab-btn" 
                            classList={{ active: activeTab() === 'notes' }}
                            onClick={() => setActiveTab('notes')}
                        >
                            Notes
                        </button>
                    </nav>

                    <div class="tab-content">
                        <Show when={activeTab() === 'skills'}>
                            <SkillListCard
                                skills={skills}
                                setSkills={setSkills}
                                abilities={abilities}
                                proficiencyBonus={proficiencyBonus()}
                            />
                        </Show>
                        <Show when={activeTab() === 'notes'}>
                            <NotesCard />
                        </Show>
                    </div>
                </main>
            </div>
        </div>
    );
}
