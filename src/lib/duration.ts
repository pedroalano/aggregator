export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(`invalid duration: ${durationStr}`);
  }
  const n = parseInt(match[1], 10);
  const unit = match[2] as "ms" | "s" | "m" | "h";
  const mult = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 }[unit];
  return n * mult;
}
