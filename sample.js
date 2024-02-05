/**
* @description The function newGeneration takes an array of arrays representing a
* population of cells as input and returns an updated generation of the same population
* based on the rules of a simple life-like cellular automata. The function calculates
* the number of living neighbors for each cell and updates its state based on those
* neighbors.
* 
* @param { array } cells - Certainly. Here is the answer to your question:
* 
* The `cells` input parameter provides a two-dimensional array of integer values
* that represents the state of the Game of Life world to be evolved by the function.
* Each integer value indicates whether the cell is alive (1) or dead (0). The function
* processes each cell's state and the states of its neighbors to determine the next
* generation of cells.
* 
* @returns { array } The output returned by this function is an array of rows
* consisting solely of two elements with a value of 1 or 0 only if the neighbouring
* cell conditions are met; otherwise all cells will have a value of 0.
*/
export function newGeneration(cells) {
  const nextGeneration = []
  for (let i = 0; i < cells.length; i++) {
    const nextGenerationRow = []
    for (let j = 0; j < cells[i].length; j++) {
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
