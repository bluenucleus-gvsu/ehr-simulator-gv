import { LogEntry, LogRuntime, LogOptions, LoggerBase } from "./LoggerBase";
import { Database } from "../../../database.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import "server-only";

const supabase: SupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Server-side logger that writes directly to Supabase using the service role key.
 * 
 * Must only be used in server contexts!
 *
 * @example
 * const logger = ServerLogger.create();
 * await logger.info("User signed up", { userId: "123" });
 */
export class ServerLogger extends LoggerBase {

  protected runtime: LogRuntime = "server";

  private constructor() {
    super();
  }

  /**
   * Creates a new ServerLogger instance.
   */
  static create(): ServerLogger {
    return new ServerLogger();
  }

  protected async write(log: LogEntry, _options?: LogOptions): Promise<void> {
    const { error } = await supabase
      .from("logs")
      .insert(log);

    if (error) {
      this.reportLoggingError(error);
    }
  }

}