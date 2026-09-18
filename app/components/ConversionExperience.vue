<script setup lang="ts">
const route = useRoute()
const data = ref<any | null>(null)
const product = ref<any | null>(null)
const notification = ref('')
const notificationVisible = ref(false)
const remaining = ref('')
const reducedMotion = ref(false)
const canDisplay = ref(true)
let refreshTimer: number | undefined
let hideTimer: number | undefined
let signalTimer: number | undefined
let countdownTimer: number | undefined

const isProduct = computed(() => route.path.startsWith('/producto/'))
const slug = computed(() => String(route.params.slug || ''))
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const sessionKey = computed(() => `nuvib-conversion-notifications:${slug.value}`)
const notificationsShown = () => Number(sessionStorage.getItem(sessionKey.value) || 0)

const load = async () => {
  if (!isProduct.value || !slug.value) return
  try {
    [product.value, data.value] = await Promise.all([$fetch(`/api/products/${encodeURIComponent(slug.value)}`), $fetch(`/api/products/${encodeURIComponent(slug.value)}/conversion`)]);
    showSignal()
    updateCountdown()
  } catch {
    data.value = null
  }
}

const heartbeat = () => {
  if (isProduct.value && slug.value) $fetch('/api/analytics/visit', { method: 'POST', body: { path: route.fullPath, productSlug: slug.value } }).then((result: any) => { if (data.value?.stats) data.value.stats.activeViewers = result.activeProduct }).catch(() => undefined)
}

const showSignal = () => {
  const stats = data.value?.stats
  const settings = data.value?.settings
  if (!stats || !settings || !settings.enabled || !settings.notifications || !settings.socialProof || !canDisplay.value || notificationsShown() >= settings.maxNotificationsPerSession) return
  const options: string[] = []
  if (settings.activeViewers && stats.activeViewers > 0) options.push(`${stats.activeViewers} ${stats.activeViewers === 1 ? 'persona está' : 'personas están'} viendo este producto`)
  if (settings.orders && stats.confirmedToday > 0) options.push(`Este producto recibió ${stats.confirmedToday} ${stats.confirmedToday === 1 ? 'pedido confirmado' : 'pedidos confirmados'} hoy`)
  if (settings.visits && stats.todayVisits > 0) options.push(`${stats.todayVisits} ${stats.todayVisits === 1 ? 'persona visitó' : 'personas visitaron'} este producto hoy`)
  if (!options.length) return
  notification.value = options[Math.floor(Math.random() * options.length)]
  notificationVisible.value = true
  sessionStorage.setItem(sessionKey.value, String(notificationsShown() + 1))
  if (hideTimer) window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => { notificationVisible.value = false }, (settings.notificationDuration || 5) * 1000)
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
  heartbeat()
  refreshTimer = window.setInterval(() => { load(); heartbeat() }, 60_000)
  signalTimer = window.setInterval(showSignal, Math.max(20, data.value?.settings?.notificationInterval || 45) * 1000)
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
    <div v-if="isProduct && canDisplay && data?.settings?.enabled && notificationVisible" class="conversion-notification" :class="{ 'reduced-motion': reducedMotion }" role="status" aria-live="polite"><span class="conversion-dot"></span><span>{{ notification }}</span></div>
    <div v-if="isProduct && canDisplay && data?.settings?.enabled && ((data.product.offerActive && data.settings.offers) || (data.settings.stockAlerts && data.product.stock <= data.settings.stockThreshold))" class="conversion-panel" :class="{ 'reduced-motion': reducedMotion }">
      <div v-if="data.product.offerActive && data.settings.offers" class="conversion-offer"><strong>OFERTA ESPECIAL</strong><span>Termina en {{ remaining }}</span><b>{{ money(data.product.promotionalPrice) }}</b></div>
      <div v-if="data.settings.stockAlerts && data.product.stock <= data.settings.stockThreshold && data.product.stock > 0" class="conversion-stock">Quedan {{ data.product.stock }} {{ data.product.stock === 1 ? 'unidad disponible' : 'unidades disponibles' }}</div>
    </div>
  </Teleport>
</template>
