'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Bug, 
  Download, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Clock,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react'

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  component: string
  message: string
  data?: any
  error?: Error
}

interface DebugLoggerProps {
  className?: string
  maxLogs?: number
  autoScroll?: boolean
}

// Global log store
let globalLogs: LogEntry[] = []
let logListeners: ((logs: LogEntry[]) => void)[] = []

// Global logger functions
export const logger = {
  info: (component: string, message: string, data?: any) => {
    addLog('info', component, message, data)
  },
  warn: (component: string, message: string, data?: any) => {
    addLog('warn', component, message, data)
  },
  error: (component: string, message: string, error?: Error, data?: any) => {
    addLog('error', component, message, data, error)
  }
}

function addLog(level: LogLevel, component: string, message: string, data?: any, error?: Error) {
  const newLog: LogEntry = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    level,
    component,
    message,
    data,
    error
  }

  globalLogs = [newLog, ...globalLogs].slice(0, 1000) // Keep only last 1000 logs
  logListeners.forEach(listener => listener(globalLogs))
}

export default function DebugLogger({ 
  className, 
  maxLogs = 100, 
  autoScroll = true 
}: DebugLoggerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [componentFilter, setComponentFilter] = useState<string>('all')
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(autoScroll)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  // Subscribe to global logs
  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => {
      setLogs(newLogs.slice(0, maxLogs))
    }
    
    logListeners.push(listener)
    listener(globalLogs) // Initial load
    
    return () => {
      logListeners = logListeners.filter(l => l !== listener)
    }
  }, [maxLogs])

  // Filter logs
  useEffect(() => {
    let filtered = logs
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }
    
    if (componentFilter !== 'all') {
      filtered = filtered.filter(log => log.component === componentFilter)
    }
    
    setFilteredLogs(filtered)
  }, [logs, levelFilter, componentFilter])

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScrollEnabled && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScrollEnabled])

  // Get unique components
  const components = Array.from(new Set(logs.map(log => log.component)))

  const downloadLogs = () => {
    const logsText = filteredLogs.map(log => {
      const timestamp = log.timestamp.toISOString()
      const data = log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''
      const error = log.error ? `\nError: ${log.error.message}\nStack: ${log.error.stack}` : ''
      return `[${timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}${data}${error}`
    }).join('\n\n')
    
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cooper-pro-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    globalLogs = []
    logListeners.forEach(listener => listener(globalLogs))
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getLevelBadgeVariant = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return 'default'
      case 'warn':
        return 'secondary'
      case 'error':
        return 'destructive'
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className={cn('fixed bottom-4 right-4 z-50', className)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug ({logs.length})
      </Button>
    )
  }

  return (
    <Card className={cn('fixed bottom-4 right-4 w-96 h-96 z-50 flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Debug Logger
            <Badge variant="outline" className="ml-2">
              {filteredLogs.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadLogs}
              className="h-8 w-8"
              title="Download logs"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearLogs}
              className="h-8 w-8"
              title="Clear logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8"
            >
              {isVisible ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-2 text-sm">
          <Filter className="h-4 w-4" />
          <Select value={levelFilter} onValueChange={(value: LogLevel | 'all') => setLevelFilter(value)}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={componentFilter} onValueChange={setComponentFilter}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {components.map(component => (
                <SelectItem key={component} value={component}>
                  {component}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={autoScrollEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
            className="h-8 px-2 text-xs"
          >
            Auto-scroll
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <div 
          ref={logsContainerRef}
          className="h-full overflow-y-auto p-3 space-y-2 text-xs"
        >
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                'p-2 rounded border-l-4 bg-muted/50',
                log.level === 'info' && 'border-l-blue-500',
                log.level === 'warn' && 'border-l-yellow-500',
                log.level === 'error' && 'border-l-red-500'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {getLevelIcon(log.level)}
                  <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                    {log.level}
                  </Badge>
                  <span className="font-medium">{log.component}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{log.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              
              <p className="text-foreground mb-1">{log.message}</p>
              
              {log.data && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Dados
                  </summary>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
              
              {log.error && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-red-600 hover:text-red-700">
                    Erro
                  </summary>
                  <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <p className="font-medium text-red-800">{log.error.message}</p>
                    {log.error.stack && (
                      <pre className="mt-1 text-red-700 overflow-x-auto">
                        {log.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </CardContent>
    </Card>
  )
}