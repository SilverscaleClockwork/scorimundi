import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    message: 'Scorimundi API - Ash and Fire'
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = 3001
console.log(`🔥 API is burning on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
