import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { isOrderStatus } from '../../../utils/orders'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ status?: string; note?: string; customer?: any; delivery?: any }>(event)
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Pedido inválido' })
  const database = await getDatabase()
  const orderId = new ObjectId(id)
  const current = await database.collection('orders').findOne({ _id: orderId }); if (!current) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
  const update: any = { updatedAt: new Date() }; if (body.status !== undefined) { if (!isOrderStatus(body.status)) throw createError({ statusCode: 400, statusMessage: 'Estado inválido' }); update.status = body.status }
  if (body.customer) update.customer = { name: typeof body.customer.name === 'string' ? body.customer.name.trim().slice(0, 100) : current.customer.name, phone: typeof body.customer.phone === 'string' ? body.customer.phone.trim().slice(0, 30) : current.customer.phone }
  if (body.delivery) update.delivery = { department: typeof body.delivery.department === 'string' ? body.delivery.department.trim().slice(0, 80) : current.delivery.department, city: typeof body.delivery.city === 'string' ? body.delivery.city.trim().slice(0, 80) : current.delivery.city, address: typeof body.delivery.address === 'string' ? body.delivery.address.trim().slice(0, 180) : current.delivery.address, additional: typeof body.delivery.additional === 'string' ? body.delivery.additional.trim().slice(0, 240) : current.delivery.additional }
  const statusChanged = body.status !== undefined && body.status !== current.status; const note = typeof body.note === 'string' ? body.note.slice(0, 500) : ''
  const result = await database.collection('orders').findOneAndUpdate({ _id: orderId }, { $set: update, ...(statusChanged ? { $push: { statusHistory: { status: body.status, changedAt: update.updatedAt, actor: session.email, note } } } : {}) }, { returnDocument: 'after' })
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
  if (statusChanged) await database.collection('order_status_history').insertOne({ orderId, status: body.status, note, changedAt: update.updatedAt, actor: session.email })
  await recordAdminAction(database, session, statusChanged ? 'PEDIDO CAMBIÓ DE ESTADO' : 'PEDIDO EDITADO', 'orders', orderId, { beforeStatus: current.status, afterStatus: body.status || current.status })
  return { ok: true, order: result }
})
