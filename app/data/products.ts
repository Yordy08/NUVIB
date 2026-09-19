export interface Product {
  _id?: string
  slug: string
  name: string
  category: string
  price: number
  oldPrice?: number
  description: string
  image: string
  tag?: string
  options?: { sizes?: string[]; colors?: string[] }
  rating?: number
  soldCount?: number
  promotionLabel?: string
  stock?: number
  shippingLabel?: string
}

export const products: Product[] = []
