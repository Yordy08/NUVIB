<script setup lang="ts">
import type { Product } from '~/data/products'
const { data: catalog } = await useFetch<Product[]>('/api/products')
const featured = computed(() => (catalog.value || []).slice(0, 3))
</script>

<template>
  <div>
    <section id="categorias" class="section container"><div class="section-heading"><div><p class="eyebrow">EXPLORA</p><h2>Encuentra tu próxima favorita</h2></div><a href="/productos">Ver categorías <span>→</span></a></div><div class="category-grid"><a href="/productos?categoria=Hogar" class="category-card category-home"><span>Hogar</span><small>Funcionalidad diaria</small></a><a href="/productos?categoria=Tecnología" class="category-card category-tech"><span>Tecnología</span><small>Conecta con lo que importa</small></a><a href="/productos?categoria=Bienestar" class="category-card category-well"><span>Bienestar</span><small>Momentos para ti</small></a></div></section>

    <section id="ofertas" class="section section-muted"><div class="container"><div class="section-heading"><div><p class="eyebrow">SELECCIÓN DE LA SEMANA</p><h2>Favoritos que hablan por sí solos</h2></div><NuxtLink to="/productos">Ver todos <span>→</span></NuxtLink></div><div v-if="featured.length" class="products-grid"><ProductCard v-for="product in featured" :key="product.slug" :product="product" /></div><div v-else class="catalog-empty"><span class="empty-orbit">✦</span><h3>Estamos preparando algo especial</h3><p>Muy pronto encontrarás aquí la selección NUVIB.</p></div></div></section>
    <section class="container promise"><div><span class="promise-icon">✦</span><strong>Elegido con criterio</strong><p>Productos útiles, bonitos y hechos para acompañarte.</p></div><div><span class="promise-icon">⌁</span><strong>Compra sin complicaciones</strong><p>Proceso claro y atención cuando la necesites.</p></div><div><span class="promise-icon">◌</span><strong>Envíos confiables</strong><p>Recibe tu pedido donde estés en Colombia.</p></div></section>
  </div>
</template>
