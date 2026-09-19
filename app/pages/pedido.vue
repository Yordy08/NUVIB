<script setup lang="ts">
import type { Product } from '~/data/products'

const cart = useCart()
const { data: catalog } = await useFetch<Product[]>('/api/products')
const form = reactive({ firstName: '', lastName: '', phone: '', country: 'Colombia', department: '', city: '', address: '', additional: '', email: '' })
const submitting = ref(false)
const errorMessage = ref('')
const cartProducts = computed(() => cart.items.value.map(item => ({ ...item, product: (catalog.value || []).find(product => product.slug === item.slug) })).filter(item => item.product))
const subtotal = computed(() => cartProducts.value.reduce((sum, item) => sum + item.product!.price * item.quantity, 0))
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const submit = async () => {
  if (!cartProducts.value.length) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<{ orderNumber: string; publicToken: string }>('/api/orders', {
      method: 'POST',
      body: {
        customer: { name: `${form.firstName} ${form.lastName}`.trim(), firstName: form.firstName, lastName: form.lastName, phone: form.phone, email: form.email },
        delivery: { country: form.country, department: form.department, city: form.city, address: form.address, additional: form.additional },
         items: cartProducts.value.map(item => ({ productId: item.product!._id, slug: item.product!.slug, quantity: item.quantity, size: item.size, color: item.color }))
      }
    })
    cart.items.value = []
    await navigateTo(`/gracias?token=${encodeURIComponent(result.publicToken)}`)
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'No pudimos registrar la solicitud. Intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="container checkout-page">
    <div class="checkout-intro"><p class="eyebrow">SOLICITUD DE PEDIDO</p><h1>Recibe tu pedido<br><em>sin complicaciones.</em></h1><p>Completa tus datos. Un asesor NUVIB te contactará para confirmar la información antes del despacho.</p></div>
    <div v-if="!cartProducts.length" class="empty-state"><h2>Tu pedido está vacío</h2><NuxtLink to="/productos" class="button is-dark">Explorar productos</NuxtLink></div>
    <form v-else class="checkout-grid" @submit.prevent="submit">
      <div class="checkout-form">
        <div class="form-block"><h2>Datos de contacto</h2><div class="form-row"><label>Nombres<input v-model="form.firstName" required autocomplete="given-name" placeholder="Ingrese sus nombres"></label><label>Apellidos<input v-model="form.lastName" required autocomplete="family-name" placeholder="Ingrese sus apellidos"></label></div><div class="form-row"><label>Número de teléfono<input v-model="form.phone" required autocomplete="tel" inputmode="tel" pattern="[0-9+() -]{7,}" placeholder="300 000 0000"></label><label>Correo electrónico<input v-model="form.email" required type="email" autocomplete="email" placeholder="correo@ejemplo.com"></label></div></div>
        <div class="form-block"><h2>Datos de entrega</h2><div class="form-row"><label>País<select v-model="form.country" required><option>Colombia</option><option>Venezuela</option><option>Ecuador</option><option>Panamá</option></select></label><label>Departamento<input v-model="form.department" required placeholder="Ej. Córdoba"></label></div><label>Ciudad<input v-model="form.city" required placeholder="Ej. Montería"></label><label>Dirección y complementos<input v-model="form.address" required autocomplete="street-address" placeholder="Calle, carrera, número"></label><label>Información adicional <span>(opcional)</span><textarea v-model="form.additional" rows="3" placeholder="Referencias para encontrar tu dirección"></textarea></label></div>
        <p class="checkout-notice">Enviar esta solicitud no significa que el pedido esté confirmado. Un asesor se comunicará contigo.</p><p v-if="errorMessage" class="form-error">{{ errorMessage }}</p><button class="button is-dark submit-order" :disabled="submitting">{{ submitting ? 'Enviando solicitud...' : 'Enviar solicitud' }} <span>↗</span></button>
      </div>
      <aside class="order-summary"><h2>Resumen</h2><div v-for="item in cartProducts" :key="`${item.slug}-${item.size || ''}-${item.color || ''}`" class="summary-item"><div><strong>{{ item.product!.name }}</strong><small>{{ item.size ? `Talla: ${item.size} · ` : '' }}{{ item.color ? `Color: ${item.color} · ` : '' }}{{ item.quantity }} × {{ money(item.product!.price) }}</small></div><strong>{{ money(item.product!.price * item.quantity) }}</strong></div><div class="summary-total"><span>Total solicitado</span><strong>{{ money(subtotal) }}</strong></div><p class="summary-note">Pago contra entrega · Un asesor confirmará tu solicitud.</p></aside>
    </form>
  </section>
</template>
