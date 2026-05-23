import { db } from './index';
import { abilities, skills, classes } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Core Abilities
    const coreAbilities = [
      { name: 'Strength', key: 'str' },
      { name: 'Dexterity', key: 'dex' },
      { name: 'Constitution', key: 'con' },
      { name: 'Intelligence', key: 'int' },
      { name: 'Wisdom', key: 'wis' },
      { name: 'Charisma', key: 'cha' },
    ];

    for (const ability of coreAbilities) {
      await db.insert(abilities).values(ability).onConflictDoNothing();
    }
    console.log('✅ Abilities seeded');

    // Get seeded abilities to link skills
    const allAbilities = await db.select().from(abilities);
    const getAbilityId = (key: string) => allAbilities.find(a => a.key === key)!.id;

    // 2. Core Skills
    const coreSkills = [
      { name: 'Acrobatics', key: 'acrobatics', abilityId: getAbilityId('dex') },
      { name: 'Animal Handling', key: 'animal_handling', abilityId: getAbilityId('wis') },
      { name: 'Arcana', key: 'arcana', abilityId: getAbilityId('int') },
      { name: 'Athletics', key: 'athletics', abilityId: getAbilityId('str') },
      { name: 'Deception', key: 'deception', abilityId: getAbilityId('cha') },
      { name: 'History', key: 'history', abilityId: getAbilityId('int') },
      { name: 'Insight', key: 'insight', abilityId: getAbilityId('wis') },
      { name: 'Intimidation', key: 'intimidation', abilityId: getAbilityId('cha') },
      { name: 'Investigation', key: 'investigation', abilityId: getAbilityId('int') },
      { name: 'Medicine', key: 'medicine', abilityId: getAbilityId('wis') },
      { name: 'Nature', key: 'nature', abilityId: getAbilityId('int') },
      { name: 'Perception', key: 'perception', abilityId: getAbilityId('wis') },
      { name: 'Performance', key: 'performance', abilityId: getAbilityId('cha') },
      { name: 'Persuasion', key: 'persuasion', abilityId: getAbilityId('cha') },
      { name: 'Religion', key: 'religion', abilityId: getAbilityId('int') },
      { name: 'Sleight of Hand', key: 'sleight_of_hand', abilityId: getAbilityId('dex') },
      { name: 'Stealth', key: 'stealth', abilityId: getAbilityId('dex') },
      { name: 'Survival', key: 'survival', abilityId: getAbilityId('wis') },
    ];

    for (const skill of coreSkills) {
      await db.insert(skills).values(skill).onConflictDoNothing();
    }
    console.log('✅ Skills seeded');

    // 3. Core Classes
    const coreClasses = [
      { name: 'Barbarian' }, { name: 'Bard' }, { name: 'Cleric' }, { name: 'Druid' },
      { name: 'Fighter' }, { name: 'Monk' }, { name: 'Paladin' }, { name: 'Ranger' },
      { name: 'Rogue' }, { name: 'Sorcerer' }, { name: 'Warlock' }, { name: 'Wizard' }
    ];

    for (const cls of coreClasses) {
      await db.insert(classes).values(cls).onConflictDoNothing();
    }
    console.log('✅ Classes seeded');

    console.log('✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
