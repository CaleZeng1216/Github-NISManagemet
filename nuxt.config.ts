// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  modules: ['@nuxt/ui'],

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || 'dev-secret-key-change-in-production-min-32-chars',
    public: {
      appName: '护理维保管理系统',
    },
  },

  routeRules: {
    '/login': { ssr: false },
  },

  devtools: { enabled: true },
})
