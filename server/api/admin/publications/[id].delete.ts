import { ObjectId } from 'mongodb'
import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/mongodb'
import { recordAdminAction } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event); const id = getRouterParam(event, 'id')
  if (!id || !ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'Publicación inválida' })
  const database = await getDatabase(); const publicationId = new ObjectId(id); const publication = await database.collection('publications').findOne({ _id: publicationId })
  if (!publication) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
  const now = new Date(); await database.collection('publications').updateOne({ _id: publicationId }, { $set: { status: 'DESPUBLICADA', deletedAt: now, updatedAt: now } }); await recordAdminAction(database, session, 'PUBLICACIÓN ELIMINADA', 'publications', publicationId, { title: publication.title })
  return { ok: true }
})
