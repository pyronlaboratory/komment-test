/**
* @description The function `newGeneration` takes an array of arrays (representing
* the current generation of cells) and generates the next generation of cells based
* on the number of living neighbors each cell has. Cells that are alive and have a
* certain number of living neighbors (2 or 3) are kept alive and assigned a value
* of 1. Otherwise they are declared dead and assigned a value of 0.
* 
* @param { array } cells - The `cells` input parameter is an array of arrays
* representing the current generation of cells. Each sub-array within the main `cells`
* array represents a single cell and contains two values (0 or 1) representing its
* current state (alive or dead). The function uses this input to generate the next
* generation of cells based on the rules of Conway's Game of Life.
* 
* @returns { array } The function `newGeneration` takes a 2D array of cells as input
* and returns a new generation of cells based on the previous one. The output is a
* new 2D array with the same dimensions as the input array. Each element of the new
* array represents the state of a single cell (alive or dead) based on the number
* of living neighbors it has.
* 
* In brief:
* 
* 	- If a cell is alive and has 2 or 3 living neighbors (excluding the cell itself),
* it remains alive.
* 	- If a cell is dead and has 3 living neighbors (including the cell itself), it
* becomes alive.
* 	- All other cells become dead or remain dead.
*/
export function newGeneration(cells) {
  const nextGeneration = []
  for (let i = 0; i < cells.length; i++) {
    const nextGenerationRow = []
    for (let j = 0; j < cells[i].length; j++) {
      // Get the number of living neighbours
      let neighbourCount = 0
      if (i > 0 && j > 0) neighbourCount += cells[i - 1][j - 1]
      if (i > 0) neighbourCount += cells[i - 1][j]
      if (i > 0 && j < cells[i].length - 1)
        neighbourCount += cells[i - 1][j + 1]
      if (j > 0) neighbourCount += cells[i][j - 1]
      if (j < cells[i].length - 1) neighbourCount += cells[i][j + 1]
      if (i < cells.length - 1 && j > 0) neighbourCount += cells[i + 1][j - 1]
      if (i < cells.length - 1) neighbourCount += cells[i + 1][j]
      if (i < cells.length - 1 && j < cells[i].length - 1)
        neighbourCount += cells[i + 1][j + 1]

      // Decide whether the cell is alive or dead
      const alive = cells[i][j] === 1

      const cellIsAlive =
        (alive && neighbourCount >= 2 && neighbourCount <= 3) ||
        (!alive && neighbourCount === 3)

      nextGenerationRow.push(cellIsAlive ? 1 : 0)
    }
    nextGeneration.push(nextGenerationRow)
  }
  return nextGeneration
}
