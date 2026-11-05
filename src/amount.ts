/** Convert a non-negative decimal amount to stroops without floating-point math. */
export function decimalToStroops(value: string): bigint | null {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  return BigInt(whole) * 10_000_000n + BigInt((fraction + "0000000").slice(0, 7));
}
