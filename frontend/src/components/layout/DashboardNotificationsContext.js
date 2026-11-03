import { createContext, useContext } from 'react'

export const DashboardNotificationsContext = createContext(null)

export function useDashboardNotifications() {
  const context = useContext(DashboardNotificationsContext)
  if (!context) {
    throw new Error('useDashboardNotifications doit être utilisé dans DashboardNotificationsProvider')
  }
  return context
}
