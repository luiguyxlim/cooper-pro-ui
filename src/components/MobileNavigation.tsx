'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Activity, 
  User, 
  Plus, 
  Menu, 
  X,
  UserPlus,
  ClipboardList
} from 'lucide-react'
import LogoutButton from './LogoutButton'
import TouchInteractions from './TouchInteractions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Avaliandos', href: '/evaluatees', icon: Users },
  { name: 'Testes', href: '/tests', icon: Activity },
]

const quickActions = [
  { name: 'Novo Avaliando', href: '/evaluatees/new', icon: UserPlus },
  { name: 'Novo Teste', href: '/tests/new', icon: ClipboardList },
]

interface MobileNavigationProps {
  className?: string
}

export default function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className={cn('md:hidden', className)}>
      {/* Menu Toggle Button */}
      <TouchInteractions onTap={toggleMenu}>
        <Button
          variant="ghost"
          size="icon"
          className="relative z-50"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </TouchInteractions>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-80 bg-background border-r shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Cooper Pro</h2>
            <TouchInteractions onTap={closeMenu}>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </TouchInteractions>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Navegação</h3>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <TouchInteractions key={item.name} onTap={closeMenu}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className={cn(
                        'h-5 w-5',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  </TouchInteractions>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Ações Rápidas</h3>
              {quickActions.map((action) => {
                const Icon = action.icon
                
                return (
                  <TouchInteractions key={action.name} onTap={closeMenu}>
                    <Link
                      href={action.href}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{action.name}</span>
                    </Link>
                  </TouchInteractions>
                )
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Usuário</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}