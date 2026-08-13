import { LogEntry, LogRuntime, LogOptions, LoggerBase } from "./LoggerBase";
import { Database } from "../../../database.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import "client-only";

/**
 * Client-side logger that writes directly to Supabase using the anon key.
 * Buffers log entries and flushes them to Supabase
 * in batches on a fixed interval.
 * Unlike ServerLogger, ClientLogger uses a singleton pattern
 * to ensure that all parts of the app share the same buffer and flush timer,
 * preventing out-of-order delivery and excess instantiation.
 * 
 * Must only be used in browser contexts!
 *
 * @example
 * // Log an error with context
 * try {
 *   await handleSubmit();
 * } catch (err) {
 *   await ClientLogger.create().error("Form submission failed", { error: err.message, formId: "intake/output" });
 * }
 * 
 * @example
 * // Debug log to trace component lifecycle
 * const logger = ClientLogger.create();
 * await logger.debug("Component mounted", { component: "Alert dialog", userId: "123" });
 * 
 * @example
 * // Send error immediately, bypassing buffer
 * const logger = await ClientLogger.create();
 * logger.error("Failed to load user data", { userId: user.id, error: err.message }, { immediate: true });
 */
export class ClientLogger extends LoggerBase {

  private static instance: ClientLogger | null = null;

  protected runtime: LogRuntime = "client";
  private supabase: SupabaseClient;

  private readonly FLUSH_INTERVAL_MS: number = 3000;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private buffer: LogEntry[] = [];

  private constructor() {
    super();
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.startFlushTimer();
    this.setupFlushOnUnload();
  }

  /**
   * Returns the singleton ClientLogger instance, creating it if it doesn't exist.
   */
  public static create(): ClientLogger {
    if (!ClientLogger.instance) {
      ClientLogger.instance = new ClientLogger();
    }
    return ClientLogger.instance;
  }

  private setupFlushOnUnload() {
    window.addEventListener("beforeunload", () => {
      this.flush(); // Best effort, may not survive browser unload
    });
  }

  private async send(logs: LogEntry[]): Promise<void> {
    const { error } = await this.supabase
      .from("logs")
      .insert(logs);

    if (error) {
      this.reportLoggingError(error);
      throw error; // Throw to re-buffer logs if send fails
    }
  }

  protected async write(log: LogEntry, options?: LogOptions): Promise<void> {
    if (options?.immediate) {
      await this.send([log]);
      return;
    }

    const key = this.getLogKey(log);
    const existing = this.buffer.find((entry) => this.getLogKey(entry) === key);

    if (existing) {
      existing.duplicate_count = (existing.duplicate_count ?? 1) + 1;
      return;
    }

    this.buffer.push(log);
  }

  private isBufferEmpty() {
    return this.buffer.length === 0;
  }

  private getLogKey(log: LogEntry): string {
    return JSON.stringify({
      level: log.level,
      message: log.message,
      context: log.context ?? null,
      route: log.route ?? null,
    });
  }

  public async flush(): Promise<void> {
    if (this.isBufferEmpty()) return;
    const raw = this.buffer.splice(0, this.buffer.length);

    try {
      await this.send(raw);
    }
    catch {
      // Re-buffer if send fails
      this.buffer.unshift(...raw);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
  }
}