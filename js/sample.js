
/**
 * @description This is a recursive function that searches an array for a specific
 * value x using a divide-and-conquer approach. Given an array arr and three parameters
 * x start and end (which define the target value and the range to search respectively)
 * , it returns true if the value is found within the range and false otherwise
 * 
 * @param { array } arr - The `arr` parameter is passed by the caller of the `search`
 * function and contains an array of elements to search through. The function uses
 * this array to find the specified `x`.
 * 
 * @param { array } x - The `x` input parameter represents the value to search for
 * within the array. It is passed as an argument to the `search` function and is used
 * to determine whether a given element of the array is equal to or less than the `x`
 * value being searched for.
 * 
 * @param { number } start - The "start" parameter determines the beginning index of
 * the portion of the array to be searched for "x". The function then divides that
 * section into two parts: one containing elements less than "x", and another with
 * elements greater than it.
 * 
 * @param { number } end - The `end` parameter specifies the end index of the slice
 * of the array to be searched. The function recursively divides the array into two
 * parts and checks if `x` is present within either of those partitions. This continues
 * until a truthy return value is found or it is established that `x` cannot be located
 * within the given slice of the array. `end` effectively determines where to cut the
 * middle of the division and ensures that no indices outside the original array are
 * checked.
 * 
 * @returns { boolean } This function takes an array of integers and a target integer
 * `x` as inputs. It performs a linear search on the array to determine whether `x`
 * exists within the array or not.
 * 
 * The function returns a boolean value indicating whether `x` was found within the
 * array or not. If `x` is found at index `mid`, the function returns `true`. If `x`
 * is not found within the array or if `start > end`, the function returns `false`.
 * 
 * In the cases where `x` is found neither at the starting point nor at the middle
 * point of the search range (i.e. `mid - 1` or `mid + 1`), the function recursively
 * calls itself with the appropriate start and end points for the next iteration of
 * the search.
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
