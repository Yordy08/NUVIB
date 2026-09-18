import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event); const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : ''; const status = typeof query.status === 'string' ? query.status : 'TODOS'; const filter: any = status === 'ELIMINADOS' ? { deletedAt: { $exists: true } } : status === 'TODOS' ? { deletedAt: { $exists: false } } : { status, deletedAt: { $exists: false } }; if (search) filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { 'customer.name': { $regex: search, $options: 'i' } }, { 'customer.phone': { $regex: search, $options: 'i' } }]
  const database = await getDatabase(); return serializeMongo(await database.collection('orders').find(filter, { projection: { customer: 1, delivery: 1, orderNumber: 1, total: 1, status: 1, createdAt: 1, updatedAt: 1, deletedAt: 1 } }).sort({ createdAt: -1 }).limit(100).toArray())
})
