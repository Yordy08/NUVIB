<script setup lang="ts">
const route = useRoute()
const orderNumber = computed(() => String(route.query.orden || ''))
</script>

<template>
  <section class="confirmation container"><div class="confirmation-mark">✓</div><p class="eyebrow">SOLICITUD RECIBIDA</p><h1>Gracias por confiar en NUVIB.</h1><p class="confirmation-lead">Recibimos tu solicitud correctamente. Uno de nuestros asesores se comunicará contigo para confirmar los datos y brindarte la información de tu pedido.</p><div class="confirmation-number"><span>Número de solicitud</span><strong>{{ orderNumber }}</strong></div><div class="confirmation-flow"><span><b>1</b> Solicitud recibida</span><span><b>2</b> Asesor te contacta</span><span><b>3</b> Confirmamos y despachamos</span></div><NuxtLink to="/productos" class="button is-dark">Seguir explorando</NuxtLink></section>
</template>
