import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { destroyCloudinaryImages } from '../../../utils/cloudinary'
import { getProductImages } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Publicación inválida' })
  const database = await getDatabase(); const publicationId = new ObjectId(id); const publication = await database.collection('publications').findOne({ _id: publicationId })
  if (!publication) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
  const product = await database.collection('products').findOne({ slug: publication.slug })
  const reviews = product ? await database.collection('reviews').find({ productId: product._id }, { projection: { imageUrl: 1, imageUrls: 1 } }).toArray() : []
  await destroyCloudinaryImages([...((publication.images as string[]) || []), publication.image, ...getProductImages(product), ...reviews.flatMap(review => [review.imageUrl, ...(review.imageUrls || [])])])
  if (product) {
    await database.collection('reviews').deleteMany({ productId: product._id })
    await database.collection('order_items').deleteMany({ productId: product._id })
    await database.collection('orders').updateMany({ 'items.productId': product._id }, { $pull: { items: { productId: product._id } } })
    await database.collection('product_audit').deleteMany({ productId: product._id })
    await database.collection('products').deleteOne({ _id: product._id })
    await database.collection('admin_audit').deleteMany({ module: 'products', recordId: product._id })
  }
  await database.collection('publications').deleteOne({ _id: publicationId })
  await database.collection('admin_audit').deleteMany({ module: 'publications', recordId: publicationId })
  return { ok: true }
})
