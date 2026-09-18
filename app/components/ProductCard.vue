<script setup lang="ts">
import type { Product } from '~/data/products'

defineProps<{ product: Product }>()
const cart = useCart()
const cartFeedback = useCartFeedback()
const formatPrice = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const addToCart = (product: Product) => { cart.add(product.slug); cartFeedback.show(product.name) }
</script>

<template>
  <article class="product-card">
    <NuxtLink :to="`/producto/${product.slug}`" class="product-image-wrap">
      <span v-if="product.tag" class="product-tag">{{ product.tag }}</span>
      <img :src="product.image" :alt="product.name" loading="lazy" class="product-image">
    </NuxtLink>
    <div class="product-info">
      <p class="eyebrow">{{ product.category }}</p>
      <NuxtLink :to="`/producto/${product.slug}`" class="product-name">{{ product.name }}</NuxtLink>
      <div class="price-row"><strong>{{ formatPrice(product.price) }}</strong><del v-if="product.oldPrice">{{ formatPrice(product.oldPrice) }}</del></div>
       <button class="button is-dark is-fullwidth add-button" @click="addToCart(product)">Agregar al carrito <span>+</span></button>
    </div>
  </article>
</template>
