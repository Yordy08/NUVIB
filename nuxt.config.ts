// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'NUVIB | Compra mejor, vive mejor',
      meta: [
        { name: 'description', content: 'Productos seleccionados para hacer tu día más simple.' },
        { name: 'theme-color', content: '#102a43' }
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/Logo/logotip.jpg' }
      ]
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    mongodbDb: process.env.MONGODB_DB || 'nuvib',
    cloudinaryUrl: process.env.CLOUDINARY_URL,
    reviewsApiUrl: process.env.REVIEWS_API_URL || '',
    reviewsApiKey: process.env.REVIEWS_API_KEY || '',
    aliexpressReviewsApiKey: process.env.ALIEXPRESS_REVIEWS_API_KEY || '',
    public: { whatsappNumber: process.env.NUVIB_WHATSAPP_NUMBER || '' }
  }
})
