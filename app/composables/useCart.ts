export const useCart = () => {
  const items = useState<{ slug: string; quantity: number }[]>('cart-items', () => [])
  const count = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))

  const add = (slug: string) => {
    const existing = items.value.find(item => item.slug === slug)
    if (existing) existing.quantity += 1
    else items.value.push({ slug, quantity: 1 })
  }

  const remove = (slug: string) => { items.value = items.value.filter(item => item.slug !== slug) }
  const setQuantity = (slug: string, quantity: number) => {
    const item = items.value.find(entry => entry.slug === slug)
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
