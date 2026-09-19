import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'
import { serializeMongo } from '../../../utils/serialize'
import { getProductImages, parseCOPAmount } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Publicación inválida' })
  const body = await readBody<any>(event); const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 150) : ''; const content = typeof body?.content === 'string' ? body.content.trim().slice(0, 20000) : ''
  if (!title || !content) throw createError({ statusCode: 400, statusMessage: 'Título y contenido son obligatorios' })
  const status = ['BORRADOR', 'PUBLICADA', 'PROGRAMADA', 'DESPUBLICADA'].includes(body.status) ? body.status : 'BORRADOR'; const now = new Date(); const database = await getDatabase(); const current = await database.collection('publications').findOne({ _id: new ObjectId(id) })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
   const images = Array.isArray(body.images) ? body.images.filter((image: unknown) => typeof image === 'string' && image.trim()).map((image: string) => image.trim().slice(0, 500)).slice(0, 30) : current.images || []
   const result = await database.collection('publications').findOneAndUpdate({ _id: current._id }, { $set: { title, content, image: typeof body.image === 'string' ? body.image.trim().slice(0, 500) : images[0] || '', images, status, featured: Boolean(body.featured), socialProof: typeof body.socialProof === 'string' ? body.socialProof.trim().slice(0, 120) : '', publishedAt: status === 'PUBLICADA' ? (current.publishedAt || now) : null, updatedAt: now } }, { returnDocument: 'after' })
   if (body.product) {
     const product = await database.collection('products').findOne({ slug: current.slug })
     if (product) {
       const cleanOptions = (values: unknown) => Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().slice(0, 40)).slice(0, 30) : []
       const price = parseCOPAmount(body.product.price)
       const stock = Number(body.product.stock)
       if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) throw createError({ statusCode: 400, statusMessage: 'El precio y el stock del producto no son válidos' })
      const productImages = Array.isArray(body.product.images) && body.product.images.length ? body.product.images.filter((image: unknown) => typeof image === 'string' && image.trim()).map((image: string) => image.trim().slice(0, 500)).slice(0, 30) : getProductImages(product)
      await database.collection('products').updateOne({ _id: product._id }, { $set: { name: title, price, stock, category: typeof body.product.category === 'string' && body.product.category.trim() ? body.product.category.trim().slice(0, 80) : product.category, sku: typeof body.product.sku === 'string' && body.product.sku.trim() ? body.product.sku.trim().slice(0, 60) : product.sku, images: productImages, options: { sizes: cleanOptions(body.product.options?.sizes), colors: cleanOptions(body.product.options?.colors) }, updatedAt: now } })
     }
   }
  await recordAdminAction(database, session, 'PUBLICACIÓN EDITADA', 'publications', current._id, { beforeStatus: current.status, afterStatus: status })
  return { ok: true, publication: serializeMongo(result) }
})
