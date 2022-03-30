import * as PIXI from "pixi.js"
import * as render from "./app/render"

async function setup() {
  await new Promise((resolve) => {
    PIXI.Loader.shared.add("assets/sprites/tile.png").load(resolve)
  })
  await render.setup()
}

setup().then(() => {
  PIXI.Ticker.shared.add(render.update, undefined, PIXI.UPDATE_PRIORITY.HIGH)
})
