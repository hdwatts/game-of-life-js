import * as PIXI from "pixi.js"

export const app = new PIXI.Application({
  resizeTo: window,
})

export const mouse: PIXI.Point = app.renderer.plugins.interaction.mouse.global

document.body.appendChild(app.view)