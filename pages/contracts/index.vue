<script setup lang="ts">
import type { MaintenanceContract } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const { formatDate } = useWarrantyStatus()

const contracts = ref<MaintenanceContract[]>([])
const loading = ref(false)

async function loadContracts() {
  loading.value = true
  try {
    contracts.value = await $fetch<MaintenanceContract[]>('/api/contracts')
  } catch {
    toast.add({ title: '加载合同失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function deleteContract(id: number) {
  if (!confirm('确定删除该合同？')) return
  try {
    await $fetch(`/api/contracts/${id}`, { method: 'DELETE' })
    toast.add({ title: '删除成功', color: 'success' })
    await loadContracts()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '删除失败', color: 'error' })
  }
}

onMounted(loadContracts)
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">运维合同</h2>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">合同编号</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">所属项目</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">医院</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">合同期限</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">金额</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">状态</th>
              <th class="text-right px-5 py-3 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-12 text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="contracts.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-400">暂无合同</td>
            </tr>
            <tr
              v-for="contract in contracts"
              :key="contract.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-5 py-3 text-sm font-medium text-gray-900">{{ contract.contractNo }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ contract.project?.name }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ contract.project?.hospitalName }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">
                {{ formatDate(contract.startDate) }} ~ {{ formatDate(contract.endDate) }}
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">
                {{ contract.amount ? `¥${Number(contract.amount).toLocaleString()}` : '-' }}
              </td>
              <td class="px-5 py-3">
                <UBadge :color="contract.status === 'ACTIVE' ? 'success' : 'neutral'" variant="subtle">
                  {{ contract.status === 'ACTIVE' ? '生效中' : contract.status === 'EXPIRED' ? '已过期' : '已终止' }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right">
                <UButton icon="i-lucide-trash-2" variant="ghost" size="xs" color="error" @click="deleteContract(contract.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
