'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import TouchInteractions, { useHapticFeedback } from '@/components/TouchInteractions'
import { 
  User, 
  Calendar, 
  Activity, 
  Edit, 
  Eye, 
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Student } from '@/types/database'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onView?: (student: Student) => void
  onToggleStatus?: (student: Student) => void
  className?: string
  showActions?: boolean
}

export default function StudentCard({
  student,
  onEdit,
  onView,
  onToggleStatus,
  className,
  showActions = true
}: StudentCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { vibrate } = useHapticFeedback()

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleCardTap = () => {
    vibrate(10)
    if (onView) {
      onView(student)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    vibrate(15)
    if (onEdit) {
      onEdit(student)
    }
  }

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation()
    vibrate(20)
    
    if (onToggleStatus) {
      setIsLoading(true)
      try {
        await onToggleStatus(student)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const age = calculateAge(student.birth_date)
  const isActive = student.is_active

  return (
    <TouchInteractions
      onTap={handleCardTap}
      className={cn('cursor-pointer', className)}
      enableRipple
    >
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md',
        !isActive && 'opacity-60 bg-muted/50'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn(
                  'text-sm font-medium',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <CardTitle className={cn(
                  'text-lg truncate',
                  !isActive && 'text-muted-foreground'
                )}>
                  {student.name}
                </CardTitle>
                
                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{age} anos</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span className="capitalize">{student.gender}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isActive ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                )}
              >
                {isActive ? (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <UserX className="h-3 w-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Informações adicionais */}
          <div className="space-y-2 mb-4">
            {student.email && (
              <p className="text-sm text-muted-foreground truncate">
                📧 {student.email}
              </p>
            )}
            
            {student.phone && (
              <p className="text-sm text-muted-foreground">
                📱 {student.phone}
              </p>
            )}
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Último teste: {student.last_test_date ? new Date(student.last_test_date).toLocaleDateString('pt-BR') : 'Nenhum'}</span>
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <Link href={`/evaluatees/${student.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </Link>
              </div>
              
              <Button
                variant={isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggleStatus}
                disabled={isLoading}
                className="h-8"
              >
                {isLoading ? (
                  'Processando...'
                ) : isActive ? (
                  <>
                    <UserX className="h-4 w-4 mr-1" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Ativar
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TouchInteractions>
  )
}