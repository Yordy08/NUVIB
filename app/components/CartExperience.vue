<script setup lang="ts">
import type { Product } from '~/data/products'

const cart = useCart()
const cartFeedback = useCartFeedback()
const isOpen = ref(false)
const countPulse = ref(false)
const { data: catalog } = await useFetch<Product[]>('/api/products', { key: 'cart-product-catalog' })

const cartProducts = computed(() => cart.items.value.map(item => ({ ...item, product: (catalog.value || []).find(product => product.slug === item.slug) })).filter(item => item.product))
const total = computed(() => cartProducts.value.reduce((sum, item) => sum + item.product!.price * item.quantity, 0))
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

watch(() => cart.count.value, (next, previous) => {
  if (next !== previous && next > 0) {
    countPulse.value = false
    nextTick(() => { countPulse.value = true })
    if (import.meta.client) window.setTimeout(() => { countPulse.value = false }, 360)
  }
})

const close = () => { isOpen.value = false }
const increment = (slug: string) => cart.add(slug)
const decrement = (slug: string, quantity: number) => quantity > 1 ? cart.setQuantity(slug, quantity - 1) : cart.remove(slug)
const openCart = () => { isOpen.value = true }
const onKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="cart-toast">
      <div v-if="cartFeedback.feedback" class="cart-toast" role="status" aria-live="polite">
        <span class="toast-check" aria-hidden="true">✓</span>
        <div><strong>{{ cartFeedback.feedback.message }}</strong><small v-if="cartFeedback.feedback.product">{{ cartFeedback.feedback.product }}</small></div>
        <button type="button" class="toast-link" @click="openCart">Ver carrito</button>
        <button type="button" class="toast-close" aria-label="Cerrar notificación" @click="cartFeedback.dismiss">×</button>
      </div>
    </Transition>

    <Transition name="cart-fab">
      <button v-if="cart.count.value" type="button" class="floating-cart" :class="{ 'is-pulsing': countPulse }" :aria-label="`Ver carrito, ${cart.count.value} unidades`" :aria-expanded="isOpen" @click="openCart">
        <span class="cart-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M3.5 4h2l1.5 11h10.8l2.1-8H6.1"/><path d="M9 19.5h.01M17 19.5h.01"/><path d="M8 8h11"/></svg></span><span class="floating-cart-copy"><small>Tu carrito</small><strong>{{ money(total) }}</strong></span><span class="floating-cart-count">{{ cart.count }}</span>
      </button>
    </Transition>

    <Transition name="drawer-fade"><div v-if="isOpen" class="cart-drawer-backdrop" @click="close"></div></Transition>
    <Transition name="drawer-slide">
      <aside v-if="isOpen" class="cart-drawer" aria-label="Carrito de compras" role="dialog" aria-modal="true">
        <div class="cart-drawer-header"><div><p class="eyebrow">TU SELECCIÓN</p><h2>Carrito <span>({{ cart.count }})</span></h2></div><button type="button" class="drawer-close" aria-label="Cerrar carrito" @click="close">×</button></div>
        <div v-if="cartProducts.length" class="cart-drawer-items"><article v-for="item in cartProducts" :key="item.slug" class="mini-cart-item"><img :src="item.product!.image" :alt="item.product!.name"><div class="mini-cart-info"><strong>{{ item.product!.name }}</strong><small>{{ money(item.product!.price) }} por unidad</small><div class="mini-cart-controls"><div class="mini-quantity"><button type="button" :aria-label="`Disminuir ${item.product!.name}`" @click="decrement(item.slug, item.quantity)">−</button><span>{{ item.quantity }}</span><button type="button" :aria-label="`Aumentar ${item.product!.name}`" @click="increment(item.slug)">+</button></div><button type="button" class="mini-remove" @click="cart.remove(item.slug)">Eliminar</button></div></div><strong class="mini-cart-subtotal">{{ money(item.product!.price * item.quantity) }}</strong></article></div>
        <div v-else class="cart-drawer-empty"><span class="empty-cart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M3.5 4h2l1.5 11h10.8l2.1-8H6.1"/><path d="M9 19.5h.01M17 19.5h.01"/></svg></span><h3>Tu carrito está vacío</h3><p>Agrega productos y aparecerán aquí.</p></div>
        <div v-if="cartProducts.length" class="cart-drawer-footer"><div class="drawer-total"><span>Total</span><strong>{{ money(total) }}</strong></div><NuxtLink to="/pedido" class="button drawer-checkout" @click="close">FINALIZAR PEDIDO <span>↗</span></NuxtLink><NuxtLink to="/pedido" class="drawer-view-cart" @click="close">VER CARRITO COMPLETO</NuxtLink></div>
      </aside>
    </Transition>
  </Teleport>
</template>
