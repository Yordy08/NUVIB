import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const oldPhone = decodeURIComponent(getRouterParam(event, 'phone') || ''); const body = await readBody<any>(event)
  if (!oldPhone || typeof body?.name !== 'string' || body.name.trim().length < 3 || typeof body?.phone !== 'string' || body.phone.trim().length < 7) throw createError({ statusCode: 400, statusMessage: 'Nombre y teléfono válidos son obligatorios' })
  const database = await getDatabase(); const current = await database.collection('orders').findOne({ 'customer.phone': oldPhone }); if (!current) throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  const customer = { ...current.customer, name: body.name.trim().slice(0, 100), phone: body.phone.trim().slice(0, 30) }; const delivery = { ...current.delivery, country: typeof body.country === 'string' ? body.country.trim().slice(0, 60) : current.delivery.country, department: typeof body.department === 'string' ? body.department.trim().slice(0, 80) : current.delivery.department, city: typeof body.city === 'string' ? body.city.trim().slice(0, 80) : current.delivery.city, address: typeof body.address === 'string' ? body.address.trim().slice(0, 180) : current.delivery.address, additional: typeof body.additional === 'string' ? body.additional.trim().slice(0, 240) : current.delivery.additional }
  const result = await database.collection('orders').updateMany({ 'customer.phone': oldPhone }, { $set: { customer, delivery, updatedAt: new Date() } }); await recordAdminAction(database, session, 'CLIENTE EDITADO', 'customers', oldPhone, { ordersUpdated: result.modifiedCount, newPhone: customer.phone }); return { ok: true, ordersUpdated: result.modifiedCount, customer, delivery }
})
