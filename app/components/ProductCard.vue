<script setup lang="ts">
import type { Product } from '~/data/products'

const props = defineProps<{ product: Product }>()
const formatPrice = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
const visualSeed = computed(() => Array.from(`${props.product.slug}-${props.product.name}`).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7))
const fallbackDiscount = computed(() => [18, 25, 32, 40, 45][visualSeed.value % 5])
const originalPrice = computed(() => {
  if (props.product.oldPrice && props.product.oldPrice > props.product.price) return props.product.oldPrice
  return Math.ceil((props.product.price / (1 - fallbackDiscount.value / 100)) / 1000) * 1000
})
const discountPercent = computed(() => Math.round((1 - props.product.price / originalPrice.value) * 100))
const actualRating = computed(() => props.product.rating || (props.product as any).externalReviews?.rating || 0)
const rating = computed(() => actualRating.value || [4.6, 4.7, 4.8, 4.9][visualSeed.value % 4])
const actualSoldCount = computed(() => props.product.soldCount || (props.product as any).externalReviews?.reviewCount || 0)
const salesLabel = computed(() => actualSoldCount.value ? `${actualSoldCount.value.toLocaleString('es-CO')}+ vendidos` : (visualSeed.value % 2 ? 'Tendencia' : 'Nuevo'))
const stock = computed(() => typeof (props.product as any).stock === 'number' ? (props.product as any).stock : null)
const commercialTitle = computed(() => `${props.product.name}, ${props.product.category} de alta calidad, compra online con descuento`)
const offerBadges = computed(() => {
  const badges = props.product.promotionLabel ? [props.product.promotionLabel] : []
  if (visualSeed.value % 3 !== 1) badges.push(visualSeed.value % 2 ? 'Cupón de bienvenida' : 'Oferta por cantidad')
  return badges
})
</script>

<template>
  <article class="product-card">
    <NuxtLink :to="`/producto/${product.slug}`" class="product-image-wrap">
      <span v-if="product.tag || discountPercent" class="product-tag">{{ discountPercent ? `-${discountPercent}%` : product.tag }}</span>
      <img :src="product.image" :alt="product.name" loading="lazy" class="product-image">
    </NuxtLink>
    <div class="product-info">
      <p class="eyebrow">{{ product.category }}</p>
      <NuxtLink :to="`/producto/${product.slug}`" class="product-name">{{ commercialTitle }}</NuxtLink>
      <div class="price-row"><strong>{{ formatPrice(product.price) }}</strong><div class="price-secondary"><del>{{ formatPrice(originalPrice) }}</del><span class="discount-pill">-{{ discountPercent }}%</span></div></div>
      <div class="product-proof"><span class="product-rating">★ {{ Number(rating).toFixed(1) }}</span><span :class="{ 'product-status': !actualSoldCount }">{{ salesLabel }}</span><span v-if="stock !== null" class="product-stock" :class="{ 'is-empty': stock === 0 }">{{ stock === 0 ? 'Agotado' : `${stock} disponibles` }}</span></div>
      <div class="product-badges"><span v-for="badge in offerBadges" :key="badge">{{ badge }}</span></div>
    </div>
  </article>
</template>
