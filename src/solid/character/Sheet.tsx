import { createStore, produce } from "solid-js/store";
import { createMemo, createSignal, For, Show, onMount, onCleanup } from "solid-js";

import { type Ability, type AbilityKey, type Character, type HealthStructure, type SkillsStructure } from '@lib/global_types';
import { calculateAbilityMod, calculateProficiencyBonus } from "@lib/character_utils";
import { auth } from "../../lib/auth";
import { client } from "../../lib/api";
import { debounce } from "es-toolkit";
import Healthbar from "./healthbar";
import AbilityCard from "./AbilityCard";
import SkillListCard from "./SkillListCard";
import NotesCard from "./NotesCard";


export default () => {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const characterId = searchParams.get('id');

    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal('');
    const [isEditing, setIsEditing] = createSignal(false);
    const [isSaving, setIsSaving] = createSignal(false);

    const [abilities, setAbilities] = createStore<Record<AbilityKey, Ability>>({
        str: { raw: 10, mod: 0 },
        dex: { raw: 10, mod: 0 },
        con: { raw: 10, mod: 0 },
        int: { raw: 10, mod: 0 },
        wis: { raw: 10, mod: 0 },
        cha: { raw: 10, mod: 0 },
    })
    const [name, setName] = createSignal('');
    const [race, setRace] = createSignal('');
    const [levels, setLevels] = createStore<Record<string, number>>({});
    const [health, setHealth] = createStore<HealthStructure>({
        max: 0,
        curr: 0,
        temp: 0
    });
    const [skills, setSkills] = createStore<SkillsStructure>({});
    const [notes, setNotes] = createStore<any[]>([]);
    const [allClasses, setAllClasses] = createStore<any[]>([]);

    const fetchCharacter = async () => {
        if (!characterId || !auth.token()) {
            setError('No character selected or not logged in');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching character details for ID:', characterId);
            const res = await client.characters[":id"].$get({
                param: { id: characterId },
                header: { 'Authorization': `Bearer ${auth.token()}` }
            });
            const data = await res.json() as any;

            if (!res.ok) throw new Error(data.error || 'Failed to fetch character');

            const char = data.character;
            console.log('Character data loaded:', char);
            
            // Populate state
            setName(char.name);
            setRace(char.race);
            setHealth({ max: char.hpMax, curr: char.hpCurr, hpTemp: char.hpTemp || 0 });
            
            // Abilities
            char.abilities.forEach((a: any) => {
                setAbilities(a.ability.key as AbilityKey, {
                    raw: a.score,
                    mod: calculateAbilityMod(a.score),
                    save_proficiency: !!a.saveProficiency
                });
            });

            // Levels
            const levelMap: Record<string, number> = {};
            char.classes.forEach((c: any) => {
                levelMap[c.class.name.toLowerCase()] = c.level;
            });
            setLevels(levelMap);

            // Skills
            const skillMap: SkillsStructure = {};
            char.skills.forEach((s: any) => {
                if (s.skill && s.skill.ability) {
                    skillMap[s.skill.key] = {
                        ability: s.skill.ability.key as AbilityKey,
                        proficiency: s.proficiencyLevel === 'none' ? null : s.proficiencyLevel
                    };
                }
            });
            setSkills(skillMap);

            // Notes
            setNotes(char.notes.map((n: any) => n.note));

            // Fetch all classes for the editor
            const classRes = await client.classes.$get();
            if (classRes.ok) {
                const classData = await classRes.json() as any;
                setAllClasses(classData.classes);
            }

        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const persistAbility = async (key: AbilityKey, score: number, save: boolean) => {
        if (!characterId || !auth.token()) return;
        console.log(`Persisting ability ${key} to backend...`);
        setIsSaving(true);
        try {
            // @ts-ignore
            const res = await client.characters[":id"].abilities[":abilityKey"].$patch({
                param: { id: characterId, abilityKey: key },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { score, saveProficiency: save }
            });
            if (res.ok) {
                console.log(`Ability ${key} saved successfully`);
            } else {
                const errData = await res.json();
                console.error(`Failed to save ability ${key}:`, errData);
            }
        } catch (err) {
            console.error('Network error updating ability', err);
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedPersistAbility = debounce(persistAbility, 1000);

    const handleAbilityChange = (key: AbilityKey, score: number, save: boolean) => {
        console.log(`Local change for ${key}: score=${score}, save=${save}`);
        setAbilities(key, (state) => ({ ...state, raw: score, save_proficiency: save, mod: calculateAbilityMod(score) }));
        debouncedPersistAbility(key, score, save);
    };

    const handleHealthUpdate = async (newHealth: HealthStructure) => {
        if (!characterId || !auth.token()) return;
        console.log('Persisting health update...');
        setIsSaving(true);
        try {
            const res = await client.characters[":id"].$patch({
                param: { id: characterId },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { 
                    hpCurr: newHealth.curr, 
                    hpMax: newHealth.max, 
                    hpTemp: newHealth.temp 
                }
            });
            if (res.ok) {
                console.log('Health saved successfully');
            } else {
                console.error('Failed to save health:', await res.json());
            }
        } catch (err) {
            console.error('Failed to update health', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkillChange = async (skillKey: string, level: string) => {
        console.log(`Local change for skill ${skillKey}: level=${level}`);
        setSkills(skillKey, 'proficiency', level === 'none' ? null : level as any);

        if (!characterId || !auth.token()) return;

        setIsSaving(true);
        try {
            console.log(`Persisting skill ${skillKey} to backend...`);
            // @ts-ignore
            const res = await client.characters[":id"].skills[":skillKey"].$patch({
                param: { id: characterId, skillKey },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { proficiencyLevel: level }
            });
            if (res.ok) {
                console.log(`Skill ${skillKey} saved successfully`);
            } else {
                const errData = await res.json();
                console.error(`Failed to save skill ${skillKey}:`, errData);
            }
        } catch (err) {
            console.error('Failed to update skill proficiency', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClassLevelChange = async (className: string, newLevel: number) => {
        if (newLevel < 1) return;
        console.log(`Changing ${className} level to ${newLevel}`);
        setLevels(className.toLowerCase(), newLevel);

        if (!characterId || !auth.token()) return;

        setIsSaving(true);
        try {
            // @ts-ignore
            const res = await client.characters[":id"].classes[":className"].$patch({
                param: { id: characterId, className },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { level: newLevel }
            });
            if (!res.ok) console.error('Failed to update class level');
        } catch (err) {
            console.error('Network error updating class level', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveClass = async (className: string) => {
        console.log(`Removing class ${className}`);
        setLevels(className.toLowerCase(), undefined as any);

        if (!characterId || !auth.token()) return;

        setIsSaving(true);
        try {
            // @ts-ignore
            const res = await client.characters[":id"].classes[":className"].$delete({
                param: { id: characterId, className },
                header: { 'Authorization': `Bearer ${auth.token()}` }
            });
            if (!res.ok) console.error('Failed to remove class');
        } catch (err) {
            console.error('Network error removing class', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddClass = async (className: string) => {
        if (!className || levels[className.toLowerCase()] !== undefined) return;
        
        console.log(`Adding class ${className}`);
        setLevels(className.toLowerCase(), 1);

        if (!characterId || !auth.token()) return;

        setIsSaving(true);
        try {
            // @ts-ignore
            const res = await client.characters[":id"].classes.$post({
                param: { id: characterId },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { className, level: 1 }
            });
            if (!res.ok) console.error('Failed to add class');
        } catch (err) {
            console.error('Network error adding class', err);
        } finally {
            setIsSaving(false);
        }
    };

    onMount(() => {
        fetchCharacter();
    });

    onCleanup(() => {
        debouncedPersistAbility.cancel();
    });

    const totalLevel = createMemo(() => Object.values(levels).reduce((sum, lvl) => sum + (lvl || 0), 0));
    const proficiencyBonus = createMemo(() => calculateProficiencyBonus(totalLevel()));

    const [activeTab, setActiveTab] = createSignal<'skills' | 'notes'>('skills');

    return (
        <Show when={!loading()} fallback={<div class="sheet-container status-msg">Seeking the hero in the ashes...</div>}>
            <Show when={!error()} fallback={<div class="sheet-container status-msg error">{error()}</div>}>
                <div class="sheet-container" classList={{ 'ui-minified': activeTab() === 'notes' }}>
                    <header class="sheet-header">
                        <div class="character-info">
                            <h1 class="char-name">{name()}</h1>
                            <div class="char-meta">
                                <span class="char-race">{race()}</span>
                                <div class="char-levels">
                                    <For each={Object.entries(levels)}>
                                        {([class_name, level]) => (
                                            <Show when={level !== undefined}>
                                                <span class="class-tag">
                                                    <Show when={isEditing()} fallback={`${class_name} ${level}`}>
                                                        <div class="class-edit-item">
                                                            <span class="class-name">{class_name}</span>
                                                            <input 
                                                                type="number" 
                                                                value={level} 
                                                                min="1" 
                                                                class="level-input"
                                                                onInput={(e) => handleClassLevelChange(class_name, parseInt(e.currentTarget.value))}
                                                            />
                                                            <button class="remove-class-btn" onClick={() => handleRemoveClass(class_name)}>&times;</button>
                                                        </div>
                                                    </Show>
                                                </span>
                                            </Show>
                                        )}
                                    </For>
                                    <Show when={isEditing()}>
                                        <div class="add-class-control">
                                            <select onChange={(e) => handleAddClass(e.currentTarget.value)}>
                                                <option value="">+ Add Class</option>
                                                <For each={allClasses}>
                                                    {(cls) => (
                                                        <Show when={levels[cls.name.toLowerCase()] === undefined}>
                                                            <option value={cls.name}>{cls.name}</option>
                                                        </Show>
                                                    )}
                                                </For>
                                            </select>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </div>
                        <div class="header-actions">
                            <Show when={isSaving()}>
                                <span class="global-save-indicator">Syncing...</span>
                            </Show>
                            <button 
                                class="scori-btn btn-small" 
                                classList={{ 'btn-secondary': isEditing() }}
                                onClick={() => setIsEditing(!isEditing())}
                            >
                                {isEditing() ? 'Finish' : 'Edit Stats'}
                            </button>
                            <div class="prof-bonus-card">
                                <label>Proficiency</label>
                                <div class="value">+{proficiencyBonus()}</div>
                            </div>
                        </div>
                    </header>

                    <Healthbar health={health} setHealth={setHealth} onUpdate={handleHealthUpdate} />
                    
                    <div class="sheet-grid">
                        <aside class="sidebar">
                            <AbilityCard
                                abilities={abilities}
                                setAbilities={setAbilities}
                                proficiencyBonus={proficiencyBonus()}
                                isEditing={isEditing()}
                                onAbilityChange={handleAbilityChange}
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
                                        isEditing={isEditing()}
                                        onSkillChange={handleSkillChange}
                                    />
                                </Show>
                                <Show when={activeTab() === 'notes'}>
                                    <NotesCard initialNotes={notes} characterId={characterId || undefined} />
                                </Show>
                            </div>
                        </main>
                    </div>
                </div>
            </Show>
        </Show>
    );
}
