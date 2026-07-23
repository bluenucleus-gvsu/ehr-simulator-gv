const DEFAULT_TIMEOUT_MESSAGE = "The Supabase request timed out."

export const SUPABASE_BROWSER_TIMEOUT_MS = 15_000
export const SUPABASE_SERVER_TIMEOUT_MS = 12_000
export const SUPABASE_MIDDLEWARE_TIMEOUT_MS = 7_000

export function createFetchWithTimeout(
  timeoutMs: number,
  timeoutMessage = DEFAULT_TIMEOUT_MESSAGE,
): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController()
    const sourceSignal = init?.signal

    const abortFromSource = () => {
      controller.abort(sourceSignal?.reason)
    }

    if (sourceSignal?.aborted) {
      abortFromSource()
    } else {
      sourceSignal?.addEventListener("abort", abortFromSource, { once: true })
    }

    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException(timeoutMessage, "TimeoutError"))
    }, timeoutMs)

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
      sourceSignal?.removeEventListener("abort", abortFromSource)
    }
  }
}

export function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as Record<string, unknown>

    return {
      name:
        typeof errorRecord.name === "string"
          ? errorRecord.name
          : "SupabaseError",
      message:
        typeof errorRecord.message === "string"
          ? errorRecord.message
          : "Supabase returned an error.",
    }
  }

  return {
    name: "UnknownError",
    message: "An unknown error occurred.",
  }
}
