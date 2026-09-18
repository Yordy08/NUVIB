import { getDatabase } from '../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })
  const database = await getDatabase()
  const storedOrder = await database.collection('orders').findOne({ publicToken: token })
  if (!storedOrder) throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })
  const items = await database.collection('order_items').find({ orderId: storedOrder._id }).project({ _id: 0, orderId: 0, productId: 0 }).toArray()
  const history = await database.collection('order_status_history').find({ orderId: storedOrder._id }).sort({ changedAt: 1 }).project({ _id: 0, orderId: 0, actor: 0 }).toArray()
  const { _id, publicToken, customer, delivery, ...order } = storedOrder
  return { order: { ...order, customer: { name: customer.name }, delivery: { department: delivery.department, city: delivery.city } }, items, history }
})
