
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
  }
})
