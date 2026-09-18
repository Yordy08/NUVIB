import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { serializeMongo } from '../../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Pedido inválido' })
  const database = await getDatabase()
  const order = await database.collection('orders').findOne({ _id: new ObjectId(id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
  const [items, history] = await Promise.all([database.collection('order_items').find({ orderId: order._id }).toArray(), database.collection('order_status_history').find({ orderId: order._id }).sort({ changedAt: -1 }).toArray()])
  return serializeMongo({ order, items, history })
})
