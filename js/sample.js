
/**
 * @description This function implements a binary search algorithm to find an element
 * in an array. It takes in the array, the element to search for, and the indices of
 * the array where the search starts. The function first checks if the start index
 * is greater than the end index, and returns false if that's the case. Then, it
 * calculates the midpoint of the range [start, end] and compares the element at that
 * position with the searched element. If they match, the function returns true.
 * Otherwise, it recursively calls itself to search the left or right half of the
 * range, depending on whether the element at the midpoint is greater than or less
 * than the searched element, respectively.
 * 
 * @param { array } arr - The `arr` input parameter represents the array to be searched
 * for a specific value.
 * 
 * @param { any } x - The `x` input parameter is used to search for a specific value
 * within an array. It represents the value being searched for and is compared to the
 * values in the array to determine if it exists within the given range.
 * 
 * @param { integer } start - The `start` input parameter determines the index of the
 * subarray to search within. It is used to calculate the midpoint of the subarray
 * and to determine which half of the subarray to search in the recursive call.
 * 
 * @param { integer } end - The `end` parameter marks the upper bound of the search
 * interval, indicating the last index where the algorithm should search for the
 * target value. It helps to avoid unnecessary comparisons by limiting the search range.
 * 
 * @returns { array } The function returns `true` if the specified element `x` exists
 * in the array between `start` and `end`, inclusive. If `x` is found, the function
 * returns `true`. Otherwise, it recursively searches the left and right subarrays
 * until the end of the array is reached.
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
