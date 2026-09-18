import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { serializeMongo } from '../../utils/serialize'

export default defineEventHandler(async (event) => {
  await requireAdmin(event); const query = getQuery(event); const search = typeof query.search === 'string' ? query.search.trim().slice(0, 100) : ''; const status = typeof query.status === 'string' ? query.status : 'TODOS'; const filter: any = status === 'ELIMINADOS' ? { deletedAt: { $exists: true } } : status === 'TODOS' ? { deletedAt: { $exists: false } } : { status, deletedAt: { $exists: false } }; if (search) filter.title = { $regex: search, $options: 'i' }
  return serializeMongo(await (await getDatabase()).collection('publications').find(filter).sort({ updatedAt: -1 }).toArray())
})
