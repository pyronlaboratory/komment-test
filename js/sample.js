
/**
 * @description This function implements a binary search algorithm to find an element
 * `x` in an array `arr`. It takes four parameters: `arr`, `x`, `start`, and `end`.
 * The function first checks if the `start` index is greater than the `end` index,
 * and returns `false` if so. Then, it calculates the middle index of the array using
 * `Math.floor((start + end) / 2)`. If the element at the middle index is equal to
 * `x`, the function returns `true`. Otherwise, it recursively calls itself with the
 * `start` index increased by 1 and the `end` index decreased by 1, and vice versa,
 * until the element is found or it is determined that the element is not in the array.
 * 
 * @param { array } arr - The `arr` input parameter represents the array being searched
 * for the specified value `x`.
 * 
 * @param { any } x - The `x` input parameter represents the value being searched for
 * in the array.
 * 
 * @param { integer } start - Start is a parameter that ensures the search starts at
 * the correct position in the array. If the start index is greater than the end
 * index, the function returns false, indicating that the element cannot be found.
 * 
 * @param { integer } end - The `end` parameter in the provided function indicates
 * the index of the last element to be searched within the array. It serves as a bound
 * for the search operation, ensuring that the algorithm doesn't traverse an empty
 * array or exceed the desired range.
 * 
 * @returns { array } The function returns `true` if the element `x` exists in the
 * array between `start` and `end`, inclusive. If it doesn't exist, it returns the
 * result of calling `search(arr, x, start, mid - 1)` or `search(arr, x, mid + 1,
 * end)`, depending on whether the element is found to the left or right of the current
 * position.
 */
const search = (arr, x, start, end) => {
  if (start > end) return false;
  let mid = Math.floor((start + end) / 2);
  if (arr[mid] === x) return true;
  if (arr[mid] > x) {
    return search(arr, x, start, mid - 1);
  } else {
    return search(arr, x, mid + 1, end);
  }
};


const getApplicationID = () => {
  var appID = "";
  gs.log("appid: " + this.getParameter("sysparm_appName"), "pipeline");
  var grAppID = new GlideRecord("cmdb_ci_business_app");
  if (grAppID.get(this.getParameter("sysparm_appname"))) {
    appID = grAppID.number.toString();
    gs.log("appid: " + appID, "pipeline");
  }
 return appID;
}

/**
* @description This function implements a simple iterative cellular automaton ruleset
* where living cells (value of 1) survive with 2-3 living neighbors and die otherwise.
* Dead cells turn into living cells if all eight adjacent cells are living. The
* function takes an array of arrays representing the initial grid of cells and returns
* the next generation of cells.
* 
* @param { array } cells - The `cells` input parameter is an array of arrays
* representing a 2D grid of binary cells (0s and 1s). The function takes this array
* as input and generates the next generation of the grid based on the current one.
* 
* @returns { array } The output returned by this function is an array of arrays
* representing the next generation of a binary cellular automaton. Each element of
* the output array represents a single row of the grid and contains Boolean values
* (0 or 1) indicating whether each cell is alive (1) or dead (0). The cells are
* evaluated based on their current state and the states of their neighboring cells
* using a set of rules similar to Conway's Game of Life.
*/
function newGeneration(cells) {
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
