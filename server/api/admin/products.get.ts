import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event); const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : ''; const status = typeof query.status === 'string' ? query.status : 'TODOS'
  const filter: any = status === 'ELIMINADOS' ? { status: 'ELIMINADO' } : status === 'TODOS' ? { status: { $ne: 'ELIMINADO' } } : { status }
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }]
  const database = await getDatabase(); const products = await database.collection('products').find(filter).sort({ updatedAt: -1 }).toArray()
  const categories = await database.collection('products').distinct('category')
  return { products: serializeMongo(products), categories: categories.filter(Boolean).sort() }
})
