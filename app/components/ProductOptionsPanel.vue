<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { data: product } = await useFetch<any>(() => slug.value ? `/api/products/${slug.value}` : null)
const { selection, setSelection } = useProductOptions(slug.value)
const size = ref(selection.value.size || '')
const color = ref(selection.value.color || '')
const quantity = ref(1)
const favorite = ref(false)
const cart = useCart()
const cartFeedback = useCartFeedback()
const formatPrice = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
const originalPrice = computed(() => product.value?.oldPrice && product.value.oldPrice > product.value.price ? product.value.oldPrice : 0)
const discountPercent = computed(() => originalPrice.value ? Math.round((1 - product.value.price / originalPrice.value) * 100) : 0)
const rating = computed(() => product.value?.rating || product.value?.externalReviews?.rating || 4.8)
const reviewCount = computed(() => product.value?.externalReviews?.reviewCount || 0)
const stock = computed(() => typeof product.value?.stock === 'number' ? product.value.stock : null)
watch([size, color], () => setSelection({ size: size.value || undefined, color: color.value || undefined }))
const canAdd = computed(() => (!product.value?.options?.sizes?.length || size.value) && (!product.value?.options?.colors?.length || color.value))
const changeQuantity = (amount: number) => { quantity.value = Math.max(1, Math.min(stock.value || 99, quantity.value + amount)) }
const addToCart = (goToCheckout = false) => {
  if (!product.value || !canAdd.value) return
  for (let index = 0; index < quantity.value; index += 1) cart.add(product.value.slug, selection.value)
  cartFeedback.show(product.value.name)
  if (goToCheckout) navigateTo('/pedido')
}
</script>

<template>
  <Teleport v-if="product" to=".detail-copy">
    <section class="pdp-purchase-panel" aria-label="Opciones de compra">
      <div class="pdp-price-block"><div><strong>{{ formatPrice(product.price) }}</strong><del v-if="originalPrice">{{ formatPrice(originalPrice) }}</del><span v-if="discountPercent" class="pdp-discount">-{{ discountPercent }}% OFF</span></div><p v-if="stock !== null && stock > 0 && stock <= 10" class="pdp-urgency">⚡ Quedan pocas unidades en stock</p></div>
      <div v-if="product.options?.colors?.length" class="pdp-option-group"><div class="pdp-option-heading"><strong>Color</strong><span>{{ color || 'Elige una opción' }}</span></div><div class="pdp-swatches"><button v-for="item in product.options.colors" :key="item" type="button" :class="{ 'is-selected': color === item }" :aria-label="`Elegir color ${item}`" @click="color = item"><span></span>{{ item }}</button></div></div>
      <div v-if="product.options?.sizes?.length" class="pdp-option-group"><div class="pdp-option-heading"><strong>Talla</strong><a href="#guia-tallas">Guía de tallas</a></div><div class="pdp-sizes"><button v-for="item in product.options.sizes" :key="item" type="button" :class="{ 'is-selected': size === item }" @click="size = item">{{ item }}</button></div></div>
      <div class="pdp-quantity-row"><strong>Cantidad</strong><div class="pdp-quantity-control"><button type="button" aria-label="Disminuir cantidad" @click="changeQuantity(-1)">−</button><output>{{ quantity }}</output><button type="button" aria-label="Aumentar cantidad" @click="changeQuantity(1)">+</button></div><small v-if="stock !== null">{{ stock }} disponibles</small></div>
      <p v-if="!canAdd" class="pdp-selection-hint">Selecciona las opciones para continuar</p>
      <div class="pdp-actions"><button type="button" class="pdp-buy-button" :disabled="!canAdd" @click="addToCart(true)">COMPRAR AHORA</button><button type="button" class="pdp-cart-button" :disabled="!canAdd" @click="addToCart()">AGREGAR AL CARRITO</button></div>
      <div class="pdp-trust-grid"><span>🚚 <b>Envío</b><small>a todo Colombia</small></span><span>🛡️ <b>Compra</b><small>protegida</small></span><span>💳 <b>Pago contra</b><small>entrega disponible</small></span></div>
      <button type="button" class="pdp-favorite-button" :class="{ 'is-favorite': favorite }" @click="favorite = !favorite">{{ favorite ? '♥' : '♡' }} {{ favorite ? 'Guardado en favoritos' : 'Agregar a favoritos' }}</button>
    </section>
  </Teleport>
</template>
