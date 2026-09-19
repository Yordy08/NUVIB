import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'
import { getActivePromotionalPrice } from '../../utils/conversion'
import { getProductImages } from '../../utils/products'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const product = await (await getDatabase()).collection('products').findOne({ slug, status: 'ACTIVO' })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const price = getActivePromotionalPrice(product); const images = getProductImages(product); return serializeMongo({ ...product, price, images: images.length ? images : ['/Logo/logotip.jpg'], image: images[0] || '/Logo/logotip.jpg', oldPrice: price < product.price ? product.price : (product.previousPrice || undefined) })
})
