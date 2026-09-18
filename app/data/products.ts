export interface Product {
  slug: string
  name: string
  category: string
  price: number
  oldPrice?: number
  description: string
  image: string
  tag?: string
}

export const products: Product[] = []
