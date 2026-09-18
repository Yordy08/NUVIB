export type ExternalReview = {
  sourceReviewId: string
  authorName: string
  authorCountry?: string | null
  rating: number
  comment: string
  reviewDate?: string | null
  imageUrls?: string[]
  variant?: string | null
  verifiedExternal?: boolean
  sourceUrl?: string | null
}

export interface ReviewProvider {
  readonly key: string
  readonly name: string
  syncReviews(input: { productId: string; productUrl?: string }): Promise<{ reviews: ExternalReview[]; rating?: number; reviewCount?: number }>
}

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const numberValue = (value: unknown) => Number(value)

export class AliExpressReviewProvider implements ReviewProvider {
  readonly key = 'ALIEXPRESS'
  readonly name = 'AliExpress'

  async syncReviews(input: { productId: string; productUrl?: string }) {
    const config = useRuntimeConfig(); const apiUrl = config.reviewsApiUrl; const apiKey = config.aliexpressReviewsApiKey || config.reviewsApiKey
    if (!apiUrl || !apiKey) throw createError({ statusCode: 503, statusMessage: 'El proveedor de reseñas externas no está configurado.' })
    const response: any = await $fetch(apiUrl, { query: { product_id: input.productId, product_url: input.productUrl || undefined }, headers: { authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey }, timeout: 15000, retry: 2, retryStatusCodes: [408, 425, 429, 500, 502, 503, 504] })
    const payload = response?.reviews || response?.result?.reviews || response?.data?.reviews || response?.items || (Array.isArray(response) ? response : [])
    const reviews = (Array.isArray(payload) ? payload : []).map((item: any) => { const rating = numberValue(item.rating ?? item.stars ?? item.score); const comment = clean(item.comment ?? item.content ?? item.text ?? item.review, 3000); const sourceReviewId = clean(item.id ?? item.review_id ?? item.reviewId, 160); return { sourceReviewId, authorName: clean(item.author?.name ?? item.author_name ?? item.userName ?? item.user, 120) || 'Comprador', authorCountry: clean(item.country ?? item.country_code ?? item.buyer_country, 80) || null, rating, comment, reviewDate: item.date ?? item.review_date ?? item.created_at ?? null, imageUrls: Array.isArray(item.images ?? item.image_urls) ? (item.images ?? item.image_urls).filter((url: unknown) => typeof url === 'string').slice(0, 12) : [], variant: clean(item.variant ?? item.sku, 180) || null, verifiedExternal: Boolean(item.verified ?? item.verified_purchase), sourceUrl: clean(item.url ?? item.review_url, 500) || input.productUrl || null } }).filter((review: ExternalReview) => review.sourceReviewId && review.rating >= 1 && review.rating <= 5 && review.comment)
    return { reviews, rating: numberValue(response?.rating ?? response?.average_rating ?? response?.result?.rating) || undefined, reviewCount: numberValue(response?.review_count ?? response?.total ?? response?.result?.review_count) || reviews.length }
  }
}

export const getReviewProvider = (key: unknown): ReviewProvider => { if (key === 'ALIEXPRESS') return new AliExpressReviewProvider(); throw createError({ statusCode: 400, statusMessage: 'Proveedor de reseñas no compatible.' }) }
