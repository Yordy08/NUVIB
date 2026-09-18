import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { assertUniqueProductFields, validateProductInput } from '../../utils/products'
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const body = await readBody<any>(event); const productData = validateProductInput(body)
  await assertUniqueProductFields(productData)
  const now = new Date(); const product = { ...productData, createdAt: now, updatedAt: now }
  const database = await getDatabase(); const result = await database.collection('products').insertOne(product)
  await database.collection('product_audit').insertOne({ productId: result.insertedId, productName: product.name, action: 'PRODUCTO CREADO', actor: session.email, createdAt: now })
  return { ok: true, id: result.insertedId, product }
})
