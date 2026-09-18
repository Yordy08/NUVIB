import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DB || 'nuvib'

if (!uri) throw new Error('MONGODB_URI no está configurada en .env')

const client = new MongoClient(uri)

try {
  await client.connect()
  const database = client.db(databaseName)
  await database.command({ ping: 1 })

  const collections = ['products', 'categories', 'orders', 'order_items', 'reviews', 'admin_users', 'admin_sessions', 'publications', 'visits', 'visitor_sessions', 'product_visits', 'site_settings', 'order_status_history', 'counters']
  const existing = new Set((await database.listCollections({}, { nameOnly: true }).toArray()).map(collection => collection.name))

  for (const name of collections) {
    if (!existing.has(name)) await database.createCollection(name)
  }

  await database.collection('products').createIndex({ slug: 1 }, { unique: true })
  await database.collection('products').createIndex({ status: 1, category: 1 })
  await database.collection('categories').createIndex({ slug: 1 }, { unique: true })
  await database.collection('admin_users').createIndex({ email: 1 }, { unique: true })
  await database.collection('admin_sessions').createIndex({ tokenHash: 1 }, { unique: true })
  await database.collection('admin_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await database.collection('orders').createIndex({ orderNumber: 1 }, { unique: true })
  await database.collection('orders').createIndex({ status: 1, createdAt: -1 })
  await database.collection('order_items').createIndex({ orderId: 1 })
  await database.collection('publications').createIndex({ slug: 1 }, { unique: true })
  await database.collection('visits').createIndex({ visitedAt: -1 })
  await database.collection('visits').createIndex({ visitorId: 1, day: 1 })
  await database.collection('visitor_sessions').createIndex({ visitorId: 1 }, { unique: true })
  await database.collection('visitor_sessions').createIndex({ lastActivityAt: 1 })
  await database.collection('product_visits').createIndex({ visitorId: 1, productSlug: 1, day: 1 }, { unique: true })
  await database.collection('product_visits').createIndex({ productSlug: 1, visitedAt: -1 })
  await database.collection('order_status_history').createIndex({ orderId: 1, changedAt: -1 })
  await database.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 })
  await database.collection('reviews').createIndex({ source: 1, sourceReviewId: 1 }, { sparse: true })
  await database.collection('reviews').createIndex({ productId: 1, provider: 1, sourceReviewId: 1 }, { unique: true, sparse: true })

  const counts = {}
  for (const name of collections) counts[name] = await database.collection(name).countDocuments()
  console.log(JSON.stringify({ ok: true, database: databaseName, collections: counts }, null, 2))
} finally {
  await client.close()
}
