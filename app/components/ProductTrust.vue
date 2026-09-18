<script setup lang="ts">
const route = useRoute()
const isProduct = computed(() => route.path.startsWith('/producto/'))
const { data: product } = await useFetch<any>(() => isProduct.value ? `/api/products/${route.params.slug}` : '', { immediate: isProduct.value })
</script>

<template>
  <section v-if="isProduct && product" class="product-trust container" aria-label="Información de compra">
    <div class="product-trust-stock"><span></span><strong>{{ product.stock > 0 ? 'Disponible para envío' : 'Agotado' }}</strong></div>
    <div class="product-trust-items"><span>Pago contra entrega</span><span>Sin crear cuenta</span><span>Un asesor confirma tu pedido</span></div>
  </section>
</template>
