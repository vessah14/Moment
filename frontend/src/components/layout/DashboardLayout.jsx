import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'
import { useSeo } from '../../utils/seo'

export default function DashboardLayout({ children }) {
  useSeo({ title: 'Tableau de bord', noindex: true })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-svh min-w-0 flex-1">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  )
}
