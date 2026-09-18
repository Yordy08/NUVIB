import { ObjectId } from 'mongodb'
import { getDatabase } from '../utils/mongodb'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event); const slug = clean(body?.slug, 120); const name = clean(body?.customerName, 100); const comment = clean(body?.comment, 2000); const rating = Number(body?.rating); const phone = clean(body?.phone, 30); const orderNumber = clean(body?.orderNumber, 40)
  if (!slug || name.length < 2 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10) throw createError({ statusCode: 400, statusMessage: 'Completa nombre, calificación y comentario válido.' })
  const database = await getDatabase(); const product = await database.collection('products').findOne({ slug, status: 'ACTIVO' }, { projection: { _id: 1, name: 1 } }); if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  let verifiedPurchase = false; let orderId: ObjectId | undefined
  if (phone && orderNumber) {
    const order = await database.collection('orders').findOne({ orderNumber, 'customer.phone': phone, status: 'ENTREGADO' }, { projection: { _id: 1 } })
    if (order && await database.collection('order_items').findOne({ orderId: order._id, productId: product._id })) { verifiedPurchase = true; orderId = order._id }
  }
  const now = new Date(); const review = { productId: product._id, productName: product.name, orderId: orderId || null, customerName: name, rating, comment, imageUrl: clean(body?.imageUrl, 500) || null, recommendation: typeof body?.recommendation === 'boolean' ? body.recommendation : null, verifiedPurchase, source: 'NUVIB', status: 'PENDIENTE', hasImage: Boolean(body?.imageUrl), createdAt: now, updatedAt: now }
  const result = await database.collection('reviews').insertOne(review); return { ok: true, id: result.insertedId, verifiedPurchase, status: review.status }
})
