import { createContext, useContext, useState, ReactNode } from 'react'

interface AdminHeaderActions {
  onCreate?: () => void
  onExport?: () => void
  onRefresh?: () => void
}

interface AdminHeaderContextType {
  actions: AdminHeaderActions
  setActions: (actions: AdminHeaderActions) => void
}

const AdminHeaderContext = createContext<AdminHeaderContextType | undefined>(undefined)

interface AdminHeaderProviderProps {
  children: ReactNode
}

export function AdminHeaderProvider({ children }: AdminHeaderProviderProps) {
  const [actions, setActions] = useState<AdminHeaderActions>({})

  return (
    <AdminHeaderContext.Provider value={{ actions, setActions }}>
      {children}
    </AdminHeaderContext.Provider>
  )
}

export function useAdminHeader(): AdminHeaderContextType {
  const context = useContext(AdminHeaderContext)
  if (context === undefined) {
    throw new Error('useAdminHeader must be used within an AdminHeaderProvider')
  }
  return context
}

