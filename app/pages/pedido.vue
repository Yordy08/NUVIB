<script setup lang="ts">
import type { Product } from '~/data/products'
const cart = useCart()
const { data: catalog } = await useFetch<Product[]>('/api/products')
const form = reactive({ name: '', phone: '', department: '', city: '', address: '', additional: '' })
const submitting = ref(false); const errorMessage = ref('')
const cartProducts = computed(() => cart.items.value.map(item => ({ ...item, product: (catalog.value || []).find(product => product.slug === item.slug) })).filter(item => item.product))
const subtotal = computed(() => cartProducts.value.reduce((sum, item) => sum + item.product!.price * item.quantity, 0))
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const submit = async () => {
  if (!cartProducts.value.length) return
  submitting.value = true; errorMessage.value = ''
  try {
    const result = await $fetch<{ orderNumber: string; publicToken: string }>('/api/orders', { method: 'POST', body: { customer: { name: form.name, phone: form.phone }, delivery: { department: form.department, city: form.city, address: form.address, additional: form.additional }, items: cartProducts.value.map(item => ({ slug: item.product!.slug, quantity: item.quantity })) } })
    cart.items.value = []
    await navigateTo(`/gracias?token=${encodeURIComponent(result.publicToken)}`)
  } catch (error: any) { errorMessage.value = error?.data?.message || 'No pudimos registrar la solicitud. Intenta nuevamente.' } finally { submitting.value = false }
}
</script>

<template>
  <section class="container checkout-page"><div class="checkout-intro"><p class="eyebrow">SOLICITUD DE PEDIDO</p><h1>Recibe tu pedido<br><em>sin complicaciones.</em></h1><p>Completa tus datos. Un asesor NUVIB te contactará para confirmar la información antes del despacho.</p></div><div v-if="!cartProducts.length" class="empty-state"><h2>Tu pedido está vacío</h2><NuxtLink to="/productos" class="button is-dark">Explorar productos</NuxtLink></div><form v-else class="checkout-grid" @submit.prevent="submit"><div class="checkout-form"><div class="form-block"><h2>Datos de contacto</h2><div class="form-row"><label>Nombre completo<input v-model="form.name" required autocomplete="name" placeholder="Tu nombre"></label><label>Teléfono<input v-model="form.phone" required autocomplete="tel" inputmode="tel" placeholder="300 000 0000"></label></div></div><div class="form-block"><h2>Datos de entrega</h2><div class="form-row"><label>Departamento<input v-model="form.department" required placeholder="Ej. Córdoba"></label><label>Ciudad / municipio<input v-model="form.city" required placeholder="Ej. Montería"></label></div><label>Dirección<input v-model="form.address" required autocomplete="street-address" placeholder="Calle, carrera, número"></label><label>Información adicional <span>(opcional)</span><textarea v-model="form.additional" rows="3" placeholder="Referencias para encontrar tu dirección"></textarea></label></div><p class="checkout-notice">Enviar esta solicitud no significa que el pedido esté confirmado. Un asesor se comunicará contigo.</p><p v-if="errorMessage" class="form-error">{{ errorMessage }}</p><button class="button is-dark submit-order" :disabled="submitting">{{ submitting ? 'Enviando solicitud...' : 'Enviar solicitud' }} <span>↗</span></button></div><aside class="order-summary"><h2>Resumen</h2><div v-for="item in cartProducts" :key="item.slug" class="summary-item"><div><strong>{{ item.product!.name }}</strong><small>{{ item.quantity }} × {{ money(item.product!.price) }}</small></div><button type="button" aria-label="Quitar producto" @click="cart.remove(item.slug)">×</button></div><div class="summary-total"><span>Total estimado</span><strong>{{ money(subtotal) }}</strong></div><p class="summary-delivery">Pago contra entrega. El valor del envío se confirma con el asesor.</p></aside></form></section>
</template>
