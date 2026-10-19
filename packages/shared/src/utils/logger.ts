/* eslint-disable no-console */

/// <reference path="../env.d.ts" />

import c from 'ansi-colors'

import type { LogLevel } from '../types/logger.types'

function isClientLogEnabled(): boolean {
    // Static `import.meta.env.VITE_*` access so Vite can inline it in the client bundle.
    return import.meta.env.VITE_LOG_ENABLED === 'true'
}

function isServerLogEnabled(): boolean {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    if (!env)
        return false
    return env.LOG_ENABLED === 'true'
        || env.NEXT_PUBLIC_LOG_ENABLED === 'true'
}

export const LogLevels = {
    log: 'log',
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
} as const

export class Logger {
    
    public tag: string
    public enabled: boolean
    public colorize: boolean
    
    public static hooks: Array<(level: LogLevel, processed: unknown[]) => Promise<void>> = []
    
    public static registerHook(fn: (level: LogLevel, processed: unknown[]) => Promise<void>) {
        
        Logger.hooks.push(fn)
        
    }
    
    constructor(tag: string, enabled?: boolean, colorize?: boolean) {
        
        this.tag = tag
        const isBrowser = typeof window !== 'undefined'
        const envEnabled = isBrowser ? isClientLogEnabled() : isServerLogEnabled()
        // On the server there's no client env var, so default to enabled.
        // In the browser, only enable when explicitly opted in.
        const enabledByDefault = !isBrowser
        this.enabled = enabled === true ? true : (envEnabled || enabledByDefault)
        this.colorize = colorize === true
            ? true
            : (!isBrowser ? false : envEnabled)
        
    }
    
    private _log(level: LogLevel, messages: unknown[]) {
        
        if (!this.enabled)
            return
        
        const processed = this.collateArguments(messages)
        
        const tag = this.colorizeText(`[${this.tag}]`, level)
        
        console[level](tag, ...processed)
        
        Logger.hooks.map(hook => hook(level, processed))
        
    }
    
    public registerHook(fn: (level: LogLevel, processed: unknown[]) => Promise<void>) {
        
        Logger.hooks.push(fn)
        
    }
    
    private colorizeText(text: string, level: LogLevel) {
        
        if (!this.colorize)
            return text
        
        switch (level) {
            case LogLevels.log: return c.cyan(text)
            case LogLevels.error: return c.red(text)
            case LogLevels.warn: return c.yellow(text)
            case LogLevels.info: return c.bgCyanBright(text)
            case LogLevels.debug: return c.green(text)
            default:
                throw new Error(`Invalid log level "${level}"`)
        }
        
    }
    
    public collateArguments(args: unknown[]): unknown[] {
        
        const result = []
        
        for (const argument of args) {
            
            if (typeof argument === 'string' && result.length > 0)
                result[Math.max(result.length - 1, 0)] += ` ${argument}`
            else
                result.push(argument)
            
        }
        
        return result
        
    }
    
    public debug(...messages: unknown[]) {
        return this._log('log', messages)
    }
    
    public info(...messages: unknown[]) {
        return this._log('info', messages)
    }
    
    public warn(...messages: unknown[]) {
        return this._log('warn', messages)
    }
    
    public error(...messages: unknown[]) {
        return this._log('error', messages)
    }
    
    public d(...messages: unknown[]) {
        return this._log('log', messages)
    }
    
    public i(...messages: unknown[]) {
        return this._log('info', messages)
    }
    
    public w(...messages: unknown[]) {
        return this._log('warn', messages)
    }
    
    public e(...messages: unknown[]) {
        return this._log('error', messages)
    }
    
}

export default Logger
