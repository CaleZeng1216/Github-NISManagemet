<script setup lang="ts">
import type { SessionData } from '~/types'

const sidebarLinks = [
  { label: '仪表盘', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: '项目管理', icon: 'i-lucide-folder-kanban', to: '/projects' },
  { label: '运维合同', icon: 'i-lucide-file-text', to: '/contracts' },
  { label: '项目经理', icon: 'i-lucide-users', to: '/users' },
]

const auth = useAuth()
const toast = useToast()

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    auth.value = null
    navigateTo('/login')
  } catch {
    toast.add({ title: '退出失败', color: 'error' })
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 class="text-lg font-bold text-primary">护理维保管理</h1>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 py-4 px-3 space-y-1">
        <NuxtLink
          v-for="link in sidebarLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          active-class="bg-primary-50 text-primary-700 font-medium"
          inactive-class="text-gray-600 hover:bg-gray-100"
        >
          <UIcon :name="link.icon" class="w-5 h-5" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- 用户信息 -->
      <div v-if="auth" class="border-t border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <UAvatar :text="auth.name" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ auth.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.role === 'ADMIN' ? '管理员' : '项目经理' }}</p>
          </div>
          <UButton icon="i-lucide-log-out" variant="ghost" color="neutral" size="sm" @click="handleLogout" />
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1 overflow-auto">
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
