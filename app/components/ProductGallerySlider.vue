<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { data: product } = await useFetch<any>(() => slug.value ? `/api/products/${encodeURIComponent(slug.value)}` : null)
const selectedImage = ref(0)
const lightbox = ref(false)
const touchStart = ref(0)
const canTeleport = ref(false)
onMounted(() => nextTick(() => { canTeleport.value = true }))
const images = computed(() => product.value?.images?.length ? product.value.images : [product.value?.image || '/Logo/logotip.jpg'])
const currentImage = computed(() => images.value[selectedImage.value] || images.value[0])
const selectImage = (index: number) => { selectedImage.value = index }
const nextImage = () => { selectedImage.value = (selectedImage.value + 1) % images.value.length }
const previousImage = () => { selectedImage.value = (selectedImage.value - 1 + images.value.length) % images.value.length }
const onTouchStart = (event: TouchEvent) => { touchStart.value = event.changedTouches[0]?.clientX || 0 }
const onTouchEnd = (event: TouchEvent) => { const end = event.changedTouches[0]?.clientX || 0; if (Math.abs(end - touchStart.value) > 40) end < touchStart.value ? nextImage() : previousImage() }
</script>

<template>
  <Teleport v-if="product && canTeleport" defer to=".detail-gallery">
    <div class="pdp-gallery-slider">
      <div class="pdp-gallery-main" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <span class="pdp-gallery-badge">Más imágenes</span>
        <button v-if="images.length > 1" type="button" class="pdp-gallery-arrow is-prev" aria-label="Imagen anterior" @click="previousImage">‹</button>
        <img :src="currentImage" :alt="`${product.name} - imagen ${selectedImage + 1}`" fetchpriority="high" @click="lightbox = true">
        <button v-if="images.length > 1" type="button" class="pdp-gallery-arrow is-next" aria-label="Siguiente imagen" @click="nextImage">›</button>
        <span class="pdp-gallery-counter">{{ selectedImage + 1 }} / {{ images.length }}</span>
      </div>
      <div v-if="images.length > 1" class="pdp-gallery-thumbnails" aria-label="Galería de imágenes">
        <button v-for="(image, index) in images" :key="`${image}-${index}`" type="button" :class="{ 'is-selected': selectedImage === index }" :aria-label="`Ver imagen ${index + 1}`" @click="selectImage(index)"><img :src="image" :alt="`${product.name}, miniatura ${index + 1}`" loading="lazy"></button>
      </div>
    </div>
    <div v-if="lightbox" class="image-lightbox" role="dialog" aria-modal="true" @click.self="lightbox = false"><button type="button" aria-label="Cerrar imagen" @click="lightbox = false">×</button><img :src="currentImage" :alt="product.name"></div>
    <div class="pdp-gallery-description"><p v-if="product.description" class="eyebrow">Descripción del producto</p><p v-if="product.description">{{ product.description }}</p><div class="nuvib-trust-badge"><span class="icon">🛡️</span><span><strong>Compra segura con NUVIB:</strong> Pagas el valor del producto + envío únicamente cuando lo recibas.</span></div></div>
  </Teleport>
</template>
