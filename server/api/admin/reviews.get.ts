import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const query = getQuery(event); const status = typeof query.status === 'string' ? query.status : 'TODOS'; const source = typeof query.source === 'string' ? query.source : 'TODOS'; const filter: any = {}; if (status !== 'TODOS') filter.status = status; if (source !== 'TODOS') filter.source = source; if (typeof query.productId === 'string' && ObjectId.isValid(query.productId)) filter.productId = new ObjectId(query.productId)
  const database = await getDatabase(); const reviews = await database.collection('reviews').find(filter).sort({ createdAt: -1 }).limit(200).toArray(); return serializeMongo(reviews)
})
