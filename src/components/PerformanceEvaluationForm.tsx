'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Heart, 
  Activity, 
  Target, 
  TrendingUp, 
  Save, 
  AlertCircle,
  Info,
  Thermometer,
  Weight,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Student, Test } from '@/types/database'

interface PerformanceEvaluationFormProps {
  student: Student
  previousTest?: Test
  onSubmit: (data: Partial<Test>) => Promise<void>
  className?: string
}

interface FormData {
  distance: string
  duration: string
  heart_rate: string
  weight: string
  temperature: string
  humidity: string
  observations: string
}

interface CalculatedMetrics {
  vo2_max: number
  classification: string
  training_intensity: {
    zone1: { min: number; max: number; description: string }
    zone2: { min: number; max: number; description: string }
    zone3: { min: number; max: number; description: string }
    zone4: { min: number; max: number; description: string }
    zone5: { min: number; max: number; description: string }
  }
  calories_burned: number
  oxygen_consumption: number
}

export default function PerformanceEvaluationForm({
  student,
  previousTest,
  onSubmit,
  className
}: PerformanceEvaluationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    distance: '',
    duration: '720', // 12 minutos em segundos
    heart_rate: '',
    weight: '',
    temperature: '20',
    humidity: '50',
    observations: ''
  })
  
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher dados do teste anterior se disponível
  useEffect(() => {
    if (previousTest) {
      setFormData(prev => ({
        ...prev,
        weight: previousTest.weight?.toString() || '',
        heart_rate: previousTest.heart_rate?.toString() || '',
        observations: previousTest.observations || ''
      }))
    }
  }, [previousTest])

  // Calcular métricas em tempo real
  useEffect(() => {
    if (formData.distance && formData.duration && formData.heart_rate && formData.weight) {
      calculateMetrics()
    } else {
      setCalculatedMetrics(null)
    }
  }, [formData.distance, formData.duration, formData.heart_rate, formData.weight, student.birth_date, student.gender])

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

  const calculateMetrics = () => {
    const distance = parseFloat(formData.distance)
    const duration = parseFloat(formData.duration)
    const heartRate = parseFloat(formData.heart_rate)
    const weight = parseFloat(formData.weight)
    const age = calculateAge(student.birth_date)
    
    if (!distance || !duration || !heartRate || !weight) return

    // Cálculo do VO2 Max usando a fórmula de Cooper
    const vo2_max = (distance - 504.9) / 44.73
    
    // Classificação baseada em idade e gênero
    const classification = getClassification(vo2_max, age, student.gender)
    
    // Zonas de treinamento baseadas na frequência cardíaca máxima
    const maxHeartRate = 220 - age
    const training_intensity = {
      zone1: {
        min: Math.round(maxHeartRate * 0.5),
        max: Math.round(maxHeartRate * 0.6),
        description: 'Recuperação Ativa'
      },
      zone2: {
        min: Math.round(maxHeartRate * 0.6),
        max: Math.round(maxHeartRate * 0.7),
        description: 'Base Aeróbica'
      },
      zone3: {
        min: Math.round(maxHeartRate * 0.7),
        max: Math.round(maxHeartRate * 0.8),
        description: 'Aeróbico'
      },
      zone4: {
        min: Math.round(maxHeartRate * 0.8),
        max: Math.round(maxHeartRate * 0.9),
        description: 'Limiar Anaeróbico'
      },
      zone5: {
        min: Math.round(maxHeartRate * 0.9),
        max: maxHeartRate,
        description: 'Neuromuscular'
      }
    }
    
    // Estimativa de calorias queimadas
    const calories_burned = Math.round((duration / 60) * weight * 0.175 * 8) // MET para corrida moderada
    
    // Consumo de oxigênio
    const oxygen_consumption = Math.round(vo2_max * weight)
    
    setCalculatedMetrics({
      vo2_max,
      classification,
      training_intensity,
      calories_burned,
      oxygen_consumption
    })
  }

  const getClassification = (vo2Max: number, age: number, gender: string) => {
    // Tabelas de classificação do VO2 Max por idade e gênero
    const classifications = {
      male: {
        '20-29': { excellent: 56, good: 51, fair: 45, poor: 40 },
        '30-39': { excellent: 54, good: 48, fair: 42, poor: 36 },
        '40-49': { excellent: 51, good: 45, fair: 39, poor: 33 },
        '50-59': { excellent: 48, good: 42, fair: 36, poor: 30 },
        '60+': { excellent: 45, good: 39, fair: 33, poor: 27 }
      },
      female: {
        '20-29': { excellent: 49, good: 44, fair: 38, poor: 33 },
        '30-39': { excellent: 46, good: 41, fair: 35, poor: 30 },
        '40-49': { excellent: 43, good: 38, fair: 32, poor: 27 },
        '50-59': { excellent: 40, good: 35, fair: 29, poor: 24 },
        '60+': { excellent: 37, good: 32, fair: 26, poor: 21 }
      }
    }
    
    const ageGroup = age < 30 ? '20-29' : age < 40 ? '30-39' : age < 50 ? '40-49' : age < 60 ? '50-59' : '60+'
    const genderKey = gender === 'masculino' ? 'male' : 'female'
    const ranges = classifications[genderKey][ageGroup]
    
    if (vo2Max >= ranges.excellent) return 'Excelente'
    if (vo2Max >= ranges.good) return 'Muito Bom'
    if (vo2Max >= ranges.fair) return 'Bom'
    if (vo2Max >= ranges.poor) return 'Regular'
    return 'Fraco'
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.distance) {
      newErrors.distance = 'Distância é obrigatória'
    } else if (parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Distância deve ser maior que zero'
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Duração é obrigatória'
    } else if (parseFloat(formData.duration) <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero'
    }
    
    if (!formData.heart_rate) {
      newErrors.heart_rate = 'Frequência cardíaca é obrigatória'
    } else if (parseFloat(formData.heart_rate) < 40 || parseFloat(formData.heart_rate) > 220) {
      newErrors.heart_rate = 'Frequência cardíaca deve estar entre 40 e 220 bpm'
    }
    
    if (!formData.weight) {
      newErrors.weight = 'Peso é obrigatório'
    } else if (parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Peso deve ser maior que zero'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !calculatedMetrics) return
    
    setIsLoading(true)
    
    try {
      const testData: Partial<Test> = {
        student_id: student.id,
        test_type: 'performance',
        test_date: new Date().toISOString(),
        distance: parseFloat(formData.distance),
        duration: parseFloat(formData.duration),
        heart_rate: parseFloat(formData.heart_rate),
        weight: parseFloat(formData.weight),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        vo2_max: calculatedMetrics.vo2_max,
        classification: calculatedMetrics.classification,
        observations: formData.observations
      }
      
      await onSubmit(testData)
      
    } catch (error) {
      console.error('Erro ao salvar teste:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Excelente': return 'bg-green-100 text-green-800'
      case 'Muito Bom': return 'bg-blue-100 text-blue-800'
      case 'Bom': return 'bg-yellow-100 text-yellow-800'
      case 'Regular': return 'bg-orange-100 text-orange-800'
      case 'Fraco': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Informações do Avaliando */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Avaliação de Performance - {student.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Idade:</span>
              <p className="font-medium">{calculateAge(student.birth_date)} anos</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gênero:</span>
              <p className="font-medium capitalize">{student.gender}</p>
            </div>
            {previousTest && (
              <>
                <div>
                  <span className="text-muted-foreground">Último VO₂ Max:</span>
                  <p className="font-medium">{previousTest.vo2_max?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Última Classificação:</span>
                  <p className="font-medium">{previousTest.classification || 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Dados do Teste</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="distance">Distância Percorrida (metros) *</Label>
                <Input
                  id="distance"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  placeholder="Ex: 2800"
                  className={errors.distance ? 'border-red-500' : ''}
                />
                {errors.distance && (
                  <p className="text-sm text-red-500 mt-1">{errors.distance}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="duration">Duração (segundos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="720 (12 minutos)"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="heart_rate">Frequência Cardíaca (bpm) *</Label>
                <Input
                  id="heart_rate"
                  type="number"
                  value={formData.heart_rate}
                  onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                  placeholder="Ex: 180"
                  className={errors.heart_rate ? 'border-red-500' : ''}
                />
                {errors.heart_rate && (
                  <p className="text-sm text-red-500 mt-1">{errors.heart_rate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Ex: 70.5"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  placeholder="Ex: 25"
                />
              </div>
              
              <div>
                <Label htmlFor="humidity">Umidade (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                  placeholder="Ex: 60"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Observações sobre o teste, condições climáticas, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Métricas Calculadas */}
        {calculatedMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Métricas Calculadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resultados Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{calculatedMetrics.vo2_max.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">VO₂ Max (ml/kg/min)</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="mb-2">
                    <Badge className={getClassificationColor(calculatedMetrics.classification)}>
                      {calculatedMetrics.classification}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Classificação</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{calculatedMetrics.calories_burned}</p>
                  <p className="text-sm text-muted-foreground">Calorias Queimadas</p>
                </div>
              </div>
              
              {/* Zonas de Treinamento */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Zonas de Treinamento (Frequência Cardíaca)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {Object.entries(calculatedMetrics.training_intensity).map(([zone, data]) => (
                    <div key={zone} className="p-3 border rounded-lg text-center">
                      <p className="font-medium text-sm">{data.description}</p>
                      <p className="text-lg font-bold text-primary">{data.min}-{data.max}</p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Informações Adicionais */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Consumo de Oxigênio:</strong> {calculatedMetrics.oxygen_consumption} ml/min
                  <br />
                  <strong>Estimativa de Gasto Calórico:</strong> {calculatedMetrics.calories_burned} kcal
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading || !calculatedMetrics}
            className="min-w-[120px]"
          >
            {isLoading ? (
              'Salvando...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Teste
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}