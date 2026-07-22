'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  getYear,
  getMonth,
  setYear,
  setMonth
} from 'date-fns'
import { az } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface Props {
  selectedDate?: Date
  selectedDates?: Date[]
  onSelect?: (date: Date) => void
  onSelectDates?: (dates: Date[]) => void
  onClose?: () => void
  multiSelect?: boolean
}

export function CustomCalendar({ selectedDate, selectedDates = [], onSelect, onSelectDates, onClose, multiSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showMonthSelect, setShowMonthSelect] = useState(false)
  const [showYearSelect, setShowYearSelect] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const months = [
    'Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 
    'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'
  ]

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) + i)

  const handleDayClick = (day: Date) => {
    if (multiSelect || onSelectDates) {
      const exists = selectedDates.some(d => isSameDay(d, day))
      let newDates: Date[]
      if (exists) {
        newDates = selectedDates.filter(d => !isSameDay(d, day))
      } else {
        newDates = [...selectedDates, day]
      }
      onSelectDates?.(newDates)
      onSelect?.(day)
    } else {
      onSelect?.(day)
      onClose?.()
    }
  }

  return (
    <div className="w-[286px] rounded-[16px] bg-white border border-[#d9d9d9] flex flex-col items-center p-4 isolation-auto shadow-xl font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="self-stretch flex items-center gap-4 z-10">
        <button 
          onClick={prevMonth}
          className="rounded-full overflow-hidden flex items-center justify-center p-2 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-[#1e1e1e]" />
        </button>
        
        <div className="flex-1 flex items-start gap-2 relative">
          {/* Month Field */}
          <div className="flex-1 flex flex-col items-start relative">
            <button 
              onClick={() => setShowMonthSelect(!showMonthSelect)}
              className="self-stretch rounded-lg bg-white border border-[#d9d9d9] flex items-center p-[6px] gap-2 hover:border-[#00B4CC] transition-colors"
            >
              <span className="flex-1 text-left text-[14px] leading-none font-medium truncate">
                {months[getMonth(currentMonth)]}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            {showMonthSelect && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#d9d9d9] rounded-lg shadow-lg z-50 max-h-[150px] overflow-y-auto no-scrollbar">
                {months.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMonth(setMonth(currentMonth, idx))
                      setShowMonthSelect(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#00B4CC14] hover:text-[#00B4CC] transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Field */}
          <div className="flex-1 flex flex-col items-start relative">
            <button 
              onClick={() => setShowYearSelect(!showYearSelect)}
              className="self-stretch rounded-lg bg-white border border-[#d9d9d9] flex items-center p-[6px] gap-2 hover:border-[#00B4CC] transition-colors"
            >
              <span className="flex-1 text-left text-[14px] leading-none font-medium">
                {getYear(currentMonth)}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            {showYearSelect && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#d9d9d9] rounded-lg shadow-lg z-50 max-h-[150px] overflow-y-auto no-scrollbar">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setCurrentMonth(setYear(currentMonth, y))
                      setShowYearSelect(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#00B4CC14] hover:text-[#00B4CC] transition-colors"
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={nextMonth}
          className="rounded-full overflow-hidden flex items-center justify-center p-2 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight size={20} className="text-[#1e1e1e]" />
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col items-center pt-4 text-center">
        {/* Thead */}
        <div className="self-stretch flex items-center justify-center gap-[1px]">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="flex-1 flex items-center justify-center">
              <span className="text-[12px] leading-5 text-[#757575] font-normal">{d}</span>
            </div>
          ))}
        </div>

        {/* Tbody */}
        <div className="grid grid-cols-7 gap-1 mt-2">
          {days.map((day, idx) => {
            const isSelectedInMulti = selectedDates.some(d => isSameDay(d, day))
            const isSelectedSingle = selectedDate && isSameDay(day, selectedDate)
            const isSelected = multiSelect || onSelectDates ? isSelectedInMulti : isSelectedSingle
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center text-[16px] transition-all duration-200 font-inter",
                  !isCurrentMonth ? "text-[#b3b3b3]" : "text-[#1e1e1e]",
                  isSelected 
                    ? "bg-[#00b4cc] text-[#f5f5f5] font-medium" 
                    : isToday 
                      ? "bg-[#f5f5f5] text-[#1e1e1e] border border-[#00b4cc]" 
                      : "hover:bg-[#f5f5f5]"
                )}
              >
                <span className="leading-[140%]">{format(day, 'd')}</span>
              </button>
            )
          })}
        </div>

        {multiSelect && (
          <div className="w-full mt-3 pt-2 border-t border-[#ececed] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 rounded-lg bg-[#00B4CC] text-white text-xs font-semibold hover:bg-[#009db3] transition-colors shadow-sm"
            >
              Tətbiq et ({selectedDates.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
