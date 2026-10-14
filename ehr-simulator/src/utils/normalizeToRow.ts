type MaybeArray<T> = T | T[] | null;

/**
 * Supabase returns many-to-one relations as either an object or a
 * single-element array depending on the FK shape — normalize to one row.
 */
export function one<T>(value: MaybeArray<T> | undefined): T | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}
