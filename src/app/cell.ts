import * as VIEWPORT from './viewport'
import * as PIXI from 'pixi.js'
import * as game from '../core/game'
import { FillStyle, Graphics } from 'pixi.js'
import { group } from 'console'
const graphics = new Graphics()
export const Cell = {
  setup: () => {
  },
  SIZE: 100,
  renderCellAt: (x: number, y: number) => {
    VIEWPORT.graphics.beginFill(0xff0000)
    VIEWPORT.graphics.drawRect(x * Cell.SIZE, y * Cell.SIZE, Cell.SIZE, Cell.SIZE)
    VIEWPORT.graphics.endFill()
  },
  stableCellAt: (x: number, y: number) => {
    VIEWPORT.graphics.beginFill(0xcc0000)
    VIEWPORT.graphics.drawRect(x * Cell.SIZE, y * Cell.SIZE, Cell.SIZE, Cell.SIZE)
    VIEWPORT.graphics.endFill()
  },
  destroyCellAt: (x: number, y: number) => {
    let color = 0x7F7F7F
    if ((x % 2 == 0 && y % 2 != 0) || (x % 2 != 0 && y % 2 == 0)) {
      color = 0xC3C3C3
    }
    VIEWPORT.graphics.beginFill(color)
    VIEWPORT.graphics.drawRect(x * Cell.SIZE, y * Cell.SIZE, Cell.SIZE, Cell.SIZE)
    VIEWPORT.graphics.endFill()
  }
}
