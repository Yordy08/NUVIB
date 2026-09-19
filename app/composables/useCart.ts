export const useCart = () => {
  const items = useState<{ slug: string; quantity: number; size?: string; color?: string }[]>('cart-items', () => [])
  const count = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))

  const add = (slug: string, options: { size?: string; color?: string } = {}) => {
    const existing = items.value.find(item => item.slug === slug && item.size === options.size && item.color === options.color)
    if (existing) existing.quantity += 1
    else items.value.push({ slug, quantity: 1, ...options })
  }

  const remove = (slug: string, size?: string, color?: string) => { items.value = items.value.filter(item => !(item.slug === slug && item.size === size && item.color === color)) }
  const setQuantity = (slug: string, quantity: number, size?: string, color?: string) => {
    const item = items.value.find(entry => entry.slug === slug && entry.size === size && entry.color === color)
    if (item) item.quantity = Math.max(1, Math.floor(quantity))
  }
  if (import.meta.client) {
    onMounted(() => {
      try { items.value = JSON.parse(localStorage.getItem('nuvib-cart') || '[]') } catch { items.value = [] }
    })
    watch(items, value => localStorage.setItem('nuvib-cart', JSON.stringify(value)), { deep: true })
  }

  return { items, count, add, remove, setQuantity }
}
