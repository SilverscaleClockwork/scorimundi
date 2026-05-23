import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import * as argon2 from 'argon2'
import { eq, and } from 'drizzle-orm'
import { db } from './db/index'
import { users, characters, characterAbilities, abilities, characterClasses, classes, characterSkills, skills, notes, characterNotes } from './db/schema'
import 'dotenv/config'
import { pino } from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

const app = new Hono()
const api = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'ash-and-fire-secret-key-123'
const BUNNY_SECRET = process.env.BUNNY_SECRET

// --- Global CDN Security ---
if (BUNNY_SECRET) {
  app.use('*', async (c, next) => {
    const incomingSecret = c.req.header('X-Bunny-Secret')
    if (incomingSecret !== BUNNY_SECRET) {
      logger.warn({ 
        url: c.req.url,
        method: c.req.method,
        ip: c.req.header('x-forwarded-for') 
      }, 'Global access denied: Invalid or missing X-Bunny-Secret header')
      return c.text('Forbidden: Direct access is restricted', 403)
    }
    await next()
  })
}

// --- Middleware ---
api.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.info(`${c.req.method} ${c.req.url} ${c.res.status} - ${ms}ms`)
})

api.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: false,
}))

// Global error handler
api.onError((err, c) => {
  logger.error(err, 'Global API Error')
  return c.json({ error: 'Internal Server Error', details: err.message }, 500)
})

api.get('/', (c) => {
  return c.json({
    message: 'Scorimundi API - Ash and Fire'
  })
})

// --- Registration ---
api.post('/auth/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json()

    if (!username || !email || !password) {
      return c.json({ error: 'All fields are required' }, 400)
    }

    // Hash password with argon2
    const hashedPassword = await argon2.hash(password)

    logger.info({ username, email }, 'Attempting to register user')

    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
    }).returning()

    return c.json({ 
        message: 'User registered successfully', 
        user: { id: newUser.id, username: newUser.username, email: newUser.email } 
    }, 201)
  } catch (err: any) {
    logger.error(err, 'Registration Error')
    
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: 'Username or email already exists' }, 409)
    }
    throw err
  }
})

// --- Login ---
api.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user || !(await argon2.verify(user.password, password))) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    }
    const token = await sign(payload, JWT_SECRET)

    logger.info({ userId: user.id }, 'User logged in')

    return c.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    })
  } catch (err: any) {
    logger.error(err, 'Login Error')
    throw err
  }
})

// --- Profile (Protected Example) ---
api.get('/auth/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ user: payload })
})

// --- Characters ---
api.get('/characters', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any
    const userId = Number(payload.sub)

    const userCharacters = await db.select().from(characters).where(eq(characters.userId, userId))
    
    return c.json({ characters: userCharacters })
  } catch (err: any) {
    logger.error(err, 'Fetch Characters Error')
    throw err
  }
})

api.get('/characters/:id', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any
    const userId = Number(payload.sub)
    const charId = c.req.param('id')

    const char = await db.query.characters.findFirst({
      where: and(eq(characters.id, charId), eq(characters.userId, userId)),
      with: {
        classes: { with: { class: true } },
        abilities: { with: { ability: true } },
        skills: { with: { skill: { with: { ability: true } } } },
        notes: { with: { note: true } }
      }
    })

    if (!char) return c.json({ error: 'Character not found' }, 404)
    return c.json({ character: char })
  } catch (err: any) {
    logger.error(err, 'Fetch Detailed Character Error')
    throw err
  }
})

api.post('/characters', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  try {
    const payload = c.get('jwtPayload') as any
    const userId = Number(payload.sub)
    const { name, race } = await c.req.json()

    if (!name || !race) {
      return c.json({ error: 'Name and race are required' }, 400)
    }

    // 1. Create the character
    const [newCharacter] = await db.insert(characters).values({
      userId,
      name,
      race,
      hpMax: 10,
      hpCurr: 10,
    }).returning()

    // 2. Initialize abilities (Default 10)
    const allAbilities = await db.select().from(abilities)
    for (const ability of allAbilities) {
      await db.insert(characterAbilities).values({
        characterId: newCharacter.id,
        abilityId: ability.id,
        score: 10,
      })
    }

    // 3. Initialize skills (Default none)
    const allSkills = await db.select().from(skills)
    for (const skill of allSkills) {
      await db.insert(characterSkills).values({
        characterId: newCharacter.id,
        skillId: skill.id,
        proficiencyLevel: 'none',
      })
    }

    // 4. Initialize first note
    const [initialNote] = await db.insert(notes).values({
        userId,
        title: 'Background',
        content: 'Your journey starts here...',
    }).returning()

    await db.insert(characterNotes).values({
        characterId: newCharacter.id,
        noteId: initialNote.id,
    })

    logger.info({ characterId: newCharacter.id }, 'Character created with stats and initial note')

    return c.json({ character: newCharacter }, 201)
  } catch (err: any) {
    logger.error(err, 'Create Character Error')
    throw err
  }
})

