import {
    ILogger,
    LogLevel
} from '../src/index'

test("LogLevel", () => {
    expect(`${LogLevel.ERROR}|${LogLevel.WARN}|${LogLevel.INFO}|${LogLevel.DEBUG}|${LogLevel.VERBOSE}`).toBe('0|1|2|3|4')
})