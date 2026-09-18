import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const phone = decodeURIComponent(getRouterParam(event, 'phone') || ''); if (!phone) throw createError({ statusCode: 400, statusMessage: 'Cliente inválido' })
  const database = await getDatabase(); const orders = await database.collection('orders').find({ 'customer.phone': phone }).sort({ createdAt: -1 }).toArray()
  if (!orders.length) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  const items = await database.collection('order_items').find({ orderId: { $in: orders.map(order => order._id) } }).toArray()
  return { customer: orders[0].customer, delivery: orders[0].delivery, orders, items }
})
