import { getDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const publication = await (await getDatabase()).collection('publications').findOne({ slug, status: 'PUBLICADA' })
  if (!publication) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
  return publication
})
