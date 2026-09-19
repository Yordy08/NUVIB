import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { destroyCloudinaryImages } from '../../../utils/cloudinary'
import { getProductImages } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Producto inválido' })
  const database = await getDatabase(); const productId = new ObjectId(id); const product = await database.collection('products').findOne({ _id: productId })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const reviews = await database.collection('reviews').find({ productId }, { projection: { imageUrl: 1, imageUrls: 1 } }).toArray()
  await destroyCloudinaryImages([...getProductImages(product), ...reviews.flatMap(review => [review.imageUrl, ...(review.imageUrls || [])])])
  await database.collection('reviews').deleteMany({ productId })
  await database.collection('order_items').deleteMany({ productId })
  await database.collection('orders').updateMany({ 'items.productId': productId }, { $pull: { items: { productId } } })
  await database.collection('product_audit').deleteMany({ productId })
  await database.collection('products').deleteOne({ _id: productId })
  await database.collection('admin_audit').deleteMany({ module: 'products', recordId: productId })
  return { ok: true, mode: 'hard' }
})
