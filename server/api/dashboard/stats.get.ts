
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const managerFilter = session.role !== 'ADMIN' ? { managerId: session.userId } : {}

  const [
    totalProjects,
    allProjects,
    activeContracts,
    unreadAlerts,
  ] = await Promise.all([
    prisma.project.count({ where: managerFilter }),
    prisma.project.findMany({
      where: managerFilter,
      select: { warrantyEndDate: true },
    }),
    prisma.maintenanceContract.count({
      where: { status: 'ACTIVE', project: managerFilter },
    }),
    prisma.warrantyAlert.count({
      where: {
        isRead: false,
        project: managerFilter,
      },
    }),
  ])

  // 统计维保状态
  let expiringSoon = 0
  let expired = 0
  for (const p of allProjects) {
    const status = getWarrantyStatus(p.warrantyEndDate)
    if (status === 'expired') expired++
    else if (status === 'warning' || status === 'danger') expiringSoon++
  }

  return {
    totalProjects,
    expiringSoon,
    expired,
    activeContracts,
    unreadAlerts,
  }
})
