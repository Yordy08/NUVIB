import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { destroyCloudinaryImages } from '../../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const id = getRouterParam(event, 'id'); if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Reseña inválida' })
  const database = await getDatabase(); const reviewId = new ObjectId(id); const review = await database.collection('reviews').findOne({ _id: reviewId }); if (!review) throw createError({ statusCode: 404, statusMessage: 'Reseña no encontrada' })
  await destroyCloudinaryImages([review.imageUrl, ...(review.imageUrls || [])]); await database.collection('reviews').deleteOne({ _id: reviewId }); await database.collection('admin_audit').deleteMany({ module: 'reviews', recordId: reviewId }); return { ok: true }
})
