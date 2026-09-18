import { randomBytes, randomUUID } from 'node:crypto'
import { getDatabase } from '../utils/mongodb'
import { ORDER_STATUSES } from '../utils/orders'
import { getActivePromotionalPrice } from '../utils/conversion'

type OrderRequest = { customer?: { name?: string; phone?: string }; delivery?: { department?: string; city?: string; address?: string; additional?: string }; items?: { slug?: string; quantity?: number }[] }

const clean = (value: unknown, max = 180) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export default defineEventHandler(async (event) => {
  const body = await readBody<OrderRequest>(event)
  const customer = { name: clean(body?.customer?.name, 100), phone: clean(body?.customer?.phone, 30) }
  const delivery = { department: clean(body?.delivery?.department, 80), city: clean(body?.delivery?.city, 80), address: clean(body?.delivery?.address, 180), additional: clean(body?.delivery?.additional, 240) }
  const requested = Array.isArray(body?.items) ? body.items : []
  if (customer.name.length < 3 || customer.phone.length < 7 || !delivery.department || !delivery.city || !delivery.address || !requested.length) throw createError({ statusCode: 400, statusMessage: 'Completa los datos requeridos para solicitar el pedido' })

  const database = await getDatabase()
  const slugs = [...new Set(requested.map(item => clean(item.slug, 120)).filter(Boolean))]
  const products = await database.collection('products').find({ slug: { $in: slugs }, status: 'ACTIVO' }).toArray()
  const productMap = new Map(products.map(product => [product.slug, product]))
  const items = requested.map(item => {
    const product = productMap.get(clean(item.slug, 120))
    const quantity = Number(item.quantity)
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw createError({ statusCode: 400, statusMessage: 'Uno de los productos no está disponible en la cantidad solicitada' })
    const price = getActivePromotionalPrice(product); return { productId: product._id, slug: product.slug, name: product.name, sku: product.sku || '', price, quantity, total: price * quantity }
  })
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const orderNumber = `NV-${Date.now().toString().slice(-8)}-${randomUUID().slice(0, 4).toUpperCase()}`
  const publicToken = randomBytes(32).toString('hex')
  const now = new Date()
  const order = { orderNumber, publicToken, customer, delivery, subtotal, shipping: 0, total: subtotal, paymentMethod: 'CONTRA ENTREGA', status: 'SOLICITUD RECIBIDA', createdAt: now, updatedAt: now, contactAttempts: 0 }
  const result = await database.collection('orders').insertOne(order)
  await database.collection('order_items').insertMany(items.map(item => ({ ...item, orderId: result.insertedId, createdAt: now })))
  await database.collection('order_status_history').insertOne({ orderId: result.insertedId, orderNumber, status: 'SOLICITUD RECIBIDA', note: 'Solicitud recibida desde la tienda pública', changedAt: now, actor: 'cliente' })
  return { ok: true, orderNumber, publicToken, status: ORDER_STATUSES[1], createdAt: now, total: order.total }
})
