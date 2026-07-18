export const toCanvasUnit = (value: number, current: number, zoom: number): number => {
  if (!zoom || zoom === 1) return value
  const normalized = value / zoom
  return Math.abs(normalized - current) < Math.abs(value - current) ? normalized : value
}

export const toSafeCanvasUnit = (
  value: unknown,
  current: number,
  zoom: number,
): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return current
  }
  return toCanvasUnit(value, current, zoom)
}

export const shouldKeepCurrentPositionOnResize = (
  left: unknown,
  top: unknown,
  currentX: number,
  currentY: number,
): boolean => {
  return left === 0 && top === 0 && (currentX !== 0 || currentY !== 0)
}