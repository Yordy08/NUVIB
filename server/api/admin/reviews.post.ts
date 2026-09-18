import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const body = await readBody<any>(event); const productId = clean(body?.productId, 30); const rating = Number(body?.rating); const comment = clean(body?.comment, 2000); const product = ObjectId.isValid(productId) ? await getDatabase().then(database => database.collection('products').findOne({ _id: new ObjectId(productId) })) : null
  if (!product || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 5 || !clean(body?.sourceName, 100)) throw createError({ statusCode: 400, statusMessage: 'Producto, fuente, calificación y comentario son obligatorios.' })
  const now = new Date(); const review = { productId: product._id, productName: product.name, orderId: null, customerName: clean(body.customerName, 100) || 'Fuente externa', rating, comment, imageUrl: clean(body.imageUrl, 500) || null, recommendation: null, verifiedPurchase: false, source: 'EXTERNA', sourceName: clean(body.sourceName, 100), sourceUrl: clean(body.sourceUrl, 500) || null, sourceReviewId: clean(body.sourceReviewId, 120) || null, status: 'PENDIENTE', hasImage: Boolean(body.imageUrl), createdAt: now, updatedAt: now, createdBy: session.email }
  const result = await (await getDatabase()).collection('reviews').insertOne(review); return serializeMongo({ ok: true, id: result.insertedId, review })
})
