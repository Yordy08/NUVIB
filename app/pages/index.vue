<script setup lang="ts">
import type { Product } from '~/data/products'
const { data: catalog } = await useFetch<Product[]>('/api/products')
const { data: publications } = await useFetch<any[]>('/api/publications')
const featured = computed(() => (catalog.value || []).slice(0, 3))
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy"><p class="eyebrow light">LO QUE NECESITAS, MEJOR ELEGIDO</p><h1>Pequeñas mejoras.<br><em>Grandes cambios.</em></h1><p class="hero-text">Descubre productos funcionales y bonitos que hacen que cada día se sienta un poco más tuyo.</p><NuxtLink to="/productos" class="button hero-button">Comprar ahora <span>↗</span></NuxtLink></div>
        <div class="hero-visual"><img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=90" alt="Selección de productos NUVIB"><div class="hero-note"><strong>Selección NUVIB</strong><span>Diseño que se disfruta</span></div></div>
      </div>
    </section>

    <section id="categorias" class="section container"><div class="section-heading"><div><p class="eyebrow">EXPLORA</p><h2>Encuentra tu próxima favorita</h2></div><a href="/productos">Ver categorías <span>→</span></a></div><div class="category-grid"><a href="/productos?categoria=Hogar" class="category-card category-home"><span>Hogar</span><small>Funcionalidad diaria</small></a><a href="/productos?categoria=Tecnología" class="category-card category-tech"><span>Tecnología</span><small>Conecta con lo que importa</small></a><a href="/productos?categoria=Bienestar" class="category-card category-well"><span>Bienestar</span><small>Momentos para ti</small></a></div></section>

    <section id="ofertas" class="section section-muted"><div class="container"><div class="section-heading"><div><p class="eyebrow">SELECCIÓN DE LA SEMANA</p><h2>Favoritos que hablan por sí solos</h2></div><NuxtLink to="/productos">Ver todos <span>→</span></NuxtLink></div><div v-if="featured.length" class="products-grid"><ProductCard v-for="product in featured" :key="product.slug" :product="product" /></div><div v-else class="catalog-empty"><span class="empty-orbit">✦</span><h3>Estamos preparando algo especial</h3><p>Muy pronto encontrarás aquí la selección NUVIB.</p></div><div v-if="publications?.length" class="home-publications"><div class="section-heading"><div><p class="eyebrow">CONTENIDO NUVIB</p><h2>Descubre nuestras publicaciones</h2></div><NuxtLink to="/blog">Ver todas <span>→</span></NuxtLink></div><div class="products-grid"><article v-for="publication in publications.slice(0, 3)" :key="publication._id" class="product-card"><NuxtLink :to="`/blog/${publication.slug}`" class="product-image-wrap"><img v-if="publication.image" :src="publication.image" :alt="publication.title" class="product-image"><img v-else src="/Logo/logotip.jpg" :alt="publication.title" class="product-image"></NuxtLink><div class="product-info"><p class="eyebrow">PUBLICADO</p><NuxtLink :to="`/blog/${publication.slug}`" class="product-name">{{ publication.title }}</NuxtLink><NuxtLink :to="`/blog/${publication.slug}`" class="table-action">Ver publicación →</NuxtLink></div></article></div></div></div></section>
    <section class="container promise"><div><span class="promise-icon">✦</span><strong>Elegido con criterio</strong><p>Productos útiles, bonitos y hechos para acompañarte.</p></div><div><span class="promise-icon">⌁</span><strong>Compra sin complicaciones</strong><p>Proceso claro y atención cuando la necesites.</p></div><div><span class="promise-icon">◌</span><strong>Envíos confiables</strong><p>Recibe tu pedido donde estés en Colombia.</p></div></section>
  </div>
</template>
