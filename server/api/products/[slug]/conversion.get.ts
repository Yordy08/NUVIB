import { getDatabase } from '../../../utils/mongodb'
import { DEFAULT_CONVERSION_SETTINGS, publicConversionSettings } from '../../../utils/conversion'
import { serializeMongo } from '../../../utils/serialize'

const dayStart = (days: number) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - days); return date }

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug'); const database = await getDatabase(); const product = await database.collection('products').findOne({ slug, status: 'ACTIVO' }, { projection: { _id: 1, price: 1, stock: 1, conversion: 1 } }); if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const stored = await database.collection('site_settings').findOne({ _id: 'conversion' }); const global = publicConversionSettings({ ...DEFAULT_CONVERSION_SETTINGS, ...(stored?.conversion || {}) }); const override = product.conversion || {}; const enabled = (key: string) => override[key] === null || override[key] === undefined ? global[key] : override[key]
  const activeSince = new Date(Date.now() - 5 * 60 * 1000); const [activeViewers, todayVisits, last7Visits, last30Visits, orderRows] = await Promise.all([
    database.collection('visitor_sessions').countDocuments({ activeProductSlug: slug, lastActivityAt: { $gte: activeSince } }),
    database.collection('product_visits').countDocuments({ productSlug: slug, visitedAt: { $gte: dayStart(0) } }),
    database.collection('product_visits').countDocuments({ productSlug: slug, visitedAt: { $gte: dayStart(6) } }),
    database.collection('product_visits').countDocuments({ productSlug: slug, visitedAt: { $gte: dayStart(29) } }),
    database.collection('order_items').aggregate([{ $match: { productId: product._id } }, { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } }, { $unwind: '$order' }, { $match: { 'order.createdAt': { $gte: dayStart(29) } } }, { $group: { _id: { orderId: '$order._id', status: '$order.status' }, createdAt: { $first: '$order.createdAt' } } }, { $sort: { createdAt: -1 } }]).toArray()
  ])
  const confirmed = new Set(global.confirmedStatuses); const confirmedRows = orderRows.filter(row => confirmed.has(row._id.status)); const today = dayStart(0); const last7 = dayStart(6); const countSince = (rows: any[], since: Date) => rows.filter(row => row.createdAt >= since).length; const promotionStart = override.offerStartAt ? new Date(override.offerStartAt) : null; const promotionEnd = override.offerEndAt ? new Date(override.offerEndAt) : null; const promotionalPrice = Number(override.promotionalPrice); const offerActive = Boolean(enabled('offers') && promotionalPrice > 0 && promotionalPrice < product.price && promotionEnd && promotionEnd > new Date() && (!promotionStart || promotionStart <= new Date()))
  return serializeMongo({ settings: { ...global, activeViewers: enabled('activeViewers'), visits: enabled('visits'), orders: enabled('orders'), offers: enabled('offers'), stockAlerts: enabled('stockAlerts'), availabilityBar: enabled('availabilityBar'), trustMessages: enabled('trustMessages') }, stats: { activeViewers, todayVisits, last7Visits, last30Visits, confirmedToday: countSince(confirmedRows, today), confirmed7: countSince(confirmedRows, last7), delivered: orderRows.filter(row => row._id.status === 'ENTREGADO').length, cancelled: orderRows.filter(row => row._id.status === 'CANCELADO').length, recentConfirmed: confirmedRows.slice(0, 5).map(row => row.createdAt) }, product: { stock: product.stock, price: product.price, promotionalPrice: offerActive ? promotionalPrice : null, offerEndAt: offerActive ? promotionEnd : null, offerActive } })
})
