/**
 * @description Searches for an element 'x' within a specified portion of an array
 * 'arr' between elements at indices 'start' and 'end', using a binary search technique
 * with pivot point as 'mid'. Returns 'true' if the element is found and 'false' otherwise.
 * 
 * @param { array } arr - The array to be searched is passed as the `arr` parameter.
 * 
 * @param { number } x - SEARCHES FOR AN ELEMENT.
 * 
 * @param { number } start - searches the starting index of the array.
 * 
 * @param {  } end - Searches the rest of the array starting at mid+1.
 * 
 * @returns { boolean } The function takes four parameters: an array `arr`, a value
 * `x`, a starting index `start`, and an ending index `end`. If the starting index
 * exceeds the ending index it returns false otherwise it uses the floor method to
 * find the mid point of the search interval by dividing start and end. It checks if
 * the element at that position is equal to the given x then it returns true else if
 * its greater it returns a function that searches till the middle point is found.
 * Similarly if its less than `x` it recursively calls this function from the index
 * mid+1 towards ending point . The output returned by this function would be either
 * true or false as it indicates if element 'x' exists at any position within arr 
 * between the start and end indices inclusive.
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
