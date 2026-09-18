export const useCartFeedback = () => {
  const feedback = useState<{ message: string; product?: string; id: number } | null>('cart-feedback', () => null)
  let timeout: ReturnType<typeof setTimeout> | undefined

  const show = (product?: string) => {
    feedback.value = { message: 'Producto agregado al carrito', product, id: Date.now() }
    if (import.meta.client) {
      if (timeout) window.clearTimeout(timeout)
      timeout = window.setTimeout(() => { feedback.value = null }, 3600)
    }
  }

  const dismiss = () => { feedback.value = null }
  return { feedback, show, dismiss }
}
