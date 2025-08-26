'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Smartphone, Wifi, WifiOff, RefreshCw, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkIfInstalled()

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listener para mudanças no status de conexão
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Registrar service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js')
          setRegistration(reg)

          // Verificar por atualizações
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true)
                }
              })
            }
          })

          // Verificar se há um service worker aguardando
          if (reg.waiting) {
            setShowUpdatePrompt(true)
          }

        } catch (error) {
          console.error('Erro ao registrar service worker:', error)
        }
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    registerServiceWorker()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  const handleUpdateClick = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdatePrompt(false)
      window.location.reload()
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false)
  }

  return (
    <>
      {/* Status de Conexão */}
      {!isOnline && (
        <Alert className="fixed top-4 left-4 right-4 z-50 bg-yellow-50 border-yellow-200">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Prompt de Instalação */}
      {showInstallPrompt && !isInstalled && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Instalar App</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissInstallPrompt}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Instale o Cooper Pro para uma experiência melhor
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-2">
              <Button onClick={handleInstallClick} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button variant="outline" onClick={dismissInstallPrompt}>
                Agora não
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt de Atualização */}
      {showUpdatePrompt && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Atualização Disponível</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissUpdatePrompt}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Uma nova versão do app está disponível
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-2">
              <Button onClick={handleUpdateClick} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={dismissUpdatePrompt}>
                Depois
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicador de Status Online/Offline */}
      <div className="fixed top-4 right-4 z-40">
        {isOnline ? (
          <div className="flex items-center space-x-1 text-green-600 text-sm">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}
      </div>
    </>
  )
}