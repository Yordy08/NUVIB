import { getDatabase } from '../../utils/mongodb'
import { createAdminSession, verifyPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ identifier?: string; email?: string; password?: string }>(event)
  const identifier = (body?.identifier || body?.email)?.trim().toLowerCase()
  if (!identifier || !body?.password) throw createError({ statusCode: 400, statusMessage: 'Usuario y contraseña son obligatorios' })
  const user = await (await getDatabase()).collection('admin_users').findOne({ $or: [{ email: identifier }, { username: identifier }], active: true })
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) throw createError({ statusCode: 401, statusMessage: 'Credenciales incorrectas' })
  await createAdminSession(event, user)
  return { ok: true, user: { username: user.username || user.email, role: user.role } }
})
