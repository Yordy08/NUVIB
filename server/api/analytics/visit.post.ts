import { randomBytes } from 'node:crypto'
import { getDatabase } from '../../utils/mongodb'

const visitorCookie = 'nuvib_visitor'
const activeWindowMs = 5 * 60 * 1000

export default defineEventHandler(async (event) => {
  let visitorId = getCookie(event, visitorCookie)
  if (!visitorId || !/^[a-f0-9]{32}$/.test(visitorId)) {
    visitorId = randomBytes(16).toString('hex')
    setCookie(event, visitorCookie, visitorId, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' })
  }
  const body = await readBody<{ path?: string; productSlug?: string }>(event).catch(() => ({}))
  const now = new Date()
  const day = now.toISOString().slice(0, 10)
  const database = await getDatabase()
  const path = typeof body?.path === 'string' ? body.path.slice(0, 180) : '/'; const pathProduct = path.match(/^\/producto\/([^/?#]+)/)?.[1]; const productSlug = typeof body?.productSlug === 'string' ? body.productSlug.slice(0, 120) : pathProduct || null
  await database.collection('visitor_sessions').updateOne({ visitorId }, { $set: { visitorId, lastActivityAt: now, lastPath: path, activeProductSlug: productSlug, updatedAt: now }, $setOnInsert: { firstSeenAt: now } }, { upsert: true })
  await database.collection('visits').updateOne({ visitorId, day }, { $set: { lastActivityAt: now, lastPath: typeof body?.path === 'string' ? body.path.slice(0, 180) : '/' }, $setOnInsert: { visitorId, day, visitedAt: now } }, { upsert: true })
  if (productSlug) await database.collection('product_visits').updateOne({ visitorId, productSlug, day }, { $set: { lastActivityAt: now, lastPath: path }, $setOnInsert: { visitorId, productSlug, day, visitedAt: now } }, { upsert: true })
  const activeSince = new Date(now.getTime() - activeWindowMs)
  const active = await database.collection('visitor_sessions').countDocuments({ lastActivityAt: { $gte: activeSince } })
  const activeProduct = productSlug ? await database.collection('visitor_sessions').countDocuments({ activeProductSlug: productSlug, lastActivityAt: { $gte: activeSince } }) : 0
  return { ok: true, active, activeProduct }
})
