const sma = (input: number[]) => {
  return input.reduce((a, b) => a + b, 0) / input.length
}

const stdev = (input: number[]) => {
  const m = sma(input)
  return Math.sqrt(input.reduce((a, b) => a + Math.pow(b - m, 2), 0) / input.length)
}

export const math = {
  sma,
  stdev
}
