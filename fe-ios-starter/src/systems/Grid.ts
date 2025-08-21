//
//  Grid.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

export class Grid {
  constructor(public cols: number, public rows: number, public tile: number) {}

  worldToTile(x: number, y: number) {
    return { tx: Math.floor(x / this.tile), ty: Math.floor(y / this.tile) }
  }

  tileToWorld(tx: number, ty: number) {
    return { x: tx * this.tile + this.tile / 2, y: ty * this.tile + this.tile / 2 }
  }

  inBounds(tx: number, ty: number) {
    return tx >= 0 && ty >= 0 && tx < this.cols && ty < this.rows
  }
}
