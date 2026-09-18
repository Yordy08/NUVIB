import { getAdminSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Sesión expirada' })
  return { email: session.email, role: session.role }
})
