
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少提醒ID' })

  const alert = await prisma.warrantyAlert.update({
    where: { id: Number(id) },
    data: { isRead: true },
  })

  return alert
})
