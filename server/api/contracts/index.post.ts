
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const { projectId, contractNo, startDate, endDate, amount, description } = body

  if (!projectId || !contractNo || !startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: '项目ID、合同编号、起止日期为必填项' })
  }

  // 创建合同
  const contract = await prisma.maintenanceContract.create({
    data: {
      projectId: Number(projectId),
      contractNo,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount: amount ? Number(amount) : null,
      description: description || null,
    },
  })

  // 关键逻辑：如果合同截止日期晚于项目维保截止日期，自动延长维保期
  const project = await prisma.project.findUnique({ where: { id: Number(projectId) } })
  if (project && new Date(endDate) > new Date(project.warrantyEndDate)) {
    await prisma.project.update({
      where: { id: Number(projectId) },
      data: { warrantyEndDate: new Date(endDate) },
    })

    // 更新后检查是否需要生成新的提醒
    const alertType = getAlertType(new Date(endDate))
    if (alertType) {
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

  return contract
})
