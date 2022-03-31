import * as PIXI from "pixi.js"
import * as render from "./app/render"

async function setup() {
  await new Promise((resolve) => {
    PIXI.Loader.shared.add("assets/sprites/tile.png").load(resolve)
  })
  await render.setup()
}

setup().then(() => {
  PIXI.Ticker.shared.add((time) => {
    render.update(time)
  }, undefined, PIXI.UPDATE_PRIORITY.HIGH)
})
