/* eslint-disable no-console */

import c from 'ansi-colors'

import type { LogLevel } from '@/types'

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
        // Must be a literal property access so Next.js can inline it into the client bundle.
        const envEnabled = process.env.NEXT_PUBLIC_LOG_ENABLED === 'true'
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
