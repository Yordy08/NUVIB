export const ORDER_STATUSES = ['NUEVO', 'SOLICITUD RECIBIDA', 'EN REVISIÓN', 'CONTACTANDO CLIENTE', 'CONFIRMADO', 'PEDIDO ACTIVADO', 'EN PREPARACIÓN', 'DESPACHADO', 'EN CAMINO', 'ENTREGADO', 'PAGADO', 'CANCELADO', 'NO CONFIRMADO'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const isOrderStatus = (value: unknown): value is OrderStatus => typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus)
