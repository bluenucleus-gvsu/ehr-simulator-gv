/**
 * Table row objects often store per–time-point values under numeric keys.
 * After JSON round-trips (e.g. localStorage), some paths only resolve via string keys.
 */
export function timeColumnCell(row: Record<string | number | symbol, unknown>, offset: number): unknown {
  const fromNum = row[offset];
  if (fromNum !== undefined && fromNum !== null) return fromNum;
  const fromStr = row[String(offset)];
  if (fromStr !== undefined && fromStr !== null) return fromStr;
  return undefined;
}
