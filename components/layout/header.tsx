'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, LogOut, User, Menu, Globe, ChevronDown, Bell, CheckCheck } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { apiPost, apiGet, apiPut, apiPatch, apiDelete } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUIStore } from '@/lib/store/ui-store'
import { NAV_ITEMS } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'
import { useI18nStore, useT } from '@/lib/i18n'
import { useLanguages } from '@/lib/query/use-languages'

const flagPngMap: Record<string, string> = {
  AZ: "https://flagcdn.com/w80/az.png",
  RU: "https://flagcdn.com/w80/ru.png",
  EN: "https://flagcdn.com/w80/gb.png",
};

export function Header() {
  const t = useT()
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar)

  const { languages } = useLanguages()
  const [currentLang, setCurrentLang] = useState<string>("AZ")
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const langRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = async () => {
    try {
      const count = await apiGet<number>('/notifications/unread-count')
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to fetch unread count:", err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await apiGet<any>('/notifications', { params: { page: 0, size: 20 } })
      setNotifications(res?.items || [])
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    }
  }

  const handleMarkAsRead = async (id: number, wasRead: boolean) => {
    if (wasRead) return;
    try {
      await apiPatch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiPatch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  useEffect(() => {
    // Fetch current selected language
    apiGet<any>('/me/language')
      .then(res => {
        const data = res?.data || res;
        if (data?.code) {
          const code = String(data.code).toUpperCase();
          setCurrentLang(code);
          localStorage.setItem('fitnest-language', code);
          useI18nStore.getState().setLocale(code as any);
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLangChange = async (code: string) => {
    try {
      await apiPut('/me/language', { language: code })
      setCurrentLang(code)
      localStorage.setItem('fitnest-language', code)
      useI18nStore.getState().setLocale(code as any)
      setDropdownOpen(false)
      await queryClient.invalidateQueries()
    } catch (err) {
      console.error("Failed to change language:", err)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') ?? 'AS'

  async function handleLogout() {
    await apiPost('/api/auth/logout', undefined, { auth: false }).catch(() => null)
    clearSession()
    router.push('/login')
  }

  return (
    <header className="relative mx-4 sm:mx-6 mt-4 sm:mt-6 mb-6 h-[60px] rounded-xl bg-[#00B4CC26] px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
      {/* Left: Profile Chip & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!(
          user?.role?.toUpperCase() === 'ROLE_GYM_SUPER_ADMIN' || 
          user?.role?.toUpperCase() === 'ROLE_GYM_ADMIN' ||
          user?.role?.toUpperCase() === 'GYM_SUPER_ADMIN' || 
          user?.role?.toUpperCase() === 'GYM_ADMIN'
        ) && (
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden mr-1 p-1.5 text-[#00b4cc] hover:bg-[#00B4CC15] rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        )}
        <Link 
          href="/profile"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 active:scale-98 transition-all cursor-pointer"
          title="Profil"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-[#ececed] flex items-center justify-center text-[14px] font-medium text-black">
            {initials}
          </div>
          <div className="text-[14px] leading-[20px] text-black font-medium hidden sm:block">
            {user?.name || (user?.role === 'SUPER_ADMIN' ? 'Owner' : 'Admin')}
          </div>
        </Link>
      </div>

      {/* Right: Language Dropdown & Exit Action */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Notifications Bell */}
        <div className="relative flex items-center" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 hover:bg-[#00B4CC15] rounded-full transition-colors relative cursor-pointer flex items-center justify-center text-slate-700"
          >
            <Bell size={22} className="text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1 shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] max-h-[480px] rounded-xl border border-[#ececed] bg-white shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#ececed] bg-slate-50 shrink-0">
                <div className="text-sm font-bold text-black">{t.notifications.title}</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[12px] font-semibold text-[#00B4CC] hover:opacity-85 transition-opacity cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    {t.notifications.markAllAsRead}
                  </button>
                )}
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto min-h-[100px] max-h-[380px] divide-y divide-[#ececed]">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-400 text-sm">
                    {t.notifications.noNotifications}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.isRead)}
                      className={cn(
                        "p-4 flex flex-col gap-1.5 transition-colors cursor-pointer text-left",
                        !n.isRead ? "bg-[#00B4CC10] hover:bg-[#00B4CC15]" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-black line-clamp-1">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00B4CC] mt-1.5 shrink-0" />
                        )}
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{n.body}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5">{n.createdAt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Dropdown */}
        <div className="relative flex items-center" ref={langRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-left text-base text-black font-sans font-medium cursor-pointer relative bg-transparent border-0 outline-none select-none"
          >
            <div className="w-8 h-8 relative shrink-0">
              <div className="absolute top-0 left-0 rounded-full bg-white w-8 h-8 shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                {flagPngMap[currentLang] ? (
                  <img src={flagPngMap[currentLang]} className="w-full h-full rounded-full object-cover" alt={currentLang} />
                ) : (
                  <span className="text-[18px] leading-none select-none">🌐</span>
                )}
              </div>
            </div>
            <div className="relative text-base font-semibold leading-6 text-black tracking-tight">{currentLang}</div>
            <div className="w-4 h-4 relative flex items-center justify-center shrink-0">
              <ChevronDown size={16} className={cn("text-slate-500 transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-[110px] rounded-lg border border-[#ececed] bg-white p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {languages.map(code => (
                <button
                  key={code}
                  onClick={() => handleLangChange(code)}
                  className={cn(
                    "w-full text-left h-[36px] px-2.5 rounded-md text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer",
                    currentLang === code
                      ? "bg-[#00B4CC15] text-[#00B4CC]"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {flagPngMap[code] ? (
                      <img src={flagPngMap[code]} className="w-full h-full rounded-full object-cover" alt={code} />
                    ) : (
                      <span className="text-[12px] leading-none select-none">🌐</span>
                    )}
                  </div>
                  <span>{code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exit Action */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[#F10303] hover:opacity-80 transition-opacity font-medium cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <LogOut size={16} />
          </div>
          <span className="text-[14px] leading-[20px] font-medium hidden sm:block">{t.common.exit}</span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Dropdown Menu Container */}
          <div className="absolute top-[72px] left-0 right-0 z-50 bg-white border border-[#ececed] rounded-xl shadow-xl p-4 lg:hidden animate-in fade-in slide-in-from-top-5 duration-300 max-h-[70vh] overflow-y-auto">
            <ul className="grid grid-cols-2 gap-3" role="list">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <li key={item.key} className="w-full">
                    <Link
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 border',
                        isActive
                          ? 'bg-white border-[#00b4cc] text-black shadow-sm'
                          : 'bg-slate-50 border-transparent text-black hover:bg-slate-100',
                      )}
                    >
                      <div className="shrink-0 text-black w-[18px] h-[18px] relative flex items-center justify-center animate-in duration-300">
                        {item.iconPath ? (
                          <Image src={item.iconPath} fill alt={t.nav[item.labelKey]} className="object-contain" />
                        ) : (
                          <Icon size={18} strokeWidth={2} />
                        )}
                      </div>
                      <span className="text-[13px] font-medium leading-none truncate text-slate-800">
                        {t.nav[item.labelKey]}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </header>
  )
}
