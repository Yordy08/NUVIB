import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../../../utils/auth'
import { getDatabase } from '../../../../../utils/mongodb'
import { syncExternalReviews } from '../../../../../utils/externalReviews'
import { recordAdminAction } from '../../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id'); if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Producto inválido' })
  const database = await getDatabase(); const product = await database.collection('products').findOne({ _id: new ObjectId(id) }); if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  try { const result = await syncExternalReviews(product); await recordAdminAction(database, session, 'RESEÑAS EXTERNAS SINCRONIZADAS', 'products', product._id, { provider: result.provider, count: result.count }); return { ok: true, ...result } } catch (error: any) { await database.collection('products').updateOne({ _id: product._id }, { $set: { 'externalReviews.lastSyncError': error?.data?.message || error?.statusMessage || 'No fue posible sincronizar las reseñas.', 'externalReviews.lastSyncAttemptAt': new Date() } }); throw error }
})
