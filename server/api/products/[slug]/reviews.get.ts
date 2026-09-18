import { getDatabase } from '../../../utils/mongodb'
import { serializeMongo } from '../../../utils/serialize'
import { reviewSort } from '../../../utils/reviews'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug'); const query = getQuery(event); const page = Math.max(1, Number(query.page) || 1); const limit = Math.min(20, Math.max(1, Number(query.limit) || 10)); const database = await getDatabase()
  const product = await database.collection('products').findOne({ slug, status: 'ACTIVO' }, { projection: { _id: 1 } })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const source = query.source === 'EXTERNA' ? 'EXTERNA' : 'NUVIB'; const filter = { productId: product._id, status: 'PUBLICADA', source }
  const [reviews, total, distribution] = await Promise.all([
    database.collection('reviews').find(filter).sort(reviewSort(query.sort)).skip((page - 1) * limit).limit(limit).toArray(),
    database.collection('reviews').countDocuments(filter),
    database.collection('reviews').aggregate([{ $match: filter }, { $group: { _id: '$rating', count: { $sum: 1 } } }]).toArray()
  ])
  const counts = Object.fromEntries(distribution.map(item => [item._id, item.count])); const average = total ? distribution.reduce((sum, item) => sum + item._id * item.count, 0) / total : 0
  return serializeMongo({ reviews, summary: { average: Math.round(average * 10) / 10, total, counts }, page, limit, hasMore: page * limit < total })
})
