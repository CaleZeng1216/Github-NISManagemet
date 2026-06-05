
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const body = await readBody(event)
  const { name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId } = body

  if (!name || !hospitalName || !warrantyStartDate || !warrantyEndDate || !managerId) {
    throw createError({ statusCode: 400, statusMessage: '项目名称、医院名称、维保起止日期和项目经理为必填项' })
  }

  const project = await prisma.project.create({
    data: {
      name,
      hospitalName,
      description: description || null,
      status: status || 'ACTIVE',
      warrantyStartDate: new Date(warrantyStartDate),
      warrantyEndDate: new Date(warrantyEndDate),
      managerId: Number(managerId),
    },
    include: {
      manager: { select: { id: true, name: true, email: true } },
    },
  })

  // 检查是否需要生成提醒
  const alertType = getAlertType(project.warrantyEndDate)
  if (alertType) {
    await prisma.warrantyAlert.create({
      data: {
        projectId: project.id,
        alertDate: new Date(),
        alertType,
      },
    })
  }

  return project
})
