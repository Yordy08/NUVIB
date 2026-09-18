import { getDatabase } from '../utils/mongodb'
import { serializeMongo } from '../utils/serialize'
import { getActivePromotionalPrice } from '../utils/conversion'

export default defineEventHandler(async () => {
  try {
    const database = await getDatabase()
    const products = await database.collection('products').find({ status: 'ACTIVO' }).sort({ createdAt: -1 }).toArray()
    return serializeMongo(products.map(product => { const price = getActivePromotionalPrice(product); return { ...product, price, image: product.images?.[0] || '/Logo/logotip.jpg', oldPrice: price < product.price ? product.price : (product.previousPrice || undefined), tag: price < product.price || product.previousPrice ? 'Oferta' : undefined } }))
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'No fue posible cargar los productos' })
  }
})
