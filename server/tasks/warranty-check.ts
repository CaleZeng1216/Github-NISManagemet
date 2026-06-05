import cron from 'node-cron'

/**
 * 维保到期检查定时任务
 * 每天凌晨1点执行，扫描所有项目，生成/更新提醒
 * 注：prisma, getAlertType 由 server/utils 自动导入
 */
export function startWarrantyCheckTask() {
  // 每天1:00执行
  cron.schedule('0 1 * * *', async () => {
    console.log('[定时任务] 开始检查维保到期情况...')
    await checkWarrantyExpiry()
    console.log('[定时任务] 维保到期检查完成')
  })

  // 启动时也执行一次
  console.log('[定时任务] 启动时执行一次维保检查...')
  checkWarrantyExpiry().catch(console.error)
}

async function checkWarrantyExpiry() {
  const projects = await prisma.project.findMany({
    where: { status: { in: ['IMPLEMENTING', 'ACTIVE'] } },
    select: { id: true, warrantyEndDate: true },
  })

  for (const project of projects) {
    const alertType = getAlertType(project.warrantyEndDate)

    if (alertType) {
      // 检查是否已有相同类型的未读提醒
      const existing = await prisma.warrantyAlert.findFirst({
        where: {
          projectId: project.id,
          alertType,
          isRead: false,
        },
      })

      if (!existing) {
        await prisma.warrantyAlert.create({
          data: {
            projectId: project.id,
            alertDate: new Date(),
            alertType,
          },
        })
        console.log(`[提醒] 项目 ${project.id} 维保${alertType === 'EXPIRED' ? '已过期' : alertType === 'ONE_MONTH' ? '1个月内到期' : '3个月内到期'}`)
      }
    }

    // 自动将已过期的合同状态更新
    await prisma.maintenanceContract.updateMany({
      where: {
        projectId: project.id,
        status: 'ACTIVE',
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })
  }
}
