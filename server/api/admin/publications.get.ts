import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const query = getQuery(event); const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : ''; const status = typeof query.status === 'string' ? query.status : 'TODOS'; const filter: any = status === 'ELIMINADOS' ? { deletedAt: { $exists: true } } : status === 'TODOS' ? { deletedAt: { $exists: false } } : { status, deletedAt: { $exists: false } }; if (search) filter.title = { $regex: search, $options: 'i' }
  const database = await getDatabase(); const publications = await database.collection('publications').find(filter).sort({ updatedAt: -1 }).toArray(); const products = await database.collection('products').find({ slug: { $in: publications.map(publication => publication.slug) } }, { projection: { slug: 1, name: 1, price: 1, stock: 1, category: 1, sku: 1, images: 1, imagenes: 1, image: 1, imagen: 1, options: 1 } }).toArray(); const productMap = new Map(products.map(product => [product.slug, product])); return serializeMongo(publications.map(publication => ({ ...publication, product: productMap.get(publication.slug) || null })))
})
