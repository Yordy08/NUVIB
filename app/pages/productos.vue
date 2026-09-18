<script setup lang="ts">
import type { Product } from '~/data/products'
const { data: products, pending } = await useFetch<Product[]>('/api/products')
const query = ref('')
const selectedCategory = ref('Todas')
const categories = computed(() => ['Todas', ...new Set((products.value || []).map(product => product.category))])
const filteredProducts = computed(() => (products.value || []).filter(product => (selectedCategory.value === 'Todas' || product.category === selectedCategory.value) && product.name.toLowerCase().includes(query.value.toLowerCase())))
</script>

<template>
  <section class="catalog-page container"><div class="catalog-header"><div><p class="eyebrow">CATÁLOGO NUVIB</p><h1>Todo lo que suma a tu día</h1><p>Una selección de productos pensada para vivir mejor.</p></div><div class="catalog-search"><span>⌕</span><input v-model="query" type="search" placeholder="Buscar productos"></div></div><div v-if="pending" class="catalog-empty"><span class="empty-orbit">✦</span><h2>Cargando el catálogo</h2><p>Estamos preparando la selección para ti.</p></div><template v-else><div class="catalog-toolbar"><div class="category-pills"><button v-for="category in categories" :key="category" :class="{ active: selectedCategory === category }" @click="selectedCategory = category">{{ category }}</button></div><span>{{ filteredProducts.length }} productos</span></div><div v-if="filteredProducts.length" class="products-grid"><ProductCard v-for="product in filteredProducts" :key="product.slug" :product="product" /></div><div v-else class="catalog-empty"><span class="empty-orbit">✦</span><h2>El catálogo se está preparando</h2><p>Pronto podrás descubrir los productos seleccionados para ti.</p></div></template></section>
</template>