// Update character health or meta
api.patch('/characters/:id', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
      const payload = c.get('jwtPayload') as any
      const userId = Number(payload.sub)
      const charId = c.req.param('id')
      const body = await c.req.json()
  
      logger.info({ charId, userId, body }, 'PATCH /characters/:id - Received update request');

      await db.update(characters)
        .set(body)
        .where(and(eq(characters.id, charId), eq(characters.userId, userId)))
  
      return c.json({ success: true })
    } catch (err: any) {
      logger.error(err, 'Update Character Error')
      throw err
    }
})

// Update character ability
api.patch('/characters/:id/abilities/:abilityKey', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const abilityKey = c.req.param('abilityKey')
        const { score, saveProficiency } = await c.req.json()

        logger.info({ charId, abilityKey, score, saveProficiency }, 'PATCH /characters/:id/abilities/:abilityKey - Received update request');

        // Verify character ownership
        const char = await db.select().from(characters).where(and(eq(characters.id, charId), eq(characters.userId, userId))).limit(1)
        if (char.length === 0) {
            logger.warn({ charId, userId }, 'Unauthorized ability update attempt');
            return c.json({ error: 'Not authorized' }, 403)
        }

        const [targetAbility] = await db.select().from(abilities).where(eq(abilities.key, abilityKey)).limit(1)
        if (!targetAbility) {
            logger.warn({ abilityKey }, 'Ability not found');
            return c.json({ error: 'Ability not found' }, 404)
        }

        await db.update(characterAbilities)
            .set({ score, saveProficiency })
            .where(and(eq(characterAbilities.characterId, charId), eq(characterAbilities.abilityId, targetAbility.id)))

        return c.json({ success: true })
    } catch (err: any) {
        logger.error(err, 'Update Ability Error')
        throw err
    }
})

// --- Classes ---
api.get('/classes', async (c) => {
    try {
        const allClassesLink = await db.select().from(classes)
        return c.json({ classes: allClassesLink })
    } catch (err: any) {
        logger.error(err, 'Fetch Classes Error')
        throw err
    }
})

api.post('/characters/:id/classes', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const { className, level } = await c.req.json()

        logger.info({ charId, className, level }, 'Adding class to character')

        // Verify ownership
        const [char] = await db.select().from(characters).where(and(eq(characters.id, charId), eq(characters.userId, userId))).limit(1)
        if (!char) return c.json({ error: 'Not authorized' }, 403)

        const [targetClass] = await db.select().from(classes).where(eq(classes.name, className)).limit(1)
        if (!targetClass) return c.json({ error: 'Class not found' }, 404)

        const [newCharClass] = await db.insert(characterClasses).values({
            characterId: charId,
            classId: targetClass.id,
            level: level || 1
        }).returning()

        return c.json({ characterClass: newCharClass }, 201)
    } catch (err: any) {
        logger.error(err, 'Add Character Class Error')
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Character already has this class' }, 409)
        }
        throw err
    }
})

api.patch('/characters/:id/classes/:className', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const className = c.req.param('className')
        const { level } = await c.req.json()

        logger.info({ charId, className, level }, 'Updating character class level')

        // Verify ownership
        const [char] = await db.select().from(characters).where(and(eq(characters.id, charId), eq(characters.userId, userId))).limit(1)
        if (!char) return c.json({ error: 'Not authorized' }, 403)

        const [targetClass] = await db.select().from(classes).where(eq(classes.name, className)).limit(1)
        if (!targetClass) return c.json({ error: 'Class not found' }, 404)

        await db.update(characterClasses)
            .set({ level })
            .where(and(eq(characterClasses.characterId, charId), eq(characterClasses.classId, targetClass.id)))

        return c.json({ success: true })
    } catch (err: any) {
        logger.error(err, 'Update Character Class Error')
        throw err
    }
})

api.delete('/characters/:id/classes/:className', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const className = c.req.param('className')

        logger.info({ charId, className }, 'Removing class from character')

        // Verify ownership
        const [char] = await db.select().from(characters).where(and(eq(characters.id, charId), eq(characters.userId, userId))).limit(1)
        if (!char) return c.json({ error: 'Not authorized' }, 403)

        const [targetClass] = await db.select().from(classes).where(eq(classes.name, className)).limit(1)
        if (!targetClass) return c.json({ error: 'Class not found' }, 404)

        await db.delete(characterClasses)
            .where(and(eq(characterClasses.characterId, charId), eq(characterClasses.classId, targetClass.id)))

        return c.json({ success: true })
    } catch (err: any) {
        logger.error(err, 'Remove Character Class Error')
        throw err
    }
})

