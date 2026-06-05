<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const auth = useAuth()

const users = ref<User[]>([])
const loading = ref(false)
const showAddForm = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'PM',
  password: '',
})

const roleOptions = [
  { label: '项目经理', value: 'PM' },
  { label: '管理员', value: 'ADMIN' },
]

async function loadUsers() {
  loading.value = true
  try {
    users.value = await $fetch<User[]>('/api/users')
  } catch {
    toast.add({ title: '加载用户列表失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  if (!form.name || !form.email || !form.password) {
    toast.add({ title: '请填写必填项', color: 'error' })
    return
  }

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: form,
    })
    toast.add({ title: '添加成功', color: 'success' })
    showAddForm.value = false
    form.name = ''
    form.email = ''
    form.phone = ''
    form.role = 'PM'
    form.password = ''
    await loadUsers()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '添加失败', color: 'error' })
  }
}

async function deleteUser(id: number) {
  if (!confirm('确定删除该用户？')) return
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    toast.add({ title: '删除成功', color: 'success' })
    await loadUsers()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '删除失败', color: 'error' })
  }
}

onMounted(loadUsers)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">项目经理管理</h2>
      <UButton icon="i-lucide-plus" @click="showAddForm = !showAddForm">添加人员</UButton>
    </div>

    <!-- 添加表单 -->
    <div v-if="showAddForm" class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
      <h3 class="font-semibold text-gray-900 mb-4">添加项目经理</h3>
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="姓名" required>
          <UInput v-model="form.name" placeholder="请输入姓名" />
        </UFormField>
        <UFormField label="邮箱" required>
          <UInput v-model="form.email" type="email" placeholder="请输入邮箱" />
        </UFormField>
        <UFormField label="手机号">
          <UInput v-model="form.phone" placeholder="选填" />
        </UFormField>
        <UFormField label="角色">
          <USelect v-model="form.role" :items="roleOptions" />
        </UFormField>
        <UFormField label="初始密码" required>
          <UInput v-model="form.password" type="password" placeholder="请输入密码" />
        </UFormField>
      </div>
      <div class="flex gap-2 mt-4">
        <UButton @click="handleAdd">确认添加</UButton>
        <UButton variant="outline" @click="showAddForm = false">取消</UButton>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">姓名</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">邮箱</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">手机号</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">角色</th>
              <th class="text-left px-5 py-3 text-sm font-medium text-gray-500">负责项目数</th>
              <th class="text-right px-5 py-3 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-12 text-gray-400">加载中...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="text-center py-12 text-gray-400">暂无人员</td>
            </tr>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-5 py-3 text-sm font-medium text-gray-900">{{ user.name }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ user.phone || '-' }}</td>
              <td class="px-5 py-3">
                <UBadge :color="user.role === 'ADMIN' ? 'primary' : 'neutral'" variant="subtle">
                  {{ user.role === 'ADMIN' ? '管理员' : '项目经理' }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ user._count?.projects || 0 }}</td>
              <td class="px-5 py-3 text-right">
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  size="xs"
                  color="error"
                  :disabled="user.id === auth?.id"
                  @click="deleteUser(user.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
