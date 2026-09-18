import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Producto inválido' })
  const database = await getDatabase(); const productId = new ObjectId(id); const product = await database.collection('products').findOne({ _id: productId })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const orderCount = await database.collection('order_items').countDocuments({ productId })
  const now = new Date()
  if (orderCount) {
    await database.collection('products').updateOne({ _id: productId }, { $set: { status: 'ELIMINADO', deletedAt: now, updatedAt: now } })
    await database.collection('product_audit').insertOne({ productId, productName: product.name, action: 'PRODUCTO ELIMINADO LÓGICAMENTE', actor: session.email, orderCount, createdAt: now })
    return { ok: true, mode: 'soft', message: 'El producto tiene pedidos históricos y fue desactivado para conservarlos.' }
  }
  await database.collection('products').deleteOne({ _id: productId })
  await database.collection('product_audit').insertOne({ productId, productName: product.name, action: 'PRODUCTO ELIMINADO', actor: session.email, createdAt: now })
  return { ok: true, mode: 'hard' }
})