// --- Notes ---
api.post('/characters/:id/notes', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const { title, content } = await c.req.json()

        logger.info({ charId, userId, title }, 'Creating note for character')

        // Verify ownership
        const char = await db.query.characters.findFirst({
            where: and(eq(characters.id, charId), eq(characters.userId, userId))
        })
        
        if (!char) {
            logger.warn({ charId, userId }, 'Unauthorized note creation attempt')
            return c.json({ error: 'Not authorized' }, 403)
        }

        const [newNote] = await db.insert(notes).values({
            userId,
            title: title || 'New Note',
            content: content || '',
        }).returning()

        await db.insert(characterNotes).values({
            characterId: charId,
            noteId: newNote.id
        })

        logger.info({ noteId: newNote.id }, 'Note created successfully')
        return c.json({ note: newNote }, 201)
    } catch (err: any) {
        logger.error(err, 'Create Note Error')
        throw err
    }
})

api.patch('/notes/:id', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const noteId = parseInt(c.req.param('id'))
        const body = await c.req.json()

        logger.info({ noteId, userId }, 'Updating note')

        if (isNaN(noteId)) return c.json({ error: 'Invalid note ID' }, 400)

        const [updatedNote] = await db.update(notes)
            .set({ 
                title: body.title,
                content: body.content,
                updatedAt: new Date() 
            })
            .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
            .returning()

        if (!updatedNote) {
            logger.warn({ noteId, userId }, 'Note update failed: Note not found or unauthorized')
            return c.json({ error: 'Note not found' }, 404)
        }

        logger.info({ noteId }, 'Note updated successfully')
        return c.json({ note: updatedNote })
    } catch (err: any) {
        logger.error(err, 'Update Note Error')
        throw err
    }
})

api.delete('/notes/:id', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const noteId = parseInt(c.req.param('id'))

        if (isNaN(noteId)) return c.json({ error: 'Invalid note ID' }, 400)

        // Find the character linked to this note
        const charNote = await db.query.characterNotes.findFirst({
            where: eq(characterNotes.noteId, noteId)
        })

        if (charNote) {
            // Check if this is the last note for the character
            const otherNotes = await db.select().from(characterNotes).where(eq(characterNotes.characterId, charNote.characterId))
            if (otherNotes.length <= 1) {
                return c.json({ error: 'Cannot delete the last note of a character' }, 400)
            }
        }

        // Delete note only if it belongs to the user
        const result = await db.delete(notes)
            .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
            .returning()

        if (result.length === 0) return c.json({ error: 'Note not found or unauthorized' }, 404)

        logger.info({ noteId }, 'Note deleted successfully')
        return c.json({ success: true })
    } catch (err: any) {
        logger.error(err, 'Delete Note Error')
        throw err
    }
})

// Update character skill
api.patch('/characters/:id/skills/:skillKey', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
    try {
        const payload = c.get('jwtPayload') as any
        const userId = Number(payload.sub)
        const charId = c.req.param('id')
        const skillKey = c.req.param('skillKey')
        const { proficiencyLevel } = await c.req.json()

        logger.info({ charId, skillKey, proficiencyLevel }, 'PATCH /characters/:id/skills/:skillKey - Received update request');

        // Verify character ownership
        const char = await db.select().from(characters).where(and(eq(characters.id, charId), eq(characters.userId, userId))).limit(1)
        if (char.length === 0) {
            logger.warn({ charId, userId }, 'Unauthorized skill update attempt');
            return c.json({ error: 'Not authorized' }, 403)
        }

        const [targetSkill] = await db.select().from(skills).where(eq(skills.key, skillKey)).limit(1)
        if (!targetSkill) {
            logger.warn({ skillKey }, 'Skill not found');
            return c.json({ error: 'Skill not found' }, 404)
        }

        await db.update(characterSkills)
            .set({ proficiencyLevel })
            .where(and(eq(characterSkills.characterId, charId), eq(characterSkills.skillId, targetSkill.id)))

        return c.json({ success: true })
    } catch (err: any) {
        logger.error(err, 'Update Skill Error')
        throw err
    }
})

// --- Mounting ---
app.route('/api', api)

// --- Static Serving (Frontend) ---
app.use('/*', serveStatic({ root: '../dist' }))
app.use('/*', serveStatic({ path: 'index.html', root: '../dist' }))

const port = parseInt(process.env.PORT || '3001')
logger.info(`🔥 Scorimundi is burning on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

export type AppType = typeof api;
