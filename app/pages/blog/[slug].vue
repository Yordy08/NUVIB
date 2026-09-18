<script setup lang="ts">
const route = useRoute(); const { data: publication, error } = await useFetch<any>(`/api/publications/${route.params.slug}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Publicación no encontrada' })
useSeoMeta({ title: () => publication.value?.title || 'NUVIB', description: () => publication.value?.content?.slice(0, 150) || '' })
</script>

<template><article v-if="publication" class="container publication-detail"><NuxtLink to="/blog" class="back-link">← Volver a publicaciones</NuxtLink><p class="eyebrow">{{ new Date(publication.publishedAt).toLocaleDateString('es-CO') }}</p><h1>{{ publication.title }}</h1><img v-if="publication.image" :src="publication.image" :alt="publication.title"><div class="publication-content">{{ publication.content }}</div></article></template>
