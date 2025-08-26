'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TouchInteractionsProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  className?: string
  enableRipple?: boolean
  swipeThreshold?: number
}

interface RippleEffect {
  x: number
  y: number
  size: number
  id: number
}

export default function TouchInteractions({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className,
  enableRipple = true,
  swipeThreshold = 50
}: TouchInteractionsProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<RippleEffect[]>([])
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!enableRipple || !elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2

    const newRipple: RippleEffect = {
      x: x - size / 2,
      y: y - size / 2,
      size,
      id: Date.now()
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [enableRipple])

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    createRipple(event)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Detectar swipe (movimento rápido e longo)
    if (deltaTime < 300 && distance > swipeThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe horizontal
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    } else if (deltaTime < 300 && distance < 10 && onTap) {
      // Tap (toque rápido e curto)
      onTap()
    }

    touchStartRef.current = null
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    createRipple(event)
  }

  const handleClick = () => {
    if (onTap) {
      onTap()
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      
      {/* Ripple Effects */}
      {enableRipple && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none rounded-full bg-white/20 animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      ))}
    </div>
  )
}

// Hook para detectar se é dispositivo móvel
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword))
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileUserAgent || (isTouchDevice && isSmallScreen))
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

// Hook para feedback tátil
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return { vibrate }
}