import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  service: string
  message: string
  duration?: number
  metadata?: Record<string, any>
}

class Logger {
  private logDir: string
  private logFile: string

  constructor() {
    this.logDir = join(process.cwd(), 'logs')
    this.logFile = join(this.logDir, `app-${this.getDateString()}.log`)
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0] // YYYY-MM-DD
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, service, message, duration, metadata } = entry
    let log = `[${timestamp}] [${level}] [${service}] ${message}`
    
    if (duration !== undefined) {
      log += ` | Duration: ${duration}ms`
    }
    
    if (metadata && Object.keys(metadata).length > 0) {
      log += ` | Metadata: ${JSON.stringify(metadata)}`
    }
    
    return log + '\n'
  }

  private writeLog(entry: LogEntry) {
    const formattedLog = this.formatLogEntry(entry)
    
    // Log to console
    const consoleLog = `[${entry.level}] [${entry.service}] ${entry.message}${
      entry.duration !== undefined ? ` (${entry.duration}ms)` : ''
    }`
    
    switch (entry.level) {
      case 'ERROR':
        console.error(consoleLog, entry.metadata || '')
        break
      case 'WARN':
        console.warn(consoleLog, entry.metadata || '')
        break
      default:
        console.log(consoleLog, entry.metadata || '')
    }

    // Write to file
    try {
      appendFileSync(this.logFile, formattedLog, 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  info(service: string, message: string, duration?: number, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service,
      message,
      duration,
      metadata,
    })
  }

  error(service: string, message: string, error?: any, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service,
      message,
      metadata: {
        ...metadata,
        error: error?.message || error,
        stack: error?.stack,
      },
    })
  }

  warn(service: string, message: string, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      service,
      message,
      metadata,
    })
  }

  debug(service: string, message: string, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      service,
      message,
      metadata,
    })
  }
}

export const logger = new Logger()

// Utility function to measure execution time
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}

