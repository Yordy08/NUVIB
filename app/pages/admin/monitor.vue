<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data, pending, refresh } = await useFetch<any>('/api/admin/monitor')
const maxVisits = computed(() => Math.max(1, ...(data.value?.daily || []).map((item: any) => item.visits)))
const refreshMonitor = () => refresh()
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(refreshMonitor, 60_000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template><div class="admin-page"><div class="admin-page-heading"><div><p class="eyebrow">ANALÍTICA</p><h1>Monitor de visitantes</h1><p>Datos agregados y anónimos de actividad en la tienda.</p></div><button class="button is-light" @click="refreshMonitor">Actualizar</button></div><div v-if="pending" class="admin-loading">Cargando monitor...</div><div v-else><div class="monitor-hero"><div><span>PERSONAS EN LA TIENDA AHORA</span><strong>{{ data?.active || 0 }}</strong><small>Actividad en los últimos 5 minutos</small></div><div class="monitor-last">Última actividad<br><b>{{ data?.lastActivityAt ? new Date(data.lastActivityAt).toLocaleTimeString('es-CO') : 'Sin datos' }}</b></div></div><div class="metric-grid"><div><span>Visitas hoy</span><strong>{{ data?.today || 0 }}</strong></div><div><span>Ayer</span><strong>{{ data?.yesterday || 0 }}</strong></div><div><span>Últimos 7 días</span><strong>{{ data?.last7 || 0 }}</strong></div><div><span>Últimos 30 días</span><strong>{{ data?.last30 || 0 }}</strong></div><div><span>Total histórico</span><strong>{{ data?.historical || 0 }}</strong></div></div><div class="chart-card"><h2>Visitas por día</h2><div v-if="!data?.daily?.length" class="admin-loading">Aún no hay suficientes datos.</div><div v-else class="bar-chart"><div v-for="item in data.daily" :key="item._id" class="bar-item"><div class="bar" :style="{ height: `${Math.max(8, item.visits / maxVisits * 150)}px` }"><span>{{ item.visits }}</span></div><small>{{ item._id.slice(5) }}</small></div></div></div></div></div></template>
