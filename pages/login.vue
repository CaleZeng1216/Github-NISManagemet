<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const auth = useAuth()
const { login } = useAuthFetch()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await login(form.email, form.password)
    toast.add({ title: '登录成功', color: 'success' })
    navigateTo('/')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || '登录失败', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <!-- 标题 -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">护理维保管理系统</h1>
          <p class="text-gray-500 mt-2">请登录以继续</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <UFormField label="邮箱" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              icon="i-lucide-mail"
              size="lg"
            />
          </UFormField>

          <UFormField label="密码" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              icon="i-lucide-lock"
              size="lg"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            登录
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
