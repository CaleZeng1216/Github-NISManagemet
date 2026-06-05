export interface SessionData {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'PM'
}

export interface Project {
  id: number
  name: string
  hospitalName: string
  description: string | null
  status: 'IMPLEMENTING' | 'ACTIVE' | 'TERMINATED'
  warrantyStartDate: string
  warrantyEndDate: string
  managerId: number
  createdAt: string
  updatedAt: string
  manager?: { id: number; name: string; email: string; phone?: string }
  contracts?: MaintenanceContract[]
  alerts?: WarrantyAlert[]
  _count?: { contracts: number; alerts: number }
  warrantyStatus?: 'normal' | 'warning' | 'danger' | 'expired'
}

export interface MaintenanceContract {
  id: number
  projectId: number
  contractNo: string
  startDate: string
  endDate: string
  amount: number | null
  description: string | null
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  createdAt: string
  project?: { id: number; name: string; hospitalName: string }
}

export interface WarrantyAlert {
  id: number
  projectId: number
  alertDate: string
  alertType: 'THREE_MONTH' | 'ONE_MONTH' | 'EXPIRED'
  isRead: boolean
  createdAt: string
  project?: {
    id: number
    name: string
    hospitalName: string
    warrantyEndDate: string
    manager: { id: number; name: string }
  }
}

export interface DashboardStats {
  totalProjects: number
  expiringSoon: number
  expired: number
  activeContracts: number
  unreadAlerts: number
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'ADMIN' | 'PM'
  createdAt: string
  _count?: { projects: number }
}
