import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../../utils/auth'
import { getDatabase } from '../../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id'); const body = await readBody<{ status?: string }>(event)
  if (!id || !ObjectId.isValid(id) || !['ACTIVO', 'INACTIVO'].includes(body?.status || '')) throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  const database = await getDatabase(); const productId = new ObjectId(id); const product = await database.collection('products').findOne({ _id: productId })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const now = new Date(); const update: any = { $set: { status: body.status, updatedAt: now } }
  if (body.status === 'ACTIVO') update.$unset = { deletedAt: '' }
  await database.collection('products').updateOne({ _id: productId }, update)
  await database.collection('product_audit').insertOne({ productId, productName: product.name, action: body.status === 'ACTIVO' ? 'PRODUCTO REACTIVADO' : 'PRODUCTO DESACTIVADO', actor: session.email, createdAt: now })
  return { ok: true, status: body.status }
})
