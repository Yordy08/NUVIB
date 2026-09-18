import { getDatabase } from '../utils/mongodb'

export default defineEventHandler(async () => {
  try {
    const database = await getDatabase()
    await database.command({ ping: 1 })
    return { ok: true, database: database.databaseName }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'No fue posible conectar con la base de datos' })
  }
})
