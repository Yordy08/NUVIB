import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { assertUniqueProductFields, validateProductInput } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Producto inválido' })

  const session = await requireAdmin(event); const body = await readBody<any>(event); const database = await getDatabase(); const current = await database.collection('products').findOne({ _id: new ObjectId(id) })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const update = validateProductInput(body, current); await assertUniqueProductFields(update, current._id)
  const result = await database.collection('products').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: 'after' }
  )
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  await database.collection('product_audit').insertOne({ productId: current._id, productName: update.name, action: update.status !== current.status ? `PRODUCTO ${update.status === 'ACTIVO' ? 'REACTIVADO' : 'DESACTIVADO'}` : 'PRODUCTO EDITADO', actor: session.email, changes: { before: { name: current.name, price: current.price, stock: current.stock, status: current.status }, after: { name: update.name, price: update.price, stock: update.stock, status: update.status } }, createdAt: update.updatedAt })
  return { ok: true, product: result }
})
