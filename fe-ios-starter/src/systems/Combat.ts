//
//  Combat.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

import type { Unit } from '../types/game'

export function basicDamage(attacker: Unit, defender: Unit) {
  // FE-like very simple formula
  const raw = attacker.atk - Math.floor(defender.def / 2)
  return Math.max(1, raw)
}

export function attack(attacker: Unit, defender: Unit) {
  const dmg = basicDamage(attacker, defender)
  defender.hp = Math.max(0, defender.hp - dmg)
  return dmg
}
