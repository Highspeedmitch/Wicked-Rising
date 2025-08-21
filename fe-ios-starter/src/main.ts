//
//  main.ts
//  
//
//  Created by Mitch Furrier on 8/21/25.
//

import Phaser from 'phaser'
import GameScene from './scenes/GameScene'

const width = 672, height = 480 // fits 14×10×48px grid

new Phaser.Game({
  type: Phaser.AUTO,
  width,
  height,
  parent: 'app',
  backgroundColor: '#0b1020',
  scene: [GameScene],
  render: { pixelArt: true },
  physics: { default: 'arcade' }
})
