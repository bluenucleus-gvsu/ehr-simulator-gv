import { PostgrestError } from "@supabase/supabase-js";
import { Database, Json } from "../../../database.types";

export type LogLevel = Database["public"]["Enums"]["log_level"];
export type LogRuntime = Database["public"]["Enums"]["log_runtime"];
export type LogEntry = Database["public"]["Tables"]["logs"]["Insert"];

export interface LogOptions {
  immediate?: boolean;
}

export abstract class LoggerBase {

  protected abstract runtime: LogRuntime;

  protected abstract write(log: LogEntry, options?: LogOptions): Promise<void>;

  protected reportLoggingError(error: PostgrestError) {
    console.error(
      `[${this.constructor.name}] Failed to send logs:`,
      error.message,
      `| code: ${error.code}`,
      `| details: ${error.details}`,
      `| hint: ${error.hint}`,
    );
  }

  private getRoute() {
    return typeof window !== "undefined" ? window.location.pathname : undefined;
  }

  private async log(
    level: LogLevel,
    message: string,
    context?: Json,
    options?: LogOptions
  ): Promise<void> {

    const log: LogEntry = {
      level,
      message,
      context: context ?? null,
      runtime: this.runtime,
      route: this.getRoute()
    }

    await this.write(log, options);
  }

  public async debug(message: string, context?: Json, options?: LogOptions): Promise<void> {
    await this.log("debug", message, context, options);
  }
  public async info(message: string, context?: Json, options?: LogOptions): Promise<void> {
    await this.log("info", message, context, options);
  }
  public async warning(message: string, context?: Json, options?: LogOptions): Promise<void> {
    await this.log("warning", message, context, options);
  }
  public async error(message: string, context?: Json, options?: LogOptions): Promise<void> {
    await this.log("error", message, context, options);
  }
  public async critical(message: string, context?: Json, options?: LogOptions): Promise<void> {
    await this.log("critical", message, context, options);
  }

}