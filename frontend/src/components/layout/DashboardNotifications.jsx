import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications'
import { useToast } from '../../utils/useToast'
import { DashboardNotificationsContext } from './DashboardNotificationsContext'
const REFRESH_INTERVAL_MS = 10000

export default function DashboardNotificationsProvider({ children }) {
  const toast = useToast()
  const [feed, setFeed] = useState({ items: [], unreadCount: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)
  const seenIds = useRef(new Set())

  const applyFeed = useCallback((nextFeed) => {
    const items = nextFeed?.items ?? []
    if (initialized.current) {
      const fresh = items.filter((item) => !seenIds.current.has(item.id))
      for (const item of fresh.slice(0, 3)) {
        toast(`${item.title} — ${item.message}`, { variant: 'info', duration: 2000 })
      }
      if (fresh.length > 3) {
        toast(`${fresh.length - 3} autres nouvelles notifications`, { variant: 'info', duration: 2000 })
      }
    }
    for (const item of items) seenIds.current.add(item.id)
    initialized.current = true
    setFeed({ items, unreadCount: nextFeed?.unreadCount ?? 0 })
    setError('')
    setLoading(false)
  }, [toast])

  const refresh = useCallback(async () => {
    const nextFeed = await getNotifications()
    applyFeed(nextFeed)
    return nextFeed
  }, [applyFeed])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const nextFeed = await getNotifications()
        if (!active) return
        applyFeed(nextFeed)
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Impossible de charger les notifications.')
          setLoading(false)
          console.warn('Impossible de charger les notifications.', loadError)
        }
      }
    }

    load()
    const timer = window.setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [applyFeed, toast])

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id)
    const readAt = new Date().toISOString()
    setFeed((current) => {
      const notification = current.items.find((item) => item.id === id)
      return {
        items: current.items.map((item) => item.id === id ? { ...item, readAt } : item),
        unreadCount: Math.max(0, current.unreadCount - (notification && !notification.readAt ? 1 : 0)),
      }
    })
  }, [])

  const removeNotification = useCallback(async (id) => {
    await deleteNotification(id)
    setFeed((current) => {
      const notification = current.items.find((item) => item.id === id)
      return {
        items: current.items.filter((item) => item.id !== id),
        unreadCount: Math.max(0, current.unreadCount - (notification && !notification.readAt ? 1 : 0)),
      }
    })
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead()
    const readAt = new Date().toISOString()
    setFeed((current) => ({
      items: current.items.map((item) => item.readAt ? item : { ...item, readAt }),
      unreadCount: 0,
    }))
  }, [])

  return (
    <DashboardNotificationsContext.Provider value={{
      ...feed, error, loading, refresh, markRead, markAllRead, removeNotification,
    }}>
      {children}
    </DashboardNotificationsContext.Provider>
  )
}
