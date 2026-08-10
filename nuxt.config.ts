// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/invitation/',
    head: {
      title: 'Invitation',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true
    }
  }
})
