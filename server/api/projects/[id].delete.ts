
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少项目ID' })

  // 删除关联的提醒和合同
  await prisma.warrantyAlert.deleteMany({ where: { projectId: Number(id) } })
  await prisma.maintenanceContract.deleteMany({ where: { projectId: Number(id) } })
  await prisma.project.delete({ where: { id: Number(id) } })

  return { message: '删除成功' }
})
