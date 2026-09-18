import { requireAdmin } from '../../utils/auth'
import { ORDER_STATUSES } from '../../utils/orders'
import { getDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const database = await getDatabase()
  const grouped = await database.collection('orders').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray()
  const statuses = Object.fromEntries(ORDER_STATUSES.map(status => [status, grouped.find(item => item._id === status)?.count || 0]))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [recentOrders, todayOrders, activeVisitors, products, publications] = await Promise.all([
    database.collection('orders').find({}, { projection: { orderNumber: 1, customer: 1, total: 1, status: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(5).toArray(),
    database.collection('orders').countDocuments({ createdAt: { $gte: today } }),
    database.collection('visitor_sessions').countDocuments({ lastActivityAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
    database.collection('products').countDocuments({ status: 'ACTIVO' }),
    database.collection('publications').countDocuments({ status: 'PUBLICADA' })
  ])
  return { statuses, products, publications, recentOrders, todayOrders, activeVisitors }
})
