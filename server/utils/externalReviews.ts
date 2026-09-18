import { ObjectId } from 'mongodb'
import { getDatabase } from './mongodb'
import { getReviewProvider } from './reviewProviders'

export const syncExternalReviews = async (product: any) => {
  const config = product.externalReviews; if (!config?.provider || !config.productId) throw createError({ statusCode: 400, statusMessage: 'Configura el proveedor y el identificador externo del producto.' })
  const provider = getReviewProvider(config.provider); const synced = await provider.syncReviews({ productId: config.productId, productUrl: config.productUrl }); const database = await getDatabase(); const now = new Date()
  const operations = synced.reviews.map(review => ({ updateOne: { filter: { productId: product._id, source: 'EXTERNA', provider: provider.key, sourceReviewId: review.sourceReviewId }, update: { $set: { productId: product._id, productName: product.name, orderId: null, customerName: review.authorName, authorCountry: review.authorCountry || null, rating: review.rating, comment: review.comment, imageUrls: review.imageUrls || [], imageUrl: review.imageUrls?.[0] || null, variant: review.variant || null, verifiedPurchase: false, verifiedExternal: Boolean(review.verifiedExternal), source: 'EXTERNA', sourceName: provider.name, provider: provider.key, sourceUrl: review.sourceUrl || config.productUrl || null, sourceProductId: config.productId, sourceReviewId: review.sourceReviewId, status: config.autoPublish ? 'PUBLICADA' : 'PENDIENTE', hasImage: Boolean(review.imageUrls?.length), reviewDate: review.reviewDate ? new Date(review.reviewDate) : null, importedAt: now, updatedAt: now } }, upsert: true } }))
  if (operations.length) await database.collection('reviews').bulkWrite(operations, { ordered: false })
  await database.collection('products').updateOne({ _id: product._id }, { $set: { 'externalReviews.lastSyncedAt': now, 'externalReviews.lastSyncError': null, 'externalReviews.reviewCount': synced.reviewCount ?? synced.reviews.length, 'externalReviews.rating': synced.rating ?? (synced.reviews.length ? synced.reviews.reduce((sum, review) => sum + review.rating, 0) / synced.reviews.length : null) } })
  return { provider: provider.name, count: synced.reviews.length, reviewCount: synced.reviewCount ?? synced.reviews.length, rating: synced.rating ?? null, syncedAt: now }
}

export const externalProductFilter = (productId: ObjectId) => ({ productId, source: 'EXTERNA' })
