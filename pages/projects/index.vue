<script setup lang="ts">
import type { Project, User } from '~/types'

definePageMeta({ middleware: 'auth' })

const { getStatusColor, getStatusLabel, formatDate, getDaysRemaining } = useWarrantyStatus()
const toast = useToast()

const projects = ref<Project[]>([])
const managers = ref<User[]>([])
const loading = ref(false)

const search = ref('')
const statusFilter = ref('')
const managerFilter = ref('')

async function loadProjects() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (search.value) params.set('search', search.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (managerFilter.value) params.set('managerId', managerFilter.value)

    projects.value = await $fetch<Project[]>(`/api/projects?${params}`)
  } catch {
    toast.add({ title: '加载项目失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function loadManagers() {
  try {
    managers.value = await $fetch<User[]>('/api/users')
  } catch {
    // 非管理员可能无权限
  }
}

async function deleteProject(id: number) {
  if (!confirm('确定删除该项目？关联的合同和提醒也将被删除。')) return
  try {
    await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
    toast.add({ title: '删除成功', color: 'success' })
    await loadProjects()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '删除失败', color: 'error' })
  }
}

const statusOptions = [
  { label: '全部', value: '' },
  { label: '实施中', value: 'IMPLEMENTING' },
  { label: '运营中', value: 'ACTIVE' },
  { label: '已终止', value: 'TERMINATED' },
]

watch([search, statusFilter, managerFilter], () => {
  loadProjects()
})

onMounted(() => {
  loadProjects()
  loadManagers()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">项目管理</h2>
      <NuxtLink to="/projects/create">
        <UButton icon="i-lucide-plus">新建项目</UButton>
      </NuxtLink>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <UInput
        v-model="search"
        placeholder="搜索项目名称/医院..."
        icon="i-lucide-search"
        class="w-64"
      />
      <USelect
        v-model="statusFilter"
        :items="statusOptions"
        placeholder="项目状态"
        class="w-40"
      />
      <USelect
        v-model="managerFilter"
        :items="[{ label: '全部经理', value: '' }, ...managers.map(m => ({ label: m.name, value: String(m.id) }))]"
        placeholder="项目经理"
        class="w-40"
      />
    </div>

    <!-- 项目列表 -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">项目名称</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">医院</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">项目经理</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">状态</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">维保状态</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">维保截止</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">合同数</th>
              <th class="text-right px-5 py-3 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-12 text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="projects.length === 0">
              <td colspan="8" class="text-center py-12 text-gray-400">暂无项目</td>
            </tr>
            <tr
              v-for="project in projects"
              :key="project.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-5 py-3">
                <NuxtLink :to="`/projects/${project.id}`" class="text-sm font-medium text-primary-600 hover:underline">
                  {{ project.name }}
                </NuxtLink>
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ project.hospitalName }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ project.manager?.name }}</td>
              <td class="px-5 py-3">
                <UBadge variant="subtle" :color="project.status === 'ACTIVE' ? 'success' : project.status === 'IMPLEMENTING' ? 'primary' : 'neutral'">
                  {{ project.status === 'IMPLEMENTING' ? '实施中' : project.status === 'ACTIVE' ? '运营中' : '已终止' }}
                </UBadge>
              </td>
              <td class="px-5 py-3">
                <UBadge v-if="project.warrantyStatus" :color="getStatusColor(project.warrantyStatus)" variant="subtle">
                  {{ getStatusLabel(project.warrantyStatus) }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">
                {{ formatDate(project.warrantyEndDate) }}
                <span v-if="project.warrantyStatus !== 'normal'" class="ml-1 text-xs" :class="project.warrantyStatus === 'expired' ? 'text-red-500' : 'text-orange-500'">
                  ({{ getDaysRemaining(project.warrantyEndDate) < 0 ? '已过期' : `${getDaysRemaining(project.warrantyEndDate)}天` }})
                </span>
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ project._count?.contracts || 0 }}</td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/projects/${project.id}`">
                    <UButton icon="i-lucide-eye" variant="ghost" size="xs" />
                  </NuxtLink>
                  <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="deleteProject(project.id)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
