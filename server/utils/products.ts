import { getDatabase } from './mongodb'

export const slugifyProduct = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100)
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const options = (value: unknown) => Array.isArray(value) ? value.map(item => text(item, 40)).filter(Boolean).slice(0, 30) : []

export const getProductImages = (product: any): string[] => {
  const values = [product?.images, product?.imagenes]
  const urls = values.flatMap(value => Array.isArray(value) ? value : typeof value === 'string' ? [value] : [])
  if (typeof product?.image === 'string') urls.push(product.image)
  if (typeof product?.imagen === 'string') urls.push(product.imagen)
  return [...new Set(urls.map(image => image.trim()).filter(Boolean))].slice(0, 30)
}

export const parseCOPAmount = (value: unknown) => {
  if (typeof value === 'number') return value
  if (value === null || value === undefined || value === '') return 0
  const normalized = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  return Number(normalized) || 0
}

export const validateProductInput = (body: any, current?: any) => {
  const name = text(body?.name, 150)
  const price = parseCOPAmount(body?.price)
  const stock = Number(body?.stock)
  const previousPrice = body?.previousPrice === '' || body?.previousPrice == null ? null : parseCOPAmount(body.previousPrice)
  const cost = body?.cost === '' || body?.cost == null ? null : parseCOPAmount(body.cost)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'El nombre del producto es obligatorio.' })
  if (!Number.isFinite(price) || price <= 0) throw createError({ statusCode: 400, statusMessage: 'El precio debe ser mayor que 0.' })
  if (!Number.isInteger(stock) || stock < 0) throw createError({ statusCode: 400, statusMessage: 'El stock no puede ser negativo.' })
  if (previousPrice !== null && (!Number.isFinite(previousPrice) || previousPrice < 0)) throw createError({ statusCode: 400, statusMessage: 'El precio anterior no es válido.' })
  if (cost !== null && (!Number.isFinite(cost) || cost < 0)) throw createError({ statusCode: 400, statusMessage: 'El costo interno no es válido.' })
  const slug = text(body?.slug, 100) || current?.slug || `${slugifyProduct(name)}-${Date.now().toString().slice(-5)}`
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw createError({ statusCode: 400, statusMessage: 'El slug solo puede contener letras minúsculas, números y guiones.' })
  const sku = text(body?.sku, 60) || current?.sku || `NV-${Date.now()}`
  return {
    name, slug, sku, shortDescription: text(body?.shortDescription, 240), description: text(body?.description, 5000),
    price, previousPrice, cost, stock, category: text(body?.category, 80) || 'General',
    status: ['ACTIVO', 'INACTIVO', 'ELIMINADO'].includes(body?.status) ? body.status : (current?.status || 'ACTIVO'),
    images: Array.isArray(body?.images) ? body.images.filter((image: unknown) => typeof image === 'string' && image.trim()).map((image: string) => image.trim()) : (current?.images || []),
    features: Array.isArray(body?.features) ? body.features.map((feature: unknown) => text(feature, 160)).filter(Boolean).slice(0, 30) : (current?.features || []),
    weight: text(body?.weight, 40), dimensions: text(body?.dimensions, 100), options: { sizes: options(body?.options?.sizes), colors: options(body?.options?.colors) },
    externalReviews: body?.externalReviews && typeof body.externalReviews === 'object' ? { provider: ['ALIEXPRESS'].includes(body.externalReviews.provider) ? body.externalReviews.provider : '', productId: text(body.externalReviews.productId, 160), productUrl: text(body.externalReviews.productUrl, 500), autoPublish: Boolean(body.externalReviews.autoPublish), lastSyncedAt: current?.externalReviews?.lastSyncedAt || null, lastSyncError: current?.externalReviews?.lastSyncError || null, reviewCount: current?.externalReviews?.reviewCount || 0, rating: current?.externalReviews?.rating ?? null } : (current?.externalReviews || { provider: '', productId: '', productUrl: '', autoPublish: false, lastSyncedAt: null, lastSyncError: null, reviewCount: 0, rating: null }),
    conversion: body?.conversion && typeof body.conversion === 'object' ? { activity: body.conversion.activity === null ? null : Boolean(body.conversion.activity), activeViewers: body.conversion.activeViewers === null ? null : Boolean(body.conversion.activeViewers), visits: body.conversion.visits === null ? null : Boolean(body.conversion.visits), orders: body.conversion.orders === null ? null : Boolean(body.conversion.orders), offer: body.conversion.offer === null ? null : Boolean(body.conversion.offer), stockAlert: body.conversion.stockAlert === null ? null : Boolean(body.conversion.stockAlert), availabilityBar: body.conversion.availabilityBar === null ? null : Boolean(body.conversion.availabilityBar), trust: body.conversion.trust === null ? null : Boolean(body.conversion.trust), offerStartAt: text(body.conversion.offerStartAt, 40) || null, offerEndAt: text(body.conversion.offerEndAt, 40) || null, promotionalPrice: body.conversion.promotionalPrice === '' || body.conversion.promotionalPrice == null ? null : Number(body.conversion.promotionalPrice) } : (current?.conversion || {}),
    metaTitle: text(body?.metaTitle, 160), metaDescription: text(body?.metaDescription, 300)
  }
}

export const assertUniqueProductFields = async (data: { sku: string; slug: string }, id?: unknown) => {
  const database = await getDatabase()
  const excluded = id ? { _id: { $ne: id } } : {}
  const duplicate = await database.collection('products').findOne({ ...excluded, $or: [{ sku: data.sku }, { slug: data.slug }] }, { projection: { sku: 1, slug: 1 } })
  if (duplicate?.sku === data.sku) throw createError({ statusCode: 409, statusMessage: 'El SKU ya existe.' })
  if (duplicate?.slug === data.slug) throw createError({ statusCode: 409, statusMessage: 'El slug ya existe.' })
}
