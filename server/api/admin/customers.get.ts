import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event); const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : ''; const match: any = query.status === 'ELIMINADOS' ? { 'customer.deletedAt': { $exists: true } } : query.status === 'ACTIVOS' ? { 'customer.deletedAt': { $exists: false } } : {}; if (search) match.$or = [{ 'customer.name': { $regex: search, $options: 'i' } }, { 'customer.phone': { $regex: search, $options: 'i' } }]
  const database = await getDatabase(); return database.collection('orders').aggregate([{ $match: match }, { $sort: { createdAt: -1 } }, { $group: { _id: '$customer.phone', customer: { $first: '$customer' }, delivery: { $first: '$delivery' }, lastOrderAt: { $first: '$createdAt' }, orders: { $sum: 1 }, total: { $sum: '$total' } } }, { $sort: { lastOrderAt: -1 } }, { $limit: 100 }]).toArray()
})
