<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const { data, error } = await useFetch<any>(() => token.value ? `/api/orders/track/${token.value}` : '/api/orders/track/invalid')
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada' })

useSeoMeta({ title: 'Solicitud recibida | NUVIB', robots: 'noindex, nofollow, noarchive' })
const config = useRuntimeConfig()
const order = computed(() => data.value!.order)
const stages = ['Solicitud recibida', 'Confirmación por asesor', 'Pedido activado', 'Despacho', 'Entrega', 'Pago contra entrega']
const stageIndex = computed(() => {
  const status = order.value.status
  if (status === 'SOLICITUD RECIBIDA' || status === 'NUEVO') return 0
  if (['EN REVISIÓN', 'CONTACTANDO CLIENTE'].includes(status)) return 1
  if (['CONFIRMADO', 'PEDIDO ACTIVADO', 'EN PREPARACIÓN'].includes(status)) return 2
  if (['DESPACHADO', 'EN CAMINO'].includes(status)) return 3
  if (status === 'ENTREGADO') return 4
  if (status === 'PAGADO') return 5
  return 0
})
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const whatsapp = computed(() => config.public.whatsappNumber ? `https://wa.me/${String(config.public.whatsappNumber).replace(/\D/g, '')}` : '')
const copyOrder = async () => { await navigator.clipboard.writeText(order.value.orderNumber); window.alert('Número de pedido copiado') }
</script>

<template>
  <main class="thanks-page">
    <section class="thanks-shell container">
      <div class="thanks-hero">
        <div class="thanks-mark" aria-hidden="true"><span>✓</span></div>
        <p class="eyebrow">SOLICITUD RECIBIDA</p>
        <h1>¡Gracias por elegir NUVIB!</h1>
        <p class="thanks-lead">Recibimos correctamente tu solicitud de pedido.</p>
        <p class="thanks-copy">Uno de nuestros asesores se comunicará contigo para confirmar tus datos y activar tu pedido.</p>
      </div>

      <div class="thanks-grid">
        <section class="thanks-card order-received-card">
          <div class="thanks-card-heading"><div><p class="eyebrow">RESUMEN DE SOLICITUD</p><h2>{{ order.orderNumber }}</h2></div><span class="order-status-pill">{{ order.status }}</span></div>
          <div class="thanks-order-items"><div v-for="item in data.items" :key="item.slug" class="thanks-order-item"><div><strong>{{ item.name }}</strong><small>{{ item.size ? `Talla: ${item.size} · ` : '' }}{{ item.color ? `Color: ${item.color} · ` : '' }}Cantidad: {{ item.quantity }}</small></div><strong>{{ money(item.total) }}</strong></div></div>
          <div class="thanks-total"><span>Total solicitado</span><strong>{{ money(order.total) }}</strong></div>
          <div class="thanks-meta"><div><span>Forma de pago</span><strong>{{ order.paymentMethod }}</strong></div><div><span>Cliente</span><strong>{{ order.customer.name }}</strong></div><div><span>Entrega</span><strong>{{ order.delivery.city }}, {{ order.delivery.department }}</strong></div></div>
          <div class="copy-order"><span>Guarda este número para futuras consultas.</span><button type="button" class="copy-button" @click="copyOrder">COPIAR NÚMERO DE PEDIDO</button></div>
        </section>

        <aside class="thanks-side">
          <section class="thanks-card progress-card"><p class="eyebrow">ASÍ CONTINÚA</p><h2>Tu solicitud está en buenas manos</h2><div class="order-progress"><div v-for="(stage, index) in stages" :key="stage" class="progress-step" :class="{ active: index <= stageIndex, current: index === stageIndex }"><span class="progress-dot">{{ index <= stageIndex ? '✓' : '○' }}</span><span>{{ stage }}</span></div></div></section>
          <section v-if="order.paymentMethod === 'CONTRA ENTREGA'" class="cash-card"><span class="cash-icon">$</span><div><strong>Paga al recibir</strong><p>Cuando recibas tu pedido, podrás realizar el pago correspondiente al producto y al envío.</p></div></section>
        </aside>
      </div>

      <section class="next-step-card"><div><p class="eyebrow">¿QUÉ SIGUE?</p><h2>Un asesor te contactará pronto.</h2><p>Nuestro equipo confirmará la información de entrega y, una vez validada, activará tu pedido para continuar con el despacho.</p></div><div class="thanks-actions"><NuxtLink :to="`/seguimiento?token=${token}`" class="button thanks-primary">VER MI PEDIDO <span>↗</span></NuxtLink><NuxtLink to="/productos" class="button thanks-secondary">SEGUIR COMPRANDO</NuxtLink><a v-if="whatsapp" :href="whatsapp" target="_blank" rel="noopener noreferrer" class="contact-link">CONTACTAR ASESOR</a></div></section>
    </section>
  </main>
</template>
