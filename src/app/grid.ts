type GridState = [number, number][]
type RedrawList = [number, number, number][]
type DeadNeighbours = { [key: string]: number }
export default class Grid {
  actualState: GridState
  redrawList: RedrawList
  topPointer: number
  middlePointer: number
  bottomPointer: number

  constructor() {
    this.actualState = []
    this.redrawList = []
    this.topPointer = 1
    this.middlePointer = 1
    this.bottomPointer = 1
  }

  //
  // Reset the grid
  init() {
    this.actualState = []
  }
  nextGeneration() {
    let alive = 0
    const allDeadNeighbours: DeadNeighbours = {}
    const newState: GridState = []

    this.redrawList = []

    for (let i = 0; i < this.actualState.length; i++) {
      this.topPointer = 1
      this.bottomPointer = 1

      for (let j = 1; j < this.actualState[i].length; j++) {
        const x = this.actualState[i][j]
        const y = this.actualState[i][0]

        // Possible dead neighbours
        const deadNeighbours: [number, number, number][] = [
          [x - 1, y - 1, 1],
          [x, y - 1, 1],
          [x + 1, y - 1, 1],
          [x - 1, y, 1],
          [x + 1, y, 1],
          [x - 1, y + 1, 1],
          [x, y + 1, 1],
          [x + 1, y + 1, 1],
        ]

        // Get number of live neighbours and remove alive neighbours from deadNeighbours
        const neighbours = this.getNeighboursFromAlive(x, y, i, deadNeighbours)

        // Join dead neighbours to check list
        for (let m = 0; m < 8; m++) {
          if (deadNeighbours[m] !== undefined) {
            const key = deadNeighbours[m][0] + "," + deadNeighbours[m][1] // Create hashtable key

            if (allDeadNeighbours[key] === undefined) {
              allDeadNeighbours[key] = 1
            } else {
              allDeadNeighbours[key]++
            }
          }
        }

        if (!(neighbours === 0 || neighbours === 1 || neighbours > 3)) {
          this.addCell(x, y, newState)
          alive++
          this.redrawList.push([x, y, 2]) // Keep alive
        } else {
          this.redrawList.push([x, y, 0]) // Kill cell
        }
      }
    }

    // Process dead neighbours
    for (const key in allDeadNeighbours) {
      if (allDeadNeighbours[key] === 3) {
        // Add new Cell
        const coords = key.split(",")
        const t1 = parseInt(coords[0], 10)
        const t2 = parseInt(coords[1], 10)

        this.addCell(t1, t2, newState)
        alive++
        this.redrawList.push([t1, t2, 1])
      }
    }

    this.actualState = newState

    return alive
  }

  getNeighboursFromAlive(
    x: number,
    y: number,
    i: number,
    possibleNeighboursList: [number, number, number][] | undefined[]
  ) {
    var neighbours = 0,
      k

    // Top
    if (this.actualState[i - 1] !== undefined) {
      if (this.actualState[i - 1][0] === y - 1) {
        for (k = this.topPointer; k < this.actualState[i - 1].length; k++) {
          if (this.actualState[i - 1][k] >= x - 1) {
            if (this.actualState[i - 1][k] === x - 1) {
              possibleNeighboursList[0] = undefined
              this.topPointer = k + 1
              neighbours++
            }

            if (this.actualState[i - 1][k] === x) {
              possibleNeighboursList[1] = undefined
              this.topPointer = k
              neighbours++
            }

            if (this.actualState[i - 1][k] === x + 1) {
              possibleNeighboursList[2] = undefined

              if (k == 1) {
                this.topPointer = 1
              } else {
                this.topPointer = k - 1
              }

              neighbours++
            }

            if (this.actualState[i - 1][k] > x + 1) {
              break
            }
          }
        }
      }
    }

    // Middle
    for (k = 1; k < this.actualState[i].length; k++) {
      if (this.actualState[i][k] >= x - 1) {
        if (this.actualState[i][k] === x - 1) {
          possibleNeighboursList[3] = undefined
          neighbours++
        }

        if (this.actualState[i][k] === x + 1) {
          possibleNeighboursList[4] = undefined
          neighbours++
        }

        if (this.actualState[i][k] > x + 1) {
          break
        }
      }
    }

    // Bottom
    if (this.actualState[i + 1] !== undefined) {
      if (this.actualState[i + 1][0] === y + 1) {
        for (k = this.bottomPointer; k < this.actualState[i + 1].length; k++) {
          if (this.actualState[i + 1][k] >= x - 1) {
            if (this.actualState[i + 1][k] === x - 1) {
              possibleNeighboursList[5] = undefined
              this.bottomPointer = k + 1
              neighbours++
            }

            if (this.actualState[i + 1][k] === x) {
              possibleNeighboursList[6] = undefined
              this.bottomPointer = k
              neighbours++
            }

            if (this.actualState[i + 1][k] === x + 1) {
              possibleNeighboursList[7] = undefined

              if (k == 1) {
                this.bottomPointer = 1
              } else {
                this.bottomPointer = k - 1
              }

              neighbours++
            }

            if (this.actualState[i + 1][k] > x + 1) {
              break
            }
          }
        }
      }
    }

    return neighbours
  }

  addCell(x: number, y: number, state: GridState) {
    if (state.length === 0) {
      state.push([y, x])
      return
    }

    if (y < state[0][0]) {
      // Add to Head
      let newState: [number, number][] = [[y, x]]
      for (let k = 0; k < state.length; k++) {
        newState[k + 1] = state[k]
      }

      for (let k = 0; k < newState.length; k++) {
        state[k] = newState[k]
      }

      return
    } else if (y > state[state.length - 1][0]) {
      // Add to Tail
      state[state.length] = [y, x]
      return
    } else {
      // Add to Middle

      for (let n = 0; n < state.length; n++) {
        if (state[n][0] === y) {
          // Level Exists
          const tempRow: number[] = []
          let added = false
          for (let m = 1; m < state[n].length; m++) {
            if (!added && x < state[n][m]) {
              tempRow.push(x)
              added = !added
            }
            tempRow.push(state[n][m])
          }
          tempRow.unshift(y)
          if (!added) {
            tempRow.push(x)
          }
          state[n] = tempRow as [number, number]
          return
        }

        if (y < state[n][0]) {
          // Create Level
          let newState: [number, number][] = []
          for (let k = 0; k < state.length; k++) {
            if (k === n) {
              newState[k] = [y, x]
              newState[k + 1] = state[k]
            } else if (k < n) {
              newState[k] = state[k]
            } else if (k > n) {
              newState[k + 1] = state[k]
            }
          }

          for (let k = 0; k < newState.length; k++) {
            state[k] = newState[k]
          }

          return
        }
      }
    }
  }

  removeCell(x: number, y: number, state: GridState) {
    for (let i = 0; i < state.length; i++) {
      if (state[i][0] === y) {
        if (state[i].length === 2) {
          // Remove all Row
          state.splice(i, 1)
        } else {
          // Remove Element
          for (let j = 1; j < state[i].length; j++) {
            if (state[i][j] === x) {
              state[i].splice(j, 1)
            }
          }
        }
      }
    }
  }

  isAlive(x: number, y: number) {
    for (let i = 0; i < this.actualState.length; i++) {
      if (this.actualState[i][0] === y) {
        for (let j = 1; j < this.actualState[i].length; j++) {
          if (this.actualState[i][j] === x) {
            return true
          }
        }
      }
    }
    return false
  }
}
