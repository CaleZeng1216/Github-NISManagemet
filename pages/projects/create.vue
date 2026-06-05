<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const router = useRouter()

const managers = ref<User[]>([])
const loading = ref(false)

const form = reactive({
  name: '',
  hospitalName: '',
  description: '',
  status: 'ACTIVE',
  warrantyStartDate: '',
  warrantyEndDate: '',
  managerId: '',
})

const statusOptions = [
  { label: '实施中', value: 'IMPLEMENTING' },
  { label: '运营中', value: 'ACTIVE' },
  { label: '已终止', value: 'TERMINATED' },
]

async function loadManagers() {
  try {
    managers.value = await $fetch<User[]>('/api/users')
  } catch {
    // 可能非管理员
  }
}

async function handleSubmit() {
  if (!form.name || !form.hospitalName || !form.warrantyStartDate || !form.warrantyEndDate || !form.managerId) {
    toast.add({ title: '请填写必填项', color: 'error' })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/projects', {
      method: 'POST',
      body: form,
    })
    toast.add({ title: '项目创建成功', color: 'success' })
    router.push('/projects')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '创建失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(loadManagers)
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton icon="i-lucide-arrow-left" variant="ghost" @click="router.push('/projects')" />
      <h2 class="text-2xl font-bold text-gray-900">新建项目</h2>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormField label="项目名称" required>
          <UInput v-model="form.name" placeholder="如：XX医院NIS系统" />
        </UFormField>

        <UFormField label="医院名称" required>
          <UInput v-model="form.hospitalName" placeholder="请输入医院名称" />
        </UFormField>

        <UFormField label="项目描述">
          <UTextarea v-model="form.description" placeholder="项目描述（选填）" :rows="3" />
        </UFormField>

        <UFormField label="项目状态">
          <USelect v-model="form.status" :items="statusOptions" />
        </UFormField>

        <UFormField label="项目经理" required>
          <USelect
            v-model="form.managerId"
            :items="managers.map(m => ({ label: `${m.name} (${m.email})`, value: String(m.id) }))"
            placeholder="请选择项目经理"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="免费维保起始日期" required>
            <UInput v-model="form.warrantyStartDate" type="date" />
          </UFormField>
          <UFormField label="免费维保截止日期" required>
            <UInput v-model="form.warrantyEndDate" type="date" />
          </UFormField>
        </div>

        <div class="flex gap-3 pt-4">
          <UButton type="submit" :loading="loading">创建项目</UButton>
          <UButton variant="outline" @click="router.push('/projects')">取消</UButton>
        </div>
      </form>
    </div>
  </div>
</template>
