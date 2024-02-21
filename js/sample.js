
/**
 * @description This function implements a binary search algorithm to find an element
 * `x` in an array `arr`. It takes in the array, the starting index `start`, and the
 * ending index `end` as inputs. The function first checks if the provided `start`
 * index is greater than `end`, and returns `false` if it is. Then, it calculates the
 * midpoint of the range between `start` and `end` using `Math.floor((start + end) /
 * 2)`. If the element at the midpoint is equal to `x`, the function returns `true`.
 * Otherwise, the function recursively calls itself on the left and right subarrays,
 * respectively.
 * 
 * @param { array } arr - The `arr` input parameter represents the array being searched
 * for a specific element.
 * 
 * @param { any } x - The `x` input parameter is used to search for a specific value
 * within an array. It represents the value being searched for and is compared to the
 * values in the array to determine if it exists within the specified range.
 * 
 * @param { integer } start - The `start` input parameter determines the index of the
 * left and right subarrays to search within the original array. It ensures that the
 * search is performed on a subset of the original array rather than the entire array,
 * thereby reducing the time complexity from O(n) to O(n/2) in the worst case.
 * 
 * @param { array } end - The `end` parameter serves as a bounds check for the search
 * operation. It ensures that the algorithm doesn't exceed the bound of the array
 * being searched, avoiding any unnecessary or incorrect results.
 * 
 * @returns { boolean } The function returns `true` if the target element `x` exists
 * in the array between `start` and `end`, inclusive. If `start` is greater than
 * `end`, the function returns `false`.
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


/**
 * @description This function retrieves the ID of a business application based on a
 * parameter passed through a system. If the parameter is not found or empty, the
 * function returns an empty string. It logs the retrieved ID to a pipeline for logging
 * purposes.
 * 
 * @returns { string } The function returns the application ID based on the parameter
 * passed in the URL. If the parameter is present, it retrieves the application ID
 * from the database using the `cmdb_ci_business_app` table. If the parameter is not
 * present, the function returns an empty string.
 */
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
