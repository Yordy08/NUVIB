import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { syncExternalReviews } from '../../../utils/externalReviews'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const database = await getDatabase(); const products = await database.collection('products').find({ 'externalReviews.provider': { $exists: true, $ne: '' }, 'externalReviews.productId': { $exists: true, $ne: '' }, status: { $ne: 'ELIMINADO' } }).limit(100).toArray(); const results: any[] = []; const errors: any[] = []
  for (const product of products) { try { results.push({ productId: product._id, ...(await syncExternalReviews(product)) }) } catch (error: any) { errors.push({ productId: product._id, message: error?.data?.message || error?.statusMessage || 'Error de sincronización' }) } }
  return { ok: errors.length === 0, processed: products.length, synchronized: results.length, errors }
})
