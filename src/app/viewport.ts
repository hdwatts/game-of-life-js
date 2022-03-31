import * as PIXI from "pixi.js"
import * as game from "../core/game"
import { Viewport } from "pixi-viewport"
import { Cell } from "./cell"
import { grid } from './world'
import { running, ui } from "./render"

export const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 5000,
    worldHeight: 5000,
    interaction: game.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

export const graphics = new PIXI.Graphics()

game.app.stage.addChild(viewport)

viewport.drag({ mouseButtons: "right" }).pinch().wheel().clampZoom({
    minWidth: 5000,
    maxWidth: 50000,
})

export async function setup() {
    const cellTexture = PIXI.Texture.from("assets/sprites/tile.png")
    viewport.x = 0
    viewport.y = 0
    const tilingSprite = new PIXI.TilingSprite(cellTexture)

    resizeSprite(tilingSprite)

    viewport.on("zoomed", (e: PIXI.InteractionEvent) => {
        resizeSprite(tilingSprite)
    })
    viewport.on("drag-end", () => resizeSprite(tilingSprite))
    viewport.addChild(tilingSprite)
    viewport.addChild(graphics)
}

const resizeSprite = (tilingSprite: PIXI.TilingSprite) => {
    setTimeout(() => {
        const { x, y } = viewport.corner
        const { worldScreenWidth: width, worldScreenHeight: height } = viewport
        const baseX = Math.round((x - width) / 100) * 100
        tilingSprite.x = baseX - baseX % 200
        const baseY = Math.round((y - height) / 100) * 100
        tilingSprite.y = baseY - baseY % 200
        tilingSprite.width = width * 3
        tilingSprite.height = height * 3
    }, 0)
}

export const globalToGridCoords = (xGlobal: number, yGlobal: number) => {
    const { x, y } = viewport.toWorld(xGlobal, yGlobal)
    return worldToGridCoords(x, y)
}

export const worldToGridCoords = (xWorld: number, yWorld: number) => {
    const x = xWorld / Cell.SIZE
    const y = yWorld / Cell.SIZE
    const gridX =
        x > 0 ? Math.floor(xWorld / Cell.SIZE) : Math.floor(xWorld / Cell.SIZE)
    const gridY =
        y > 0 ? Math.floor(yWorld / Cell.SIZE) : Math.floor(yWorld / Cell.SIZE)
    return [gridX, gridY]
}

export let dragging = false
let currentDragCell: number[] = []
viewport.on("mousedown", (e: PIXI.InteractionEvent) => {
    const [x, y] = globalToGridCoords(e.data.global.x, e.data.global.y)
    dragging = true
    currentDragCell = [x, y]
    if (!running) {
        grid.updateGridAt(x, y)
    }
})
viewport.on("mousemove", (e) => {
    if (dragging && !running) {
        const [x, y] = globalToGridCoords(e.data.global.x, e.data.global.y)
        if (x !== currentDragCell[0] && y !== currentDragCell[1]) {
            currentDragCell = [x, y]
            grid.updateGridAt(x, y)
        }
    }
})
viewport.on("mouseup", () => dragging = false)