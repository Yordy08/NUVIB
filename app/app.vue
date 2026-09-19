<script setup lang="ts">
const cart = useCart()
const menuOpen = ref(false)
const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const searchQuery = ref('')
const announcementMessages = ['Compra segura en NUVIB', 'Envíos a todo Colombia', 'Paga al recibir tu pedido']
const announcementIndex = ref(0)
let announcementTimer: ReturnType<typeof setInterval> | undefined
const submitSearch = () => { if (searchQuery.value.trim()) navigateTo({ path: '/productos', query: { buscar: searchQuery.value.trim() } }) }
onMounted(() => { announcementTimer = setInterval(() => { announcementIndex.value = (announcementIndex.value + 1) % announcementMessages.length }, 4000) })
onBeforeUnmount(() => { if (announcementTimer) clearInterval(announcementTimer) })
</script>

<template>
  <div v-if="isAdmin"><NuxtLayout><NuxtPage /></NuxtLayout></div>
  <div v-else class="site-shell">
    <div class="announcement" aria-live="polite">{{ announcementMessages[announcementIndex] }}</div>
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand" aria-label="NUVIB inicio">
          <img class="brand-logo" src="/Logo/logotip.jpg" alt="NUVIB">
          <span class="mobile-brand-name">NUVIB</span>
        </NuxtLink>
        <button class="mobile-menu-button" aria-label="Abrir menú" @click="menuOpen = !menuOpen">☰</button>
        <nav class="main-nav" :class="{ 'is-open': menuOpen }">
          <NuxtLink to="/" @click="menuOpen = false">Inicio</NuxtLink>
          <NuxtLink to="/productos" @click="menuOpen = false">Productos</NuxtLink>
          <a href="#categorias" @click="menuOpen = false">Categorías</a>
          <a href="#ofertas" @click="menuOpen = false">Ofertas</a>
        </nav>
        <div class="header-actions">
          <form class="header-search" role="search" @submit.prevent="submitSearch"><span aria-hidden="true">⌕</span><input v-model="searchQuery" type="search" placeholder="Buscar en NUVIB..." aria-label="Buscar productos"><button type="submit" aria-label="Buscar">→</button></form>
          <NuxtLink to="/pedido" class="cart-link" aria-label="Ver carrito">
            <span class="cart-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M3.5 4h2l1.5 11h10.8l2.1-8H6.1"/><path d="M9 19.5h.01M17 19.5h.01"/><path d="M8 8h11"/></svg></span>
            <span>Carrito</span>
            <span v-if="cart.count.value" class="cart-badge">{{ cart.count.value }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>
    <main><NuxtPage /><ProductGallerySlider /><ProductOptionsPanel /><ProductTrust /></main>
    <CartExperience />
    <footer class="site-footer">
      <div class="container footer-grid">
        <div><div class="brand footer-brand"><img class="brand-logo" src="/Logo/logotip.jpg" alt="NUVIB"></div><p>Selección inteligente para tu día a día.</p></div>
        <div><p class="footer-title">Ayuda</p><NuxtLink to="/envios">Envíos y entregas</NuxtLink><NuxtLink to="/preguntas-frecuentes">Preguntas frecuentes</NuxtLink></div>
        <div><p class="footer-title">Información</p><NuxtLink to="/terminos-y-condiciones">Términos y condiciones</NuxtLink><NuxtLink to="/politica-de-privacidad">Política de privacidad</NuxtLink></div>
        <div><p class="footer-title">Contacto</p><a href="mailto:info@nuvib.com">info@nuvib.com</a><span>Lun - Sáb · 8:00 - 18:00</span></div>
      </div>
      <div class="container footer-bottom"><span>© {{ new Date().getFullYear() }} NUVIB. Todos los derechos reservados.</span><span>Compra con confianza.</span></div>
    </footer>
  </div>
</template>
