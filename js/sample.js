
/**
 * @description SEARCH
 * The given function searches an array for a specific value and returns true if it
 * finds one. If the search is unsuccessful then false will be returned. The function
 * first calculates the midpoint of the specified range (start and end). Then it
 * determines which subrange contains the desired element by comparing its current
 * position to the element at that point; it proceeds accordingly to continue narrowing
 * the search space.
 * 
 * @param { array } arr - The input parameter "arr" is the array that is being searched.
 * 
 * @param {  } x - X is the element being searched for within the array passed into
 * this function.
 * 
 * @param { number } start - Searches the beginning half of the array.
 * 
 * @param { number } end - End is the last index of arr where element is not equal
 * to x.
 * 
 * @returns { boolean } Searches the array for the given value using the midpoint of
 * the range defined by start and end as a pivot. If the array has multiple occurrences
 * or no occurrences of the value at all within the specified range. it returns false
 * otherwise it recursively continues until the condition is met within the searched
 * range of array.
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
 * @description retrieves the value of an AppID  based on an application name within
 * a CSV file
 * 
 * @returns { string } The function takes a parameter "sysparm_appName" and logs its
 * value as "appid". It then retrieves the AppID from a GlideRecord object using the
 * parameter value and returns the AppID as a string.
 * 
 * The output returned by the function is the AppID as a string.
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
