
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少项目ID' })

  const body = await readBody(event)
  const { name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId } = body

  const data: any = {}
  if (name) data.name = name
  if (hospitalName) data.hospitalName = hospitalName
  if (description !== undefined) data.description = description || null
  if (status) data.status = status
  if (warrantyStartDate) data.warrantyStartDate = new Date(warrantyStartDate)
  if (warrantyEndDate) data.warrantyEndDate = new Date(warrantyEndDate)
  if (managerId) data.managerId = Number(managerId)

  const project = await prisma.project.update({
    where: { id: Number(id) },
    data,
    include: {
      manager: { select: { id: true, name: true, email: true } },
    },
  })

  // 维保截止日期变更时，检查是否需要生成提醒
  if (warrantyEndDate) {
    const alertType = getAlertType(project.warrantyEndDate)
    if (alertType) {
      // 避免重复提醒：先检查是否已有相同类型的未读提醒
      const existing = await prisma.warrantyAlert.findFirst({
        where: { projectId: project.id, alertType, isRead: false },
      })
      if (!existing) {
        await prisma.warrantyAlert.create({
          data: {
            projectId: project.id,
            alertDate: new Date(),
            alertType,
          },
        })
      }
    }
  }

  return project
})
