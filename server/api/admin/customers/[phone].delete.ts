import { requireAdmin as auth } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await auth(event); const phone = decodeURIComponent(getRouterParam(event, 'phone') || ''); if (!phone) throw createError({ statusCode: 400, statusMessage: 'Cliente inválido' })
  const database = await getDatabase(); const orders = await database.collection('orders').find({ 'customer.phone': phone }, { projection: { _id: 1 } }).toArray(); if (!orders.length) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  const orderIds = orders.map(order => order._id); await database.collection('order_status_history').deleteMany({ orderId: { $in: orderIds } }); await database.collection('order_items').deleteMany({ orderId: { $in: orderIds } }); await database.collection('orders').deleteMany({ _id: { $in: orderIds } }); await database.collection('admin_audit').deleteMany({ module: 'customers', recordId: phone }); return { ok: true, ordersDeleted: orders.length }
})
