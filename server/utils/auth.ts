import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { H3Event } from 'h3'
import { getDatabase } from './mongodb'

const scryptAsync = promisify(scrypt)
const SESSION_COOKIE = 'nuvib_admin_session'
const SESSION_DAYS = 7

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, 64) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export const verifyPassword = async (password: string, stored: string) => {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const derived = await scryptAsync(password, salt, 64) as Buffer
  const expected = Buffer.from(hash, 'hex')
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex')

export const createAdminSession = async (event: H3Event, user: { _id: unknown; email: string; role: string }) => {
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await (await getDatabase()).collection('admin_sessions').insertOne({ tokenHash: tokenHash(token), userId: user._id, email: user.email, role: user.role, createdAt: now, expiresAt })
  setCookie(event, SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: SESSION_DAYS * 24 * 60 * 60, path: '/' })
}

export const getAdminSession = async (event: H3Event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const session = await (await getDatabase()).collection('admin_sessions').findOne({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } })
  return session
}

export const requireAdmin = async (event: H3Event) => {
  const session = await getAdminSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Autenticación administrativa requerida' })
  return session
}

export const clearAdminSession = async (event: H3Event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) await (await getDatabase()).collection('admin_sessions').deleteOne({ tokenHash: tokenHash(token) })
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
