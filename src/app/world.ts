import Grid from "./grid"
import * as VIEWPORT from './viewport'

export const grid = new Grid()
export async function setup() {
    VIEWPORT.setup()
    grid.init()
    grid.drawGrid()
}
