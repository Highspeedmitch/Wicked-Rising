//
//  Pathfinder.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

type Blocker = (tx: number, ty: number) => boolean

export function floodFill(
  sx: number,
  sy: number,
  maxSteps: number,
  inBounds: (x: number, y: number) => boolean,
  blocked: Blocker
) {
  const Q: [number, number, number][] = [[sx, sy, 0]]
  const seen = new Set<string>([`${sx},${sy}`])
  const cells: { tx: number; ty: number; d: number }[] = []

  while (Q.length) {
    const [x, y, d] = Q.shift()!
    cells.push({ tx: x, ty: y, d })
    if (d === maxSteps) continue
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy
      const key = `${nx},${ny}`
      if (!inBounds(nx, ny) || seen.has(key) || blocked(nx, ny)) continue
      seen.add(key)
      Q.push([nx, ny, d + 1])
    }
  }
  return cells
}
