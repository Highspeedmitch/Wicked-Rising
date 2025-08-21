//
//  GameScene.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

import Phaser from 'phaser'
import { Grid } from '@systems/Grid'
import { floodFill } from '@systems/Pathfinder'
import { attack } from '@systems/Combat'
import type { Unit } from '../types/game'

export default class GameScene extends Phaser.Scene {
  private grid!: Grid
  private units: Unit[] = []
  private currentTeam: 'BLUE' | 'RED' = 'BLUE'
  private selected: Unit | null = null
  private highlights: Phaser.GameObjects.Rectangle[] = []

  constructor() { super('game') }

  preload() {
    this.load.image('tileset', '/assets/tileset.png')
    this.load.image('blue', '/assets/unit_blue.png')
    this.load.image('red', '/assets/unit_red.png')
    this.load.json('units', '/src/data/units.json')
  }

  create() {
    const tile = 48
    const cols = 14, rows = 10
    this.grid = new Grid(cols, rows, tile)

    // Background
    const g = this.add.graphics()
    g.fillStyle(0x1a2238, 1)
    g.fillRect(0, 0, cols*tile, rows*tile)
    g.lineStyle(1, 0x2e3a5a, 1)
    for (let x=0; x<=cols; x++) g.strokeLineShape(new Phaser.Geom.Line(x*tile,0,x*tile,rows*tile))
    for (let y=0; y<=rows; y++) g.strokeLineShape(new Phaser.Geom.Line(0,y*tile,cols*tile,y*tile))

    // Units
    const data = this.cache.json.get('units') as { units: Unit[] }
    this.units = data.units

    this.units.forEach(u => {
      const tex = u.team === 'BLUE' ? 'blue' : 'red'
      const { x, y } = this.grid.tileToWorld(u.x, u.y)
      const sprite = this.add.image(x, y, tex).setOrigin(0.5)
      sprite.setData('id', u.id)
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', () => this.onUnitTapped(u))
    })

    // Tap to move/act
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // tile coordinate
      const { tx, ty } = this.grid.worldToTile(p.worldX, p.worldY)
      if (!this.grid.inBounds(tx, ty)) return
      if (this.selected) this.tryMoveOrAttack(tx, ty)
    })

    this.renderHUD()
  }

  private onUnitTapped(u: Unit) {
    if (u.team !== this.currentTeam) return
    this.selected = u
    this.clearHighlights()

    const blockers = (tx: number, ty: number) => this.units.some(o => o.x===tx && o.y===ty && o.id!==u.id)
    const cells = floodFill(u.x, u.y, u.move, (x,y)=>this.grid.inBounds(x,y), blockers)

    for (const c of cells) {
      const { x, y } = this.grid.tileToWorld(c.tx, c.ty)
      const r = this.add.rectangle(x, y, this.grid.tile-2, this.grid.tile-2)
      r.setStrokeStyle(2, 0x4fc3f7, 1)
      r.setFillStyle(0x4fc3f7, 0.15)
      this.highlights.push(r)
    }
  }

  private tryMoveOrAttack(tx: number, ty: number) {
    const sel = this.selected!
    // If enemy on tile -> attack
    const enemy = this.units.find(u => u.x===tx && u.y===ty && u.team!==sel.team)
    if (enemy && Math.abs(enemy.x - sel.x) + Math.abs(enemy.y - sel.y) === 1) {
      const dmg = attack(sel, enemy)
      this.toast(`${sel.id} hits ${enemy.id} for ${dmg}`)
      if (enemy.hp === 0) {
        this.units = this.units.filter(u => u.id !== enemy.id)
        this.children.getAll().forEach(obj => {
          if ((obj as any).data?.get?.('id') === enemy.id) obj.destroy()
        })
      }
      this.endTurn()
      return
    }

    // Otherwise attempt move within highlights
    const inRange = this.highlights.some(h => {
      const { tx: hx, ty: hy } = this.grid.worldToTile(h.x, h.y)
      return hx===tx && hy===ty
    })

    if (!inRange) return

    sel.x = tx; sel.y = ty
    const sprite = this.children.getAll().find(o => (o as any).data?.get?.('id') === sel.id) as Phaser.GameObjects.Image
    const { x, y } = this.grid.tileToWorld(tx, ty)
    this.tweens.add({ targets: sprite, x, y, duration: 120 })

    this.endTurn()
  }

  private endTurn() {
    this.selected = null
    this.clearHighlights()
    this.currentTeam = this.currentTeam === 'BLUE' ? 'RED' : 'BLUE'
    this.renderHUD()
  }

  private clearHighlights() {
    this.highlights.forEach(h => h.destroy())
    this.highlights = []
  }

  private renderHUD() {
    // Simple banner at top showing current team
    const text = this.children.getByName('banner') as Phaser.GameObjects.Text
    const label = `TURN: ${this.currentTeam}`
    if (text) text.setText(label)
    else this.add.text(8, 8, label, { fontFamily: 'monospace', fontSize: '20px', color: '#e3f2fd' }).setName('banner')
  }

  private toast(msg: string) {
    const t = this.add.text(8, 36, msg, { fontFamily: 'monospace', fontSize: '16px', color: '#fff' })
    this.time.delayedCall(1200, () => t.destroy())
  }
}
