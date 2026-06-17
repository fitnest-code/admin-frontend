'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps extends React.ComponentProps<'span'> {
  type: string
}

export function SubscriptionBadge({ type, className, ...props }: SubscriptionBadgeProps) {
  const normalizedType = type?.toLowerCase() || ''
  
  let gradientStyle: React.CSSProperties = {}
  
  if (normalizedType === 'gold') {
    gradientStyle = {
      background: 'linear-gradient(104.88deg, rgba(231, 183, 95, 0) -55.17%, #F8D57E 94.46%)',
      backgroundColor: '#E7B75F',
    }
  } else if (normalizedType === 'platinum') {
    gradientStyle = {
      background: 'linear-gradient(99.99deg, #313131 1.35%, #515254 41.81%, #5B5B5D 56.68%, #565857 101.38%)',
      backgroundColor: '#4A4B4D',
    }
  } else if (normalizedType === 'bronze') {
    gradientStyle = {
      background: 'linear-gradient(111.92deg, rgba(216, 166, 115, 0) -81.9%, #B97A3C 98.77%)',
      backgroundColor: '#D8A673',
    }
  } else if (normalizedType === 'silver') {
    gradientStyle = {
      background: 'linear-gradient(106.25deg, rgba(229, 232, 236, 0) -108.79%, #9BAAC7 94.91%)',
      backgroundColor: '#E5E8EC',
    }
  } else {
    gradientStyle = {
      backgroundColor: '#9ca3af',
    }
  }

  return (
    <span
      data-slot="subscription-badge"
      className={cn(
        'inline-flex items-center justify-center rounded-[20px] px-[18px] py-[3px] text-[13px] font-semibold leading-normal text-white text-center shadow-3xs select-none min-w-[85px]',
        className
      )}
      style={gradientStyle}
      {...props}
    >
      {type}
    </span>
  )
}
