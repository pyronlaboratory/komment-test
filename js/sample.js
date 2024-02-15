
/**
 * @description This function implements a binary search algorithm that finds an
 * element 'x' within an array of integers 'arr' within the specified range (start
 * -> end) based on their value and returns true if it exists or false otherwise.
 * 
 * @param { array } arr - Here's the answer:  The `arr` input parameter is passed by
 * reference and serves as the array to search.
 * 
 * @param { any } x - The `x` input parameter represents the value being searched for
 * within the array of integers. This function uses this value to determine whether
 * a matching element exists within the array and to narrow down the search space if
 * a partial match is found.
 * 
 * @param { number } start - The "start" parameter of the "search" function is a key
 * integer value that determines which position from an array we search next. If true
 * is returned from a recursive call (mid-1) or mid+1 then the value will move toward
 * the beginning or end respectively as there is not a correct answer there but that
 * subarray does have valid integers at both ends of a partitioned portion so narrowing
 * it down continues until "end" is reached
 * 
 * @param { number } end - The `end` input parameter defines the end index of the
 * range of array elements to be searched. It determines how far the search continues
 * until a match or no match is found. In essence: the higher the `end` value is set
 * compared to the `start` parameter :the larger the segment of the array being
 * searched for the target element becomes; thus more iterations may occur before
 * `end` is reached than before `start`.
 * 
 * @returns { boolean } This is a recursive binary search function that takes an array
 * and three parameters: arr - the array to be searched; x-the value to be found and
 * start and end-the boundaries of the search space. If (start>end), indicating there
 * are no possible values of the array between start and end which return false(an
 * integer number).The other wise , mid is calculate by using mathematical floor
 * ((start+end)/2); which would lead us to the middle point if x and mid. When their
 * values matched that returns true if  the middle value arr[mid]==x or start point
 * less than x less then the search space mid -1 when middle is greater and returns
 * function call recurrently (start is move towards the left), (mid+1 to the right),
 * till first finding the correct position.
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
