
export type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug'

export class Logger {
    
    public tag: string
    
    constructor(tag: string) {
        
        this.tag = tag
        
    }
    
    private _log(level: LogLevel, messages: unknown[]) {
        
        const processed = this.collateArguments(messages)
        
        console[level](`[${this.tag}]`, ...processed)
        
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
        this._log('log', messages)
    }
    
    public info(...messages: unknown[]) {
        this._log('info', messages)
    }
    
    public warn(...messages: unknown[]) {
        this._log('warn', messages)
    }
    
    public error(...messages: unknown[]) {
        this._log('error', messages)
    }
    
    // Aliases
    
    public d(...messages: unknown[]) {
        this._log('log', messages)
    }
    
    public i(...messages: unknown[]) {
        this._log('info', messages)
    }
    
    public w(...messages: unknown[]) {
        this._log('warn', messages)
    }
    
    public e(...messages: unknown[]) {
        this._log('error', messages)
    }
    
}

export const createLogger = (tag: string) => new Logger(tag)

export default createLogger

/*const log = new Logger('example')

log.d('Simple')
log.d('JSON', { foo: 'bar', biz: 'bat', now: new Date(), arr: ['foo', 'bar', 'baz'] })
log.d('Mixed', [1,2,3], 'foo', { bar: 'baz' }, new Set([1,2,3]), new Date(), true)*/
