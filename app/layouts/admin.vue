<script setup lang="ts">
const open = ref(false)
const groups = [
  { label: 'GESTIÓN', items: [{ label: 'Contenido', icon: '✎', to: '/admin/publicaciones' }, { label: 'Productos', icon: '▦', to: '/admin/productos' }, { label: 'Pedidos', icon: '▤', to: '/admin/pedidos' }, { label: 'Clientes', icon: '♙', to: '/admin/clientes' }, { label: 'Reseñas', icon: '★', to: '/admin/resenas' }] },
  { label: 'ANÁLISIS', items: [{ label: 'Dashboard', icon: '⌂', to: '/admin', exact: true }, { label: 'Monitor', icon: '◌', to: '/admin/monitor' }, { label: 'Conversión', icon: '◈', to: '/admin/configuracion/conversion' }] }
]
const closeMobileNav = () => { open.value = false }
const logout = async () => { await $fetch('/api/auth/logout', { method: 'POST' }); await navigateTo('/admin/login') }
</script>

<template>
  <div class="admin-shell">
    <div v-if="open" class="admin-nav-backdrop" @click="closeMobileNav"></div>
    <aside class="admin-sidebar" :class="{ open }">
      <div class="admin-brand"><img class="brand-logo" src="/Logo/logotip.jpg" alt="NUVIB"><small>OPERACIONES</small></div>
      <nav class="admin-nav" aria-label="Navegación administrativa">
        <div v-for="group in groups" :key="group.label" class="admin-nav-group"><p>{{ group.label }}</p><NuxtLink v-for="item in group.items" :key="item.to" :to="item.to" :exact="item.exact" active-class="is-active" @click="closeMobileNav"><span class="admin-nav-icon">{{ item.icon }}</span><span>{{ item.label }}</span></NuxtLink></div>
        <div class="admin-nav-divider"></div><NuxtLink to="/productos" target="_blank" class="admin-store-link" @click="closeMobileNav"><span class="admin-nav-icon">↗</span><span>Ver tienda</span><small>Abre en otra pestaña</small></NuxtLink>
      </nav>
      <div class="admin-sidebar-footer"><div class="admin-account"><span class="account-avatar">N</span><div><strong>NUVIB</strong><small>Administrador</small></div></div><button class="admin-logout" @click="logout"><span>⇥</span> Cerrar sesión</button></div>
    </aside>
    <div class="admin-main"><header class="admin-topbar"><button class="admin-mobile-toggle" aria-label="Abrir navegación" @click="open = !open">☰</button><div class="admin-breadcrumb"><span>NUVIB</span><b>/</b><strong>Administración</strong></div><div class="admin-top-actions"><span class="admin-status">● Sesión segura</span><span class="topbar-separator"></span><span class="topbar-date">{{ new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) }}</span></div></header><nav class="admin-viewbar" aria-label="Vistas del administrador"><NuxtLink to="/admin" exact-active-class="is-active">⌂ <span>Dashboard</span></NuxtLink><NuxtLink to="/admin/publicaciones" active-class="is-active">✎ <span>Contenido</span></NuxtLink><NuxtLink to="/admin/productos" active-class="is-active">▦ <span>Productos</span></NuxtLink><NuxtLink to="/admin/pedidos" active-class="is-active">▤ <span>Pedidos</span></NuxtLink><NuxtLink to="/admin/clientes" active-class="is-active">♙ <span>Clientes</span></NuxtLink><NuxtLink to="/admin/resenas" active-class="is-active">★ <span>Reseñas</span></NuxtLink><NuxtLink to="/admin/configuracion/conversion" active-class="is-active">◈ <span>Conversión</span></NuxtLink><NuxtLink to="/admin/monitor" active-class="is-active">◌ <span>Monitor</span></NuxtLink></nav><main class="admin-content"><slot /></main></div>
  </div>
</template>
