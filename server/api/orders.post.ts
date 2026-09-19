import { randomBytes, randomUUID } from 'node:crypto'
import { getDatabase } from '../utils/mongodb'
import { ORDER_STATUSES } from '../utils/orders'
import { getActivePromotionalPrice } from '../utils/conversion'

type OrderRequest = { customer?: { name?: string; firstName?: string; lastName?: string; phone?: string; email?: string }; delivery?: { country?: string; department?: string; city?: string; address?: string; additional?: string }; items?: { productId?: string; slug?: string; quantity?: number; size?: string; color?: string }[] }

const clean = (value: unknown, max = 180) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export default defineEventHandler(async (event) => {
  const body = await readBody<OrderRequest>(event)
  const firstName = clean(body?.customer?.firstName, 80); const lastName = clean(body?.customer?.lastName, 80); const name = clean(body?.customer?.name, 160) || `${firstName} ${lastName}`.trim()
  const customer = { name, firstName, lastName, phone: clean(body?.customer?.phone, 30), email: clean(body?.customer?.email, 160).toLowerCase() }
  const delivery = { country: clean(body?.delivery?.country, 60), department: clean(body?.delivery?.department, 80), city: clean(body?.delivery?.city, 80), address: clean(body?.delivery?.address, 180), additional: clean(body?.delivery?.additional, 240) }
  const requested = Array.isArray(body?.items) ? body.items : []
  if (customer.firstName.length < 2 || customer.lastName.length < 2 || customer.phone.length < 7 || !/^\S+@\S+\.\S+$/.test(customer.email) || !delivery.country || !delivery.department || !delivery.city || !delivery.address || !requested.length) throw createError({ statusCode: 400, statusMessage: 'Completa correctamente todos los datos requeridos para solicitar el pedido' })

  const database = await getDatabase()
  const slugs = [...new Set(requested.map(item => clean(item.slug, 120)).filter(Boolean))]
  const products = await database.collection('products').find({ slug: { $in: slugs }, status: 'ACTIVO' }).toArray()
  const productMap = new Map(products.map(product => [product.slug, product]))
  const items = requested.map(item => {
    const product = productMap.get(clean(item.slug, 120))
    const quantity = Number(item.quantity)
    if (!product || item.productId && String(product._id) !== item.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw createError({ statusCode: 400, statusMessage: 'Uno de los productos no está disponible en la cantidad solicitada' })
    const size = clean(item.size, 40); const color = clean(item.color, 40); if (size && !product.options?.sizes?.includes(size) || color && !product.options?.colors?.includes(color)) throw createError({ statusCode: 400, statusMessage: 'Una de las opciones del producto ya no está disponible' }); const price = getActivePromotionalPrice(product); return { productId: product._id, slug: product.slug, name: product.name, sku: product.sku || '', size: size || undefined, color: color || undefined, price, quantity, total: price * quantity }
  })
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const orderNumber = `NV-${Date.now().toString().slice(-8)}-${randomUUID().slice(0, 4).toUpperCase()}`
  const publicToken = randomBytes(32).toString('hex')
  const now = new Date()
  const order = { orderNumber, publicToken, customer, delivery, items, subtotal, shipping: 0, total: subtotal, paymentMethod: 'CONTRA ENTREGA', status: 'SOLICITUD RECIBIDA', createdAt: now, updatedAt: now, contactAttempts: 0 }
  const result = await database.collection('orders').insertOne(order)
  await database.collection('order_items').insertMany(items.map(item => ({ ...item, orderId: result.insertedId, createdAt: now })))
  await database.collection('order_status_history').insertOne({ orderId: result.insertedId, orderNumber, status: 'SOLICITUD RECIBIDA', note: 'Solicitud recibida desde la tienda pública', changedAt: now, actor: 'cliente' })
  return { ok: true, orderNumber, publicToken, status: ORDER_STATUSES[1], createdAt: now, total: order.total }
})
