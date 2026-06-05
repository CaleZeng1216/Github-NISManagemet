<script setup lang="ts">
import type { DashboardStats, WarrantyAlert, Project } from '~/types'

definePageMeta({ middleware: 'auth' })

const { getStatusColor, getStatusLabel, formatDate, getDaysRemaining, getAlertTypeLabel, getAlertTypeColor } = useWarrantyStatus()

const stats = ref<DashboardStats>({
  totalProjects: 0,
  expiringSoon: 0,
  expired: 0,
  activeContracts: 0,
  unreadAlerts: 0,
})

const alerts = ref<WarrantyAlert[]>([])
const expiringProjects = ref<Project[]>([])

async function loadData() {
  const [statsData, alertsData, projectsData] = await Promise.all([
    $fetch<DashboardStats>('/api/dashboard/stats'),
    $fetch<WarrantyAlert[]>('/api/alerts?isRead=false'),
    $fetch<Project[]>('/api/projects'),
  ])
  stats.value = statsData
  alerts.value = alertsData

  // 筛选出即将到期和已过期的项目
  expiringProjects.value = projectsData.filter(
    p => p.warrantyStatus === 'warning' || p.warrantyStatus === 'danger' || p.warrantyStatus === 'expired'
  )
}

async function markAsRead(alertId: number) {
  await $fetch(`/api/alerts/${alertId}/read`, { method: 'PUT' })
  await loadData()
}

onMounted(loadData)

const statCards = computed(() => [
  { label: '项目总数', value: stats.value.totalProjects, icon: 'i-lucide-folder-kanban', color: 'primary' },
  { label: '即将到期', value: stats.value.expiringSoon, icon: 'i-lucide-clock', color: 'warning' },
  { label: '已过期', value: stats.value.expired, icon: 'i-lucide-alert-circle', color: 'error' },
  { label: '活跃合同', value: stats.value.activeContracts, icon: 'i-lucide-file-check', color: 'success' },
])
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">仪表盘</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ card.label }}</p>
            <p class="text-3xl font-bold mt-1" :class="`text-${card.color}-600`">{{ card.value }}</p>
          </div>
          <div :class="`bg-${card.color}-100`" class="w-12 h-12 rounded-lg flex items-center justify-center">
            <UIcon :name="card.icon" :class="`text-${card.color}-600`" class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 待处理提醒 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">待处理提醒</h3>
          <UBadge v-if="alerts.length" color="error" variant="subtle">{{ alerts.length }}</UBadge>
        </div>
        <div class="p-5">
          <div v-if="alerts.length === 0" class="text-center text-gray-400 py-8">
            <UIcon name="i-lucide-check-circle" class="w-12 h-12 mx-auto mb-2 text-green-300" />
            <p>暂无待处理提醒</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="alert in alerts.slice(0, 10)"
              :key="alert.id"
              class="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              <UBadge :color="getAlertTypeColor(alert.alertType)" variant="subtle" size="sm">
                {{ getAlertTypeLabel(alert.alertType) }}
              </UBadge>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ alert.project?.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ alert.project?.hospitalName }} · 维保截止 {{ formatDate(alert.project?.warrantyEndDate || '') }}
                </p>
              </div>
              <UButton size="xs" variant="ghost" @click="markAsRead(alert.id)">
                已读
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 即将到期项目 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">维保到期预警</h3>
        </div>
        <div class="p-5">
          <div v-if="expiringProjects.length === 0" class="text-center text-gray-400 py-8">
            <UIcon name="i-lucide-shield-check" class="w-12 h-12 mx-auto mb-2 text-green-300" />
            <p>所有项目维保状态正常</p>
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="project in expiringProjects.slice(0, 10)"
              :key="project.id"
              :to="`/projects/${project.id}`"
              class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <UBadge :color="getStatusColor(project.warrantyStatus!)" variant="subtle">
                {{ getStatusLabel(project.warrantyStatus!) }}
              </UBadge>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ project.name }}</p>
                <p class="text-xs text-gray-500">{{ project.hospitalName }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium" :class="project.warrantyStatus === 'expired' ? 'text-red-600' : 'text-orange-600'">
                  {{ getDaysRemaining(project.warrantyEndDate) < 0 ? '已过期' : `剩余${getDaysRemaining(project.warrantyEndDate)}天` }}
                </p>
                <p class="text-xs text-gray-400">{{ formatDate(project.warrantyEndDate) }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
