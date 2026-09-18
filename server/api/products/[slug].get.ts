import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'
import { getActivePromotionalPrice } from '../../utils/conversion'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const product = await (await getDatabase()).collection('products').findOne({ slug, status: 'ACTIVO' })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const price = getActivePromotionalPrice(product); return serializeMongo({ ...product, price, images: product.images?.length ? product.images : ['/Logo/logotip.jpg'], image: product.images?.[0] || '/Logo/logotip.jpg', oldPrice: price < product.price ? product.price : (product.previousPrice || undefined) })
})
