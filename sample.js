/**
* @description The function newGeneration(cells) creates a new generation of living
* cells based on the current generation and their neighbors. It returns an array of
* rows where each row is composed of living (1) or dead (0) cells.
* 
* @param { array } cells - Here's the answer:
* 
* Cells are used as the input to this function and are iterated upon using a "for"
* loop with two nested loops. The generated next generation is then returned as an
* array of rows where each row has the same length as the cells parameter.
* 
* @returns { array } The output returned by this function is an array of rows
* representing the next generation of a two-dimensional grid of living cells where
* alive cells have a value of 1 and dead cells have a value of 0 based on the neighbor
* count.
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
