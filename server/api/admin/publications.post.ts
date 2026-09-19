import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { parseCOPAmount } from '../../utils/products'

const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100)
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const body = await readBody<{ title?: string; content?: string; image?: string; images?: string[]; status?: string; relatedProduct?: string; featured?: boolean; socialProof?: string; product?: { enabled?: boolean; price?: number | string; stock?: number | string; category?: string; sku?: string; images?: string[]; options?: { sizes?: string[]; colors?: string[] } } }>(event)
  const title = body?.title?.trim().slice(0, 150)
  if (!title || !body?.content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Título y contenido son obligatorios' })
  const now = new Date(); const status = ['BORRADOR', 'PUBLICADA', 'PROGRAMADA', 'DESPUBLICADA'].includes(body.status || '') ? body.status : 'BORRADOR'
  const images = Array.isArray(body.images) ? body.images.filter(image => typeof image === 'string' && image.trim()).map(image => image.trim().slice(0, 500)).slice(0, 30) : []
  const publication = { title, slug: `${slugify(title)}-${Date.now().toString().slice(-5)}`, content: body.content.trim().slice(0, 20000), image: body.image?.trim().slice(0, 500) || images[0] || '', images, status, featured: Boolean(body.featured), socialProof: body.socialProof?.trim().slice(0, 120) || '', views: 0, relatedProduct: body.relatedProduct?.trim().slice(0, 120) || null, publishedAt: status === 'PUBLICADA' ? now : null, createdAt: now, updatedAt: now, createdBy: session.email }
  const database = await getDatabase()
  await database.collection('publications').insertOne(publication)
  let product = null
  if (body.product?.enabled) {
    const price = parseCOPAmount(body.product.price)
    const stock = Number(body.product.stock)
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) throw createError({ statusCode: 400, statusMessage: 'El producto necesita precio y stock válidos' })
    const images = Array.isArray(body.product.images) ? body.product.images.filter(image => typeof image === 'string' && image.trim()).map(image => image.trim()) : []
    const cleanOptions = (values: unknown) => Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().slice(0, 40)).slice(0, 30) : []
    product = { name: title, slug: publication.slug, sku: body.product.sku?.trim().slice(0, 60) || `NV-${Date.now()}`, description: body.content.trim().slice(0, 5000), price, stock, category: body.product.category?.trim().slice(0, 80) || 'General', status: status === 'PUBLICADA' ? 'ACTIVO' : 'INACTIVO', images: images.length ? images : (publication.image ? [publication.image] : []), options: { sizes: cleanOptions(body.product.options?.sizes), colors: cleanOptions(body.product.options?.colors) }, createdAt: now, updatedAt: now }
    await database.collection('products').insertOne(product)
  }
  return { ok: true, publication, product }
})
