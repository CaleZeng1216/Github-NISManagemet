
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const query = getQuery(event)
  const status = query.status as string | undefined
  const search = query.search as string | undefined
  const managerId = query.managerId as string | undefined

  const where: any = {}

  // 非管理员只能看自己的项目
  if (session.role !== 'ADMIN' && !managerId) {
    where.managerId = session.userId
  } else if (managerId) {
    where.managerId = Number(managerId)
  }

  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { hospitalName: { contains: search } },
    ]
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { contracts: true, alerts: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // 附加维保状态
  return projects.map(p => ({
    ...p,
    warrantyStatus: getWarrantyStatus(p.warrantyEndDate),
  }))
})
