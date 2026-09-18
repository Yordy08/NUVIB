import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Pedido inválido' })
  const database = await getDatabase(); const orderId = new ObjectId(id); const order = await database.collection('orders').findOne({ _id: orderId })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
  const now = new Date(); await database.collection('orders').updateOne({ _id: orderId }, { $set: { deletedAt: now, status: 'CANCELADO', updatedAt: now } }); await database.collection('order_status_history').insertOne({ orderId, orderNumber: order.orderNumber, status: 'CANCELADO', note: 'Pedido eliminado lógicamente por administración', changedAt: now, actor: session.email }); await recordAdminAction(database, session, 'PEDIDO ELIMINADO LÓGICAMENTE', 'orders', orderId, { orderNumber: order.orderNumber })
  return { ok: true }
})
