import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { REVIEW_STATUSES } from '../../../utils/reviews'
import { recordAdminAction } from '../../../utils/audit'
import { serializeMongo } from '../../../utils/serialize'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id'); const body = await readBody<any>(event); if (!id || !ObjectId.isValid(id) || !REVIEW_STATUSES.includes(body?.status)) throw createError({ statusCode: 400, statusMessage: 'Reseña o estado inválido' })
  const database = await getDatabase(); const reviewId = new ObjectId(id); const current = await database.collection('reviews').findOne({ _id: reviewId }); if (!current) throw createError({ statusCode: 404, statusMessage: 'Reseña no encontrada' })
  const update: any = { status: body.status, updatedAt: new Date(), moderatedBy: session.email }; if (typeof body.comment === 'string' && body.comment.trim()) { update.comment = body.comment.trim().slice(0, 2000); update.editedByAdmin = true }
  const result = await database.collection('reviews').findOneAndUpdate({ _id: reviewId }, { $set: update }, { returnDocument: 'after' }); await recordAdminAction(database, session, `RESEÑA ${body.status}`, 'reviews', reviewId, { productId: current.productId, edited: Boolean(update.editedByAdmin) }); return serializeMongo({ ok: true, review: result })
})
