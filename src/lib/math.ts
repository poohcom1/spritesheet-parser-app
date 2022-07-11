export function wrapi(i: number, max: number, min = 0) {
  const range = max - min;
  return range == 0 ? min : min + ((((i - min) % range) + range) % range);
}
