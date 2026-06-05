
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少合同ID' })

  await prisma.maintenanceContract.delete({ where: { id: Number(id) } })
  return { message: '删除成功' }
})
