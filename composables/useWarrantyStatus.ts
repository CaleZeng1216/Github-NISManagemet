export function useWarrantyStatus() {
  const getStatusColor = (status: 'normal' | 'warning' | 'danger' | 'expired') => {
    const map = {
      normal: 'success' as const,
      warning: 'warning' as const,
      danger: 'orange' as const,
      expired: 'error' as const,
    }
    return map[status]
  }

  const getStatusLabel = (status: 'normal' | 'warning' | 'danger' | 'expired') => {
    const map = {
      normal: '正常',
      warning: '即将到期',
      danger: '即将到期',
      expired: '已过期',
    }
    return map[status]
  }

  const getAlertTypeLabel = (type: 'THREE_MONTH' | 'ONE_MONTH' | 'EXPIRED') => {
    const map = {
      THREE_MONTH: '3个月内到期',
      ONE_MONTH: '1个月内到期',
      EXPIRED: '已过期',
    }
    return map[type]
  }

  const getAlertTypeColor = (type: 'THREE_MONTH' | 'ONE_MONTH' | 'EXPIRED') => {
    const map = {
      THREE_MONTH: 'warning' as const,
      ONE_MONTH: 'orange' as const,
      EXPIRED: 'error' as const,
    }
    return map[type]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return {
    getStatusColor,
    getStatusLabel,
    getAlertTypeLabel,
    getAlertTypeColor,
    formatDate,
    getDaysRemaining,
  }
}
