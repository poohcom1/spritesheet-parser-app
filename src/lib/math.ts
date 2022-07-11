export function wrapi(i: number, min: number, max: number) {
  const range = max - min;
  return range == 0 ? min : min + ((((i - min) % range) + range) % range);
}
