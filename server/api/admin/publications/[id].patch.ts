import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'
import { serializeMongo } from '../../../utils/serialize'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Publicación inválida' })
  const body = await readBody<any>(event); const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 150) : ''; const content = typeof body?.content === 'string' ? body.content.trim().slice(0, 20000) : ''
  if (!title || !content) throw createError({ statusCode: 400, statusMessage: 'Título y contenido son obligatorios' })
  const status = ['BORRADOR', 'PUBLICADA', 'PROGRAMADA', 'DESPUBLICADA'].includes(body.status) ? body.status : 'BORRADOR'; const now = new Date(); const database = await getDatabase(); const current = await database.collection('publications').findOne({ _id: new ObjectId(id) })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
  const result = await database.collection('publications').findOneAndUpdate({ _id: current._id }, { $set: { title, content, image: typeof body.image === 'string' ? body.image.trim().slice(0, 500) : '', status, featured: Boolean(body.featured), socialProof: typeof body.socialProof === 'string' ? body.socialProof.trim().slice(0, 120) : '', publishedAt: status === 'PUBLICADA' ? (current.publishedAt || now) : null, updatedAt: now } }, { returnDocument: 'after' })
  await recordAdminAction(database, session, 'PUBLICACIÓN EDITADA', 'publications', current._id, { beforeStatus: current.status, afterStatus: status })
  return { ok: true, publication: serializeMongo(result) }
})
