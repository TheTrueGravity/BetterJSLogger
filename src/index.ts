import {
    PathLike,
    PathOrFileDescriptor,
    readFileSync,
    writeFileSync
} from 'fs'
import { tmpdir } from 'os';

export enum LogLevel {
    ERROR = 0,
    WARN,
    INFO,
    DEBUG,
    VERBOSE
}

export interface ILogger {
    info(message: string, lable?: string): Promise<void>;
    debug(message: string, lable?: string): Promise<void>;
    error(message: string, lable?: string): Promise<void>;
    verbose(message: string, lable?: string): Promise<void>;
    warn(message: string, lable?: string): Promise<void>;

    log(level: LogLevel, message: string | Error, lable?: string): void;
}

export function getDateAsString(forFileName: boolean = false): string {
    const date_ob = new Date()
        
    var date = ("0" + date_ob.getDate()).slice(-2)
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
    var year = date_ob.getFullYear()
    var hours = date_ob.getHours()
    var minutes = date_ob.getMinutes()
    var seconds = date_ob.getSeconds()

    if (forFileName) {
        return `${date}-${month}-${year}_${hours}-${minutes}-${seconds}`
    } else {
        return `${date}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }
}

function getMessageAsString(level: string, message: string, lable: string | undefined): string {
    return `[${getDateAsString()}] ${level}` + (lable ? ` [${lable}]` : "") + ` | ${message}\n`
}

export default class Logger implements ILogger {
    private logFolder: PathLike
    private logFileName: string
    private logToFile: boolean
    private logFilePath(): PathOrFileDescriptor {
        return this.logFolder + '/' + this.logFileName
    }

    private getLogLevel(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR:
                return '[ERROR]'
            case LogLevel.WARN:
                return '[WARN]'
            case LogLevel.INFO:
                return '[INFO]'
            case LogLevel.DEBUG:
                return '[DEBUG]'
            case LogLevel.VERBOSE:
                return '[VERBOSE]'
            default:
                return '[UNKNOWN]'
        }
    }

    public constructor(config?: {
        logFolder?: PathLike,
        logFileName?: string,
        logToFile?: boolean
    }) {
        this.logFolder = config?.logFolder? config.logFolder : tmpdir()
        this.logFileName = config?.logFileName ? config.logFileName : `${getDateAsString(true)}.log`
        this.logToFile = (config?.logToFile != null) ? config.logToFile : true

        if (this.logToFile) {
            console.log(`Logging to ${this.logFilePath()}`)
    
            writeFileSync(this.logFilePath(), '', {
                encoding: 'utf8'
            })
    
            this.writeFile('------------------------------------------------------')
        }

    }

    private async writeFile(message: String): Promise<void> {
        const file = `${this.logFolder}/${this.logFileName}`
        var fileData = readFileSync(file, {
            encoding: 'utf8'
        })

        fileData += message + "\n"
        writeFileSync(file, fileData, {
            encoding: 'utf8'
        })
    }

    public async info(message: string, lable?: string): Promise<void> {
        this.log(LogLevel.INFO, message, lable)
    }

    public async debug(message: string, lable?: string): Promise<void> {
        this.log(LogLevel.DEBUG, message, lable)
    }

    public async error(message: string | Error, lable?: string): Promise<void> {
        this.log(LogLevel.ERROR, message, lable)
    }

    public async verbose(message: string, lable?: string): Promise<void> {
        this.log(LogLevel.VERBOSE, message, lable)
    }

    public async warn(message: string, lable?: string): Promise<void> {
        this.log(LogLevel.WARN, message, lable)
    }

    public async log(level: LogLevel, message: string | Error, lable?: string): Promise<void> {
        let msg: string

        const logLevel = this.getLogLevel(level)
        const logMessage = (message instanceof Error ? (message.stack ? message.stack : `${message.name}: ${message.message}`) : message)

        if (logMessage.includes('\n')) {
            const logMessages = logMessage.split(/\n/)
            msg = "------------------------------------------------------\n"
            msg += getMessageAsString(logLevel, "\n", lable)
            for (let i = 0; i < logMessages.length; i++) {
                msg += logMessages[i] + "\n"
            }
            msg += "------------------------------------------------------\n"
        } else {
            msg = getMessageAsString(logLevel, logMessage, lable)
        }

        console.log(msg)
        
        if (this.logToFile) this.writeFile(msg)
    }
}