import * as VIEWPORT from './viewport'
import * as PIXI from 'pixi.js'
export const Cell = {
  SIZE: 100,
  renderCellAt: (x: number, y: number) => {
    const name = `${x},${y}`
    let child = VIEWPORT.viewport.getChildByName(name) as PIXI.Sprite
    if (!child) {
      child = VIEWPORT.viewport.addChild(
        new PIXI.Sprite(PIXI.Texture.WHITE)
      ) as PIXI.Sprite
    }
    child.name = name
    child.tint = 0xff0000
    child.width = Cell.SIZE
    child.height = Cell.SIZE
    child.position.set(x * Cell.SIZE, y * Cell.SIZE)
  },
  stableCellAt: (x: number, y: number) => {
    const name = `${x},${y}`
    let child = VIEWPORT.viewport.getChildByName(name) as PIXI.Sprite
    child.tint = 0xcc0000
  },
  destroyCellAt: (x: number, y: number) => {
    VIEWPORT.viewport.getChildByName(`${x},${y}`)?.destroy()
  }
}
