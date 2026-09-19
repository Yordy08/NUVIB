import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Pedido inválido' })
  const database = await getDatabase(); const orderId = new ObjectId(id); const order = await database.collection('orders').findOne({ _id: orderId })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
  await database.collection('order_status_history').deleteMany({ orderId }); await database.collection('order_items').deleteMany({ orderId }); await database.collection('orders').deleteOne({ _id: orderId }); await database.collection('admin_audit').deleteMany({ module: 'orders', recordId: orderId })
  return { ok: true }
})
