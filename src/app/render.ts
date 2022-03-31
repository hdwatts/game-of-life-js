import { grid, setup as setupWorld } from './world'
import { space } from "../core/keyboard"
import { UI } from './ui'

export const ui = new UI()

/**
 * After resources is loaded, setup your Game
 */
export async function setup() {
  setupWorld()
  ui.setup()
  space.on("down", () => {
    if (!running) {
      grid.nextGeneration()
      grid.drawGrid()
    }
  })
}

/**
 * Called for each Game tick
 */
export const setRunning = (val: boolean) => {
  running = val
}
export const setThreshold = (val: number) => {
  threshold = 100 - val
}
export let running = false
let lastUpdate = 0
export let threshold = 10
export async function update(time: number) {
  lastUpdate -= time
  if (running && lastUpdate < 0) {
    grid.nextGeneration()
    grid.drawGrid()
    lastUpdate = threshold
  }
}
