'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export default function LogoutButton({ 
  variant = 'ghost', 
  size = 'sm',
  className,
  showIcon = true,
  showText = false
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro ao fazer logout:', error.message)
        return
      }
      
      // Redirecionar para a página de login
      router.push('/auth/login')
      router.refresh()
      
    } catch (error) {
      console.error('Erro inesperado ao fazer logout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      title="Sair"
    >
      {showIcon && <LogOut className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
      {showText && (isLoading ? 'Saindo...' : 'Sair')}
    </Button>
  )
}