export function normalizeOptionalNumericInput(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function filterAdministrationsForOrders<
  TAdministration extends { medicationOrderId: string },
>(
  orders: ReadonlyArray<{ id: string }>,
  administrations: ReadonlyArray<TAdministration>,
): TAdministration[] {
  const orderIds = new Set(orders.map((order) => order.id));
  return administrations.filter((administration) =>
    orderIds.has(administration.medicationOrderId),
  );
}
