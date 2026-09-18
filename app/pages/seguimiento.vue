<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const { data, error } = await useFetch<any>(() => token.value ? `/api/orders/track/${token.value}` : '/api/orders/track/invalid')
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })
useSeoMeta({ title: 'Seguimiento de solicitud | NUVIB', robots: 'noindex, nofollow, noarchive' })
const stages = ['Solicitud recibida', 'Confirmación por asesor', 'Pedido activado', 'Despacho', 'Entrega', 'Pago contra entrega']
const stageIndex = computed(() => ({ 'SOLICITUD RECIBIDA': 0, 'NUEVO': 0, 'EN REVISIÓN': 1, 'CONTACTANDO CLIENTE': 1, CONFIRMADO: 2, 'PEDIDO ACTIVADO': 2, 'EN PREPARACIÓN': 2, DESPACHADO: 3, 'EN CAMINO': 3, ENTREGADO: 4, PAGADO: 5 }[data.value!.order.status] ?? 0))
</script>

<template><main class="tracking-page container"><NuxtLink to="/productos" class="back-link">← Volver a la tienda</NuxtLink><div class="tracking-heading"><p class="eyebrow">SEGUIMIENTO NUVIB</p><h1>{{ data.order.orderNumber }}</h1><p>Estado actual: <strong>{{ data.order.status }}</strong></p></div><section class="thanks-card tracking-card"><div v-for="(stage, index) in stages" :key="stage" class="tracking-step" :class="{ active: index <= stageIndex, current: index === stageIndex }"><span>{{ index <= stageIndex ? '✓' : '○' }}</span><strong>{{ stage }}</strong></div></section><section class="thanks-card tracking-history"><p class="eyebrow">ACTUALIZACIONES</p><div v-for="entry in data.history" :key="`${entry.status}-${entry.changedAt}`"><strong>{{ entry.status }}</strong><small>{{ new Date(entry.changedAt).toLocaleString('es-CO') }}</small></div></section></main></template>
