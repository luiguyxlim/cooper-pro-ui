'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TouchInteractions, { useHapticFeedback } from '@/components/TouchInteractions'
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  Edit, 
  Eye, 
  Trash2,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Test } from '@/types/database'

interface TestCardProps {
  test: Test
  onEdit?: (test: Test) => void
  onView?: (test: Test) => void
  onDelete?: (test: Test) => void
  className?: string
  showActions?: boolean
  showStudent?: boolean
}

export default function TestCard({
  test,
  onEdit,
  onView,
  onDelete,
  className,
  showActions = true,
  showStudent = true
}: TestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { vibrate } = useHapticFeedback()

  const handleCardTap = () => {
    vibrate(10)
    if (onView) {
      onView(test)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    vibrate(15)
    if (onEdit) {
      onEdit(test)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    vibrate(25)
    
    if (onDelete && confirm('Tem certeza que deseja excluir este teste?')) {
      setIsLoading(true)
      try {
        await onDelete(test)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString('pt-BR')} m`
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'cooper':
        return 'Teste de Cooper'
      case 'performance':
        return 'Avaliação de Performance'
      default:
        return type
    }
  }

  const getTestTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'cooper':
        return 'default'
      case 'performance':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case 'excelente':
        return 'text-green-600'
      case 'muito bom':
        return 'text-blue-600'
      case 'bom':
        return 'text-yellow-600'
      case 'regular':
        return 'text-orange-600'
      case 'fraco':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <TouchInteractions
      onTap={handleCardTap}
      className={cn('cursor-pointer', className)}
      enableRipple
    >
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={getTestTypeBadgeVariant(test.test_type)}>
                  {getTestTypeLabel(test.test_type)}
                </Badge>
                
                {test.classification && (
                  <Badge 
                    variant="outline" 
                    className={cn('border-0', getClassificationColor(test.classification))}
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {test.classification}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-lg truncate">
                {showStudent && test.student_name ? test.student_name : `Teste #${test.id}`}
              </CardTitle>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(test.test_date).toLocaleDateString('pt-BR')}</span>
                </div>
                
                {test.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(test.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {test.distance && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-semibold">{formatDistance(test.distance)}</p>
                <p className="text-xs text-muted-foreground">Distância</p>
              </div>
            )}
            
            {test.vo2_max && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-semibold">{test.vo2_max.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">VO₂ Max</p>
              </div>
            )}
          </div>
          
          {/* Informações adicionais */}
          <div className="space-y-2 mb-4">
            {test.heart_rate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frequência Cardíaca:</span>
                <span className="font-medium">{test.heart_rate} bpm</span>
              </div>
            )}
            
            {test.weight && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peso:</span>
                <span className="font-medium">{test.weight} kg</span>
              </div>
            )}
            
            {test.temperature && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Temperatura:</span>
                <span className="font-medium">{test.temperature}°C</span>
              </div>
            )}
          </div>
          
          {/* Observações */}
          {test.observations && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Observações:</p>
              <p className="text-sm bg-muted/50 p-2 rounded text-foreground">
                {test.observations}
              </p>
            </div>
          )}
          
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
                
                <Link href={`/tests/${test.id}`}>
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
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="h-8"
              >
                {isLoading ? (
                  'Excluindo...'
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
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