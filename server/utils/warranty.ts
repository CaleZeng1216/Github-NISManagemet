/**
 * 计算维保状态
 * @param warrantyEndDate 维保截止日期
 * @returns 状态：normal / warning / danger / expired
 */
export function getWarrantyStatus(warrantyEndDate: Date): 'normal' | 'warning' | 'danger' | 'expired' {
  const now = new Date()
  const end = new Date(warrantyEndDate)
  const diffMs = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'danger'
  if (diffDays <= 90) return 'warning'
  return 'normal'
}

/**
 * 计算距离维保到期的天数
 */
export function getDaysUntilExpiry(warrantyEndDate: Date): number {
  const now = new Date()
  const end = new Date(warrantyEndDate)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * 根据维保截止日期判断应触发的提醒类型
 */
export function getAlertType(warrantyEndDate: Date): 'THREE_MONTH' | 'ONE_MONTH' | 'EXPIRED' | null {
  const days = getDaysUntilExpiry(warrantyEndDate)
  if (days < 0) return 'EXPIRED'
  if (days <= 30) return 'ONE_MONTH'
  if (days <= 90) return 'THREE_MONTH'
  return null
}

/**
 * 维保状态对应的颜色和标签
 */
export function getWarrantyStatusDisplay(status: 'normal' | 'warning' | 'danger' | 'expired') {
  const map = {
    normal: { label: '正常', color: 'green' as const },
    warning: { label: '即将到期', color: 'yellow' as const },
    danger: { label: '即将到期', color: 'orange' as const },
    expired: { label: '已过期', color: 'red' as const },
  }
  return map[status]
}
