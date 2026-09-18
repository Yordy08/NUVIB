export const REVIEW_STATUSES = ['PENDIENTE', 'PUBLICADA', 'RECHAZADA', 'OCULTA'] as const
export type ReviewStatus = typeof REVIEW_STATUSES[number]

export const reviewSort = (value: unknown) => value === 'rating' ? { rating: -1, createdAt: -1 } : value === 'photos' ? { hasImage: -1, createdAt: -1 } : { createdAt: -1 }
