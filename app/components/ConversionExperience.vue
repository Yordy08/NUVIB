<script setup lang="ts">
const route = useRoute()
const data = ref<any | null>(null)
const product = ref<any | null>(null)
const notification = ref('')
const notificationTime = ref('')
const notificationVisible = ref(false)
const remaining = ref('')
const reducedMotion = ref(false)
const canDisplay = ref(true)
const recentSales = [
  { city: 'Medellín', count: 1, time: 'Hace 2 minutos' },
  { city: 'Bogotá', count: 2, time: 'Hace 5 minutos' },
  { city: 'Cali', count: 1, time: 'Hace 12 minutos' },
  { city: 'Bucaramanga', count: 3, time: 'Hace 8 minutos' },
  { city: 'Barranquilla', count: 1, time: 'Hace 15 minutos' },
  { city: 'Pereira', count: 1, time: 'Hace 20 minutos' },
  { city: 'Cartagena', count: 2, time: 'Hace 4 minutos' }
]
let refreshTimer: number | undefined
let hideTimer: number | undefined
let signalTimer: number | undefined
let countdownTimer: number | undefined

const isProduct = computed(() => route.path.startsWith('/producto/'))
const slug = computed(() => String(route.params.slug || ''))
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const sessionKey = computed(() => `nuvib-conversion-notifications:v3:${slug.value}`)
const notificationsShown = () => Number(sessionStorage.getItem(sessionKey.value) || 0)

const load = async () => {
  if (!isProduct.value || !slug.value) return
  try {
    [product.value, data.value] = await Promise.all([$fetch(`/api/products/${encodeURIComponent(slug.value)}`), $fetch(`/api/products/${encodeURIComponent(slug.value)}/conversion`)]);
    updateCountdown()
  } catch {
    data.value = null
  }
}

const heartbeat = async () => {
  if (isProduct.value && slug.value) {
    try {
      const result: any = await $fetch('/api/analytics/visit', { method: 'POST', body: { path: route.fullPath, productSlug: slug.value } })
      if (data.value?.stats) data.value.stats.activeViewers = result.activeProduct
    } catch { return }
  }
}

const showSignal = () => {
  if (!isProduct.value || !canDisplay.value || notificationsShown() >= 3) return
  const sale = recentSales[Math.floor(Math.random() * recentSales.length)]
  notification.value = sale.count > 1 ? `${sale.count} personas en ${sale.city} acaban de pedir este producto` : `Una persona en ${sale.city} acaba de pedir este producto`
  notificationTime.value = `${sale.time} · NUVIB`
  notificationVisible.value = true
  sessionStorage.setItem(sessionKey.value, String(notificationsShown() + 1))
  if (hideTimer) window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => { notificationVisible.value = false; scheduleNextNotification() }, 5000)
}

const scheduleNextNotification = () => {
  if (signalTimer) window.clearTimeout(signalTimer)
  signalTimer = window.setTimeout(() => { showSignal() }, Math.floor(Math.random() * 15001) + 15000)
}

const closeNotification = () => {
  notificationVisible.value = false
  if (hideTimer) window.clearTimeout(hideTimer)
  scheduleNextNotification()
}

const updateCountdown = () => {
  const end = data.value?.product.offerEndAt ? new Date(data.value.product.offerEndAt).getTime() : 0
  const distance = end - Date.now()
  if (!end || distance <= 0) { remaining.value = ''; return }
  const hours = Math.floor(distance / 3600000).toString().padStart(2, '0')
  const minutes = Math.floor(distance % 3600000 / 60000).toString().padStart(2, '0')
  const seconds = Math.floor(distance % 60000 / 1000).toString().padStart(2, '0')
  remaining.value = `${hours}:${minutes}:${seconds}`
}

onMounted(async () => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 767px)').matches
  await load()
  canDisplay.value = mobile ? data.value?.settings?.showOnMobile !== false : data.value?.settings?.showOnDesktop !== false
  await heartbeat()
  signalTimer = window.setTimeout(() => { showSignal() }, 3000)
  refreshTimer = window.setInterval(() => { load(); heartbeat() }, 60_000)
  countdownTimer = window.setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
  if (signalTimer) window.clearInterval(signalTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
  if (hideTimer) window.clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isProduct && canDisplay && notificationVisible" class="conversion-notification" :class="{ 'reduced-motion': reducedMotion }" role="status" aria-live="polite"><button type="button" class="conversion-notification-close" aria-label="Cerrar notificación" @click="closeNotification">×</button><div class="conversion-notification-content"><span class="conversion-notification-icon">🛍️</span><div><p>{{ notification }}</p><small>{{ notificationTime }}</small></div></div></div>
    <div v-if="isProduct && canDisplay && data?.settings?.enabled && ((data.product.offerActive && data.settings.offers) || (data.settings.stockAlerts && data.product.stock <= data.settings.stockThreshold))" class="conversion-panel" :class="{ 'reduced-motion': reducedMotion }">
      <div v-if="data.product.offerActive && data.settings.offers" class="conversion-offer"><strong>OFERTA ESPECIAL</strong><span>Termina en {{ remaining }}</span><b>{{ money(data.product.promotionalPrice) }}</b></div>
      <div v-if="data.settings.stockAlerts && data.product.stock <= data.settings.stockThreshold && data.product.stock > 0" class="conversion-stock">Quedan {{ data.product.stock }} {{ data.product.stock === 1 ? 'unidad disponible' : 'unidades disponibles' }}</div>
    </div>
  </Teleport>
</template>
