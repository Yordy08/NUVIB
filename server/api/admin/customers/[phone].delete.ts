import { requireAdmin as auth } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await auth(event); const phone = decodeURIComponent(getRouterParam(event, 'phone') || ''); if (!phone) throw createError({ statusCode: 400, statusMessage: 'Cliente inválido' })
  const database = await getDatabase(); const orders = await database.collection('orders').find({ 'customer.phone': phone }, { projection: { _id: 1 } }).toArray(); if (!orders.length) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  const now = new Date(); await database.collection('orders').updateMany({ 'customer.phone': phone }, { $set: { 'customer.deletedAt': now, updatedAt: now } }); await recordAdminAction(database, session, 'CLIENTE ELIMINADO LÓGICAMENTE', 'customers', phone, { ordersUpdated: orders.length }); return { ok: true, ordersUpdated: orders.length }
})
