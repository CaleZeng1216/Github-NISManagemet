<script setup lang="ts">
import type { Project } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const toast = useToast()
const router = useRouter()
const { getStatusColor, getStatusLabel, formatDate, getDaysRemaining, getAlertTypeLabel, getAlertTypeColor } = useWarrantyStatus()

const project = ref<Project | null>(null)
const loading = ref(true)

// 新建合同表单
const showContractForm = ref(false)
const contractForm = reactive({
  contractNo: '',
  startDate: '',
  endDate: '',
  amount: '',
  description: '',
})

async function loadProject() {
  loading.value = true
  try {
    project.value = await $fetch<Project>(`/api/projects/${route.params.id}`)
  } catch {
    toast.add({ title: '加载项目失败', color: 'error' })
    router.push('/projects')
  } finally {
    loading.value = false
  }
}

async function handleCreateContract() {
  if (!contractForm.contractNo || !contractForm.startDate || !contractForm.endDate) {
    toast.add({ title: '请填写合同编号和起止日期', color: 'error' })
    return
  }

  try {
    await $fetch('/api/contracts', {
      method: 'POST',
      body: {
        ...contractForm,
        projectId: project.value!.id,
      },
    })
    toast.add({ title: '合同创建成功，维保期已自动更新', color: 'success' })
    showContractForm.value = false
    contractForm.contractNo = ''
    contractForm.startDate = ''
    contractForm.endDate = ''
    contractForm.amount = ''
    contractForm.description = ''
    await loadProject()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '创建失败', color: 'error' })
  }
}

async function markAlertRead(alertId: number) {
  await $fetch(`/api/alerts/${alertId}/read`, { method: 'PUT' })
  await loadProject()
}

onMounted(loadProject)
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>

    <div v-else-if="project">
      <!-- 头部 -->
      <div class="flex items-center gap-3 mb-6">
        <UButton icon="i-lucide-arrow-left" variant="ghost" @click="router.push('/projects')" />
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900">{{ project.name }}</h2>
          <p class="text-gray-500">{{ project.hospitalName }}</p>
        </div>
        <UBadge :color="getStatusColor(project.warrantyStatus!)" variant="subtle" size="lg">
          {{ getStatusLabel(project.warrantyStatus!) }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：项目信息 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 基本信息 -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 class="font-semibold text-gray-900 mb-4">基本信息</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">项目状态</p>
                <UBadge variant="subtle" :color="project.status === 'ACTIVE' ? 'success' : project.status === 'IMPLEMENTING' ? 'primary' : 'neutral'" class="mt-1">
                  {{ project.status === 'IMPLEMENTING' ? '实施中' : project.status === 'ACTIVE' ? '运营中' : '已终止' }}
                </UBadge>
              </div>
              <div>
                <p class="text-sm text-gray-500">项目经理</p>
                <p class="text-sm font-medium text-gray-900 mt-1">{{ project.manager?.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">维保起始日期</p>
                <p class="text-sm font-medium text-gray-900 mt-1">{{ formatDate(project.warrantyStartDate) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">维保截止日期</p>
                <p class="text-sm font-medium mt-1" :class="project.warrantyStatus === 'expired' ? 'text-red-600' : project.warrantyStatus !== 'normal' ? 'text-orange-600' : 'text-gray-900'">
                  {{ formatDate(project.warrantyEndDate) }}
                  <span v-if="project.warrantyStatus !== 'normal'" class="ml-1">
                    ({{ getDaysRemaining(project.warrantyEndDate) < 0 ? '已过期' : `剩余${getDaysRemaining(project.warrantyEndDate)}天` }})
                  </span>
                </p>
              </div>
            </div>
            <div v-if="project.description" class="mt-4">
              <p class="text-sm text-gray-500">项目描述</p>
              <p class="text-sm text-gray-700 mt-1">{{ project.description }}</p>
            </div>
          </div>

          <!-- 运维合同 -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">运维合同</h3>
              <UButton size="sm" icon="i-lucide-plus" @click="showContractForm = !showContractForm">
                签署合同
              </UButton>
            </div>

            <!-- 新建合同表单 -->
            <div v-if="showContractForm" class="p-5 bg-gray-50 border-b border-gray-200">
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="合同编号" required>
                  <UInput v-model="contractForm.contractNo" placeholder="如：YW-2025-001" />
                </UFormField>
                <UFormField label="合同金额（元）">
                  <UInput v-model="contractForm.amount" type="number" placeholder="选填" />
                </UFormField>
                <UFormField label="合同起始日期" required>
                  <UInput v-model="contractForm.startDate" type="date" />
                </UFormField>
                <UFormField label="合同截止日期" required>
                  <UInput v-model="contractForm.endDate" type="date" />
                </UFormField>
              </div>
              <UFormField label="合同说明" class="mt-3">
                <UTextarea v-model="contractForm.description" placeholder="选填" :rows="2" />
              </UFormField>
              <div class="flex gap-2 mt-4">
                <UButton size="sm" @click="handleCreateContract">确认签署</UButton>
                <UButton size="sm" variant="outline" @click="showContractForm = false">取消</UButton>
              </div>
            </div>

            <div class="p-5">
              <div v-if="project.contracts?.length === 0" class="text-center text-gray-400 py-6">
                暂无运维合同
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="contract in project.contracts"
                  :key="contract.id"
                  class="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ contract.contractNo }}</p>
                    <p class="text-xs text-gray-500">
                      {{ formatDate(contract.startDate) }} ~ {{ formatDate(contract.endDate) }}
                      <span v-if="contract.amount" class="ml-2">金额：¥{{ Number(contract.amount).toLocaleString() }}</span>
                    </p>
                  </div>
                  <UBadge :color="contract.status === 'ACTIVE' ? 'success' : 'neutral'" variant="subtle" size="sm">
                    {{ contract.status === 'ACTIVE' ? '生效中' : contract.status === 'EXPIRED' ? '已过期' : '已终止' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：提醒记录 -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">提醒记录</h3>
          </div>
          <div class="p-5">
            <div v-if="project.alerts?.length === 0" class="text-center text-gray-400 py-6">
              暂无提醒
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="alert in project.alerts"
                :key="alert.id"
                class="p-3 rounded-lg"
                :class="alert.isRead ? 'bg-gray-50' : 'bg-yellow-50 border border-yellow-200'"
              >
                <div class="flex items-center gap-2 mb-1">
                  <UBadge :color="getAlertTypeColor(alert.alertType)" variant="subtle" size="xs">
                    {{ getAlertTypeLabel(alert.alertType) }}
                  </UBadge>
                  <span v-if="!alert.isRead" class="text-xs text-yellow-600 font-medium">未读</span>
                </div>
                <p class="text-xs text-gray-500">{{ formatDate(alert.alertDate) }}</p>
                <UButton v-if="!alert.isRead" size="xs" variant="ghost" class="mt-1" @click="markAlertRead(alert.id)">
                  标为已读
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
