import { sqliteTable, text, integer, unique, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  race: text('race').notNull(),
  hpMax: integer('hp_max').notNull().default(0),
  hpCurr: integer('hp_curr').notNull().default(0),
  hpTemp: integer('hp_temp').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const charactersRelations = relations(characters, ({ many }) => ({
  classes: many(characterClasses),
  abilities: many(characterAbilities),
  skills: many(characterSkills),
  notes: many(characterNotes),
}));

// Lookup table for core classes (Rogue, Fighter, etc.)
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
});

// Associative table for multi-classing
export const characterClasses = sqliteTable('character_classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: text('character_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  classId: integer('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  level: integer('level').notNull().default(1),
}, (t) => ({
  unq: unique().on(t.characterId, t.classId)
}));

export const characterClassesRelations = relations(characterClasses, ({ one }) => ({
  character: one(characters, { fields: [characterClasses.characterId], references: [characters.id] }),
  class: one(classes, { fields: [characterClasses.classId], references: [classes.id] }),
}));

// Lookup table for core abilities (STR, DEX, etc.)
export const abilities = sqliteTable('abilities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
});

// Character's specific ability scores
export const characterAbilities = sqliteTable('character_abilities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: text('character_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  abilityId: integer('ability_id').references(() => abilities.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull().default(10),
  saveProficiency: integer('save_proficiency', { mode: 'boolean' }).notNull().default(false),
}, (t) => ({
  unq: unique().on(t.characterId, t.abilityId)
}));

export const characterAbilitiesRelations = relations(characterAbilities, ({ one }) => ({
  character: one(characters, { fields: [characterAbilities.characterId], references: [characters.id] }),
  ability: one(abilities, { fields: [characterAbilities.abilityId], references: [abilities.id] }),
}));

// Lookup table for skills (Acrobatics, Stealth, etc.)
export const skills = sqliteTable('skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  abilityId: integer('ability_id').references(() => abilities.id, { onDelete: 'cascade' }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  ability: one(abilities, { fields: [skills.abilityId], references: [abilities.id] }),
}));

// Character's specific skill proficiencies
export const characterSkills = sqliteTable('character_skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: text('character_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  skillId: integer('skill_id').references(() => skills.id, { onDelete: 'cascade' }).notNull(),
  proficiencyLevel: text('proficiency_level').notNull().default('none'), // 'none', 'proficient', 'expertise'
}, (t) => ({
  unq: unique().on(t.characterId, t.skillId)
}));

export const characterSkillsRelations = relations(characterSkills, ({ one }) => ({
  character: one(characters, { fields: [characterSkills.characterId], references: [characters.id] }),
  skill: one(skills, { fields: [characterSkills.skillId], references: [skills.id] }),
}));

// The core, abstract note entity
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Associative table linking a note to a character
export const characterNotes = sqliteTable('character_notes', {
  characterId: text('character_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  noteId: integer('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.characterId, t.noteId] }),
}));

export const characterNotesRelations = relations(characterNotes, ({ one }) => ({
  character: one(characters, { fields: [characterNotes.characterId], references: [characters.id] }),
  note: one(notes, { fields: [characterNotes.noteId], references: [notes.id] }),
}));
