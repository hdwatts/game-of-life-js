import * as PIXI from "pixi.js"
import * as game from "../core/game"
import { Viewport } from "pixi-viewport"
import { Cell } from "./cell"
import Grid from "./grid"
import { space } from "../core/keyboard"

const grid = new Grid()

const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: 5000,
  worldHeight: 5000,
  interaction: game.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

// add the viewport to the stage
game.app.stage.addChild(viewport)

// activate plugins
viewport.drag({ mouseButtons: "right" }).pinch().wheel().clampZoom({
  minWidth: 5000,
  maxWidth: 50000,
})

/**
 * After resources is loaded, setup your Game
 */
export async function setup() {
  const cellTexture = PIXI.Texture.from("assets/sprites/tile.png")

  const tilingSprite = new PIXI.TilingSprite(cellTexture)
  tilingSprite.x = Math.round(viewport.corner.x / 100) * 100
  tilingSprite.y = Math.round(viewport.corner.y / 100) * 100
  tilingSprite.width = viewport.worldScreenWidth
  tilingSprite.height = viewport.worldScreenHeight
  const resizeSprite = () => {
    setTimeout(() => {
      const { x, y } = viewport.corner
      const { worldScreenWidth: width, worldScreenHeight: height } = viewport
      const xMultiplier = x > 0 ? -2 : 2
      const yMultiplier = y > 0 ? -2 : 2
      console.log(x, y)
      tilingSprite.x = Math.round((x - width / 2 - 100) / 100) * 100
      tilingSprite.y = Math.round((y - height / 2 - 100) / 100) * 100
      console.log(tilingSprite.x, tilingSprite.y)
      tilingSprite.width = width * 2
      tilingSprite.height = height * 2
    }, 0)
  }

  viewport.on("zoomed", resizeSprite)
  viewport.on("drag-end", resizeSprite)
  viewport.addChild(tilingSprite)
  grid.init()

  space.on("down", () => {
    grid.nextGeneration()
    drawGrid()
  })
  drawGrid()
}

const drawBox = (x: number, y: number) => {
  const name = `${x},${y}`
  let child = viewport.getChildByName(name) as PIXI.Sprite
  if (!child) {
    child = viewport.addChild(
      new PIXI.Sprite(PIXI.Texture.WHITE)
    ) as PIXI.Sprite
  }
  child.name = name
  child.tint = 0xff0000
  child.width = Cell.size
  child.height = Cell.size
  child.position.set(x * Cell.size, y * Cell.size)
}
const destroyBox = (x: number, y: number) => {
  viewport.getChildByName(`${x},${y}`)?.destroy()
}

const drawGrid = () => {
  const state = grid.actualState || []
  const redrawList = grid.redrawList || []
  console.log(redrawList)
  for (let i = 0; i < redrawList.length; i++) {
    const x = redrawList[i][0]
    const y = redrawList[i][1]
    if (redrawList[i][2] === 1) {
      drawBox(x, y)
      // this.canvas.changeCelltoAlive(x, y)
    } else if (redrawList[i][2] === 2) {
      // this.canvas.keepCellAlive(x, y)
    } else {
      destroyBox(x, y)
    }
  }
  /*
  const topState = get(state, 0) || []
  const bottomState = get(state, state.length - 1) || []

  const minY = Math.min(get(topState, 0) || 0, 0)
  const maxY = Math.max(get(bottomState, 0) || 0, 200)
  const minX = Math.min(
    state.reduce((acc, row) => Math.min(acc, row[1]), get(topState, 1) || 0),
    0
  )
  const maxX = Math.max(
    state.reduce(
      (acc, row) => Math.max(acc, get(row, row.length - 1) || 0),
      get(topState, topState.length - 1) || 0
    ), 
    200
  )
  */
}

/**
 * Called for each Game tick
 */
export async function update() {}

const addCell = ({ world }: { world: PIXI.IPointData }): void => {
  const { x: xWorld, y: yWorld } = world
  const x = xWorld / Cell.size
  const y = yWorld / Cell.size
  const gridX =
    x > 0 ? Math.floor(xWorld / Cell.size) : Math.floor(xWorld / Cell.size)
  const gridY =
    y > 0 ? Math.floor(yWorld / Cell.size) : Math.floor(yWorld / Cell.size)
  console.log(`Adding cell at ${gridX}, ${gridY}`)
  if (grid.isAlive(gridX, gridY)) {
    grid.removeCell(gridX, gridY, grid.actualState)
    destroyBox(gridX, gridY)
  } else {
    grid.addCell(gridX, gridY, grid.actualState)
    drawBox(gridX, gridY)
  }
  drawGrid()
}

viewport.on("clicked", addCell)
