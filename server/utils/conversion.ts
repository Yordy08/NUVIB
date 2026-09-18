export const DEFAULT_CONVERSION_SETTINGS = {
  enabled: true,
  notifications: true,
  activeViewers: true,
  visits: true,
  orders: true,
  offers: true,
  stockAlerts: true,
  availabilityBar: true,
  socialProof: true,
  trustMessages: true,
  notificationDuration: 5,
  notificationInterval: 45,
  maxNotificationsPerSession: 3,
  showOnMobile: true,
  showOnDesktop: true,
  stockThreshold: 5,
  availabilityBase: 20,
  confirmedStatuses: ['CONFIRMADO', 'PEDIDO ACTIVADO', 'EN PREPARACIÓN', 'DESPACHADO', 'EN CAMINO', 'ENTREGADO', 'PAGADO']
}

export const publicConversionSettings = (settings: any) => ({ ...DEFAULT_CONVERSION_SETTINGS, ...settings, confirmedStatuses: DEFAULT_CONVERSION_SETTINGS.confirmedStatuses })

export const getActivePromotionalPrice = (product: any, now = new Date()) => { const offer = product?.conversion; const price = Number(offer?.promotionalPrice); const end = offer?.offerEndAt ? new Date(offer.offerEndAt) : null; const start = offer?.offerStartAt ? new Date(offer.offerStartAt) : null; return price > 0 && price < Number(product.price) && end && end > now && (!start || start <= now) ? price : Number(product.price) }
