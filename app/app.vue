<script setup lang="ts">
const cart = useCart()
const menuOpen = ref(false)
const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div v-if="isAdmin"><NuxtLayout><NuxtPage /></NuxtLayout></div>
  <div v-else class="site-shell">
    <div class="announcement">Envíos a todo Colombia · Compra segura y atención cercana</div>
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand" aria-label="NUVIB inicio">
          <img class="brand-logo" src="/Logo/logotip.jpg" alt="NUVIB">
        </NuxtLink>
        <button class="mobile-menu-button" aria-label="Abrir menú" @click="menuOpen = !menuOpen">☰</button>
        <nav class="main-nav" :class="{ 'is-open': menuOpen }">
          <NuxtLink to="/" @click="menuOpen = false">Inicio</NuxtLink>
          <NuxtLink to="/productos" @click="menuOpen = false">Productos</NuxtLink>
          <a href="#categorias" @click="menuOpen = false">Categorías</a>
          <a href="#ofertas" @click="menuOpen = false">Ofertas</a>
        </nav>
        <div class="header-actions">
          <button class="search-button" aria-label="Buscar productos">⌕</button>
          <NuxtLink to="/pedido" class="cart-link" aria-label="Ver carrito">
            <span class="cart-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M3.5 4h2l1.5 11h10.8l2.1-8H6.1"/><path d="M9 19.5h.01M17 19.5h.01"/><path d="M8 8h11"/></svg></span>
            <span>Carrito</span>
            <span v-if="cart.count.value" class="cart-badge">{{ cart.count.value }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>
    <main><NuxtPage /><ProductTrust /></main>
    <CartExperience />
    <ConversionExperience />
    <footer class="site-footer">
      <div class="container footer-grid">
        <div><div class="brand footer-brand"><img class="brand-logo" src="/Logo/logotip.jpg" alt="NUVIB"></div><p>Selección inteligente para tu día a día.</p></div>
        <div><p class="footer-title">Ayuda</p><a href="#">Envíos y entregas</a><a href="#">Preguntas frecuentes</a></div>
        <div><p class="footer-title">Información</p><a href="#">Términos y condiciones</a><a href="#">Política de privacidad</a></div>
        <div><p class="footer-title">Contacto</p><a href="mailto:hola@nuvib.co">hola@nuvib.co</a><span>Lun - Sáb · 8:00 - 18:00</span></div>
      </div>
      <div class="container footer-bottom"><span>© {{ new Date().getFullYear() }} NUVIB</span><span>Compra con confianza.</span></div>
    </footer>
  </div>
</template>
