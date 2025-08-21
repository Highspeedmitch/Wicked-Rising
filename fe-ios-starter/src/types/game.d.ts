//
//  game.d.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

export type Team = 'BLUE' | 'RED'

export interface Unit {
  id: string
  team: Team
  x: number
  y: number
  move: number  // tiles
  atk: number
  def: number
  hp: number
  maxHp: number
}
