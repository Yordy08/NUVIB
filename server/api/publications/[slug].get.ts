import { getDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const publication = await (await getDatabase()).collection('publications').findOne({ slug, status: 'PUBLICADA' })
  if (!publication) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
  const product = await (await getDatabase()).collection('products').findOne({ slug: publication.slug }); return { ...publication, images: publication.images?.length ? publication.images : product?.images || (publication.image ? [publication.image] : []), product }
})
