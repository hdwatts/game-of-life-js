import { grid, setup as setupWorld } from './world'
import { space } from "../core/keyboard"


/**
 * After resources is loaded, setup your Game
 */
export async function setup() {
  setupWorld()
  space.on("down", () => {
    grid.nextGeneration()
    grid.drawGrid()
  })
}

/**
 * Called for each Game tick
 */
export async function update() { }
