export class Logger {
  private static log(level: "INFO" | "WARN" | "ERROR", message: string, meta?: any) {
    const timestamp = new Date().toISOString()
    const entry = { timestamp, level, message, meta }
    console.log(JSON.stringify(entry))
  }

  static info(message: string, meta?: any) {
    this.log("INFO", message, meta)
  }

  static warn(message: string, meta?: any) {
    this.log("WARN", message, meta)
  }

  static error(message: string, meta?: any) {
    this.log("ERROR", message, meta)
  }
}
