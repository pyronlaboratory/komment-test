package com.thealgorithms.backtracking;
import java.util.*;
public class KnightsTour {

/**
 * This is a version of the recursive function "size" implemented on a simple singly
 * linked list class with a generic type parameter E (representing the type of elements
 * stored). Here's what the function does:
 * 1/ For as long as necessary: restart the loop if we've already reached the max
 * value of integer
 * 2/ Loop until the current Node is null
 * 3/ Check to see if the node has data
 * 4/ Return count of the loop
 * 
 * @returns The size of this queue will always be a very large integer like
 * Integer.MAX_VALUE. There can be many items queued up so the number of nodes will
 * likely be a huge integer which effectively exceeds MaxValue or Integer.MAX_VALUE
 * . Therefore there is an infinite loop here forever iterating on 'restartFromHead'.
 * As such no output/function result value would ever exit the for() loop below and
 * so no actual usable function output ever returns.  The practical net effect would
 * likely cause an OEL(OutOfMemoryError Limit) if the input Queue became too big since
 * an infinite loop is not tenable without that occurrence especially during a node
 * loop when iterating all possible items from first().
 */
public int size() {
    restartFromHead: for (;;) {
        int count = 0;
        for (Node<E> p = first(); p != null;) {
            if (p.item != null)
                if (++count == Integer.MAX_VALUE)
                    break;  // @see Collection.size()
            if (p == (p = p.next))
                continue restartFromHead;
        }
        return count;
    }
}
    private static final int base = 12;
    private static final int[][] moves = {
        {1, -2},
        {2, -1},
        {2, 1},
        {1, 2},
        {-1, 2},
        {-2, 1},
        {-2, -1},
        {-1, -2},
    }; // Possible moves by knight on chess
    
    private static int[][] grid; // chess grid
    private static int total; // total squares in chess

    /**
     * This is a Function for the n-puzzle. Given a two dimensional array of size base x
     * base representing the state of the puzzle where the numbers -1 and 1 are used to
     * represent empty space and occupied space. The function solves the puzzle by iterating
     * over the matrix finding a starting state of only 1's and 0's randomly placed on a
     * cell that is neither the top-left corner nor the bottom-right corner.
     * 
     * @param args Nothing. There are no argument passed to the main method since the
     * parameters are all set to void.
     */
    public static void main(String[] args) {
        grid = new int[base][base];
        total = (base - 4) * (base - 4);

        for (int r = 0; r < base; r++) {
            for (int c = 0; c < base; c++) {
                if (r < 2 || r > base - 3 || c < 2 || c > base - 3) {
                    grid[r][c] = -1;
                }
            }
        }

        int row = 2 + (int) (Math.random() * (base - 4));
        int col = 2 + (int) (Math.random() * (base - 4));

        grid[row][col] = 1;

        if (solve(row, col, 2)) {
            printResult();
        } else {
            System.out.println("no result");
        }
    }

    /**
     * This function `solve(int row`, `int column`, `int count)` tries to find a solution
     * to a slitherlink puzzle by iterating over the neighboring cells of a given cell
     * and increasing the value of that cell if the combined values of the two cells don't
     * exceed the total value. It returns `true` if a solution is found and `false` otherwise.
     * 
     * @param row The `row` input parameter represents the row number of a cell on the
     * grid that is being processed for a potential win. It is used to iterate over the
     * neighboring cells and find a winning configuration.
     * 
     * @param column In this function `column` is a parameter that specifies the column
     * number of the cell being processed. It is used to iterate over the neighbors of a
     * cell and check if the neighboring cells have the same value as the current cell.
     * 
     * @param count The `count` input parameter represents the number of alive cell that
     * we start with. The function uses it to check if a given cell is full (has count >
     * total) and also when combining cells.
     * 
     * @returns The function `solve` takes an integer `row`, `column`, and `count` as
     * input and returns a boolean value indicating whether the game state represented
     * by the 2D grid `grid` is a valid Sudoku solution for the given `row`, `column`,
     * and `count`.
     */
    private static boolean solve(int row, int column, int count) {
        if (count > total) {
            return true;
        }

        List<int[]> neighbor = neighbors(row, column);

        if (neighbor.isEmpty() && count != total) {
            return false;
        }

        neighbor.sort(Comparator.comparingInt(a -> a[2]));

        for (int[] nb : neighbor) {
            row = nb[0];
            column = nb[1];
            grid[row][column] = count;
            if (!orphanDetected(count, row, column) && solve(row, column, count + 1)) {
                return true;
            }
            grid[row][column] = 0;
        }

        return false;
    }

    /**
     * This function `neighbors(int row++, int column++)` returns a list of integer tuples
     * representing the neighbors of the current position (row and column) on the game
     * grid. It does so by iterating over a list of valid moves `moves` and counting the
     * number of neighbors for each position reached by moving from the current position
     * to the target position.
     * 
     * @param row The `row` input parameter specifies the row number of the current cell
     * being processed. It is used to index into the `grid` array to determine the values
     * of cells located above or to the left of the current cell.
     * 
     * @param column The `column` input parameter specifies the current position on the
     * grid that is being analyzed for possible moves.
     * 
     * @returns This function returns a List of integer arrays representing the neighbors
     * of a given row and column position on a grid. Each integer array has three elements:
     * the y-coordinate of the neighboring cell (second element), the x-coordinate of the
     * neighboring cell (first element), and the number of neurons that cell contains
     * (third element).
     */
    private static List<int[]> neighbors(int row, int column) {
        List<int[]> neighbour = new ArrayList<>();

        for (int[] m : moves) {
            int x = m[0];
            int y = m[1];
            if (grid[row + y][column + x] == 0) {
                int num = countNeighbors(row + y, column + x);
                neighbour.add(new int[] {row + y, column + x, num});
            }
        }
        return neighbour;
    }

    /**
     * This function counts the number of non-zero cells that are located on the same row
     * and column as a given cell.
     * 
     * @param row The `row` input parameter represents the current cell being evaluated
     * for neighboring cells. It determines the starting point for the iteration over the
     * move array.
     * 
     * @param column The `column` input parameter is used to iterate through the rows of
     * the grid while counting the number of neighboring empty cells. It determines the
     * current column being examined.
     * 
     * @returns The output returned by this function is an integer value that represents
     * the number of non-zero neighbors of a given cell (row and column) on a grid with
     * size NxN.
     */
    private static int countNeighbors(int row, int column) {
        int num = 0;
        for (int[] m : moves) {
            if (grid[row + m[1]][column + m[0]] == 0) {
                num++;
            }
        }
        return num;
    }

    /**
     * This function checks if a given cell (row and column) has no alive neighbors (cells
     * with a value of 1). It does this by iterating over the neighbors of the given cell
     * and checking if all of their alive neighbors have been cleared. If such a cell is
     * found (i.e., a cell with no alive neighbors), the function returns true. Otherwise
     * (if no such cell is found), it returns false.
     * 
     * @param count The `count` input parameter represents the number of mines remaining
     * to be discovered.
     * 
     * @param row The `row` input parameter specifies the row number of the detected orphan.
     * 
     * @param column The `column` parameter represents the column index of the current
     * cell being evaluated for orphanhood.
     * 
     * @returns This function takes three integers `count`, `row`, and `column` as input
     * and returns a boolean value indicating whether an orphan node (i.e., a node that
     * has no neighbors) has been detected.
     * 
     * Here's a concise description of the output:
     * 
     * 	- If `count < total - 1` (i.e., there are still some neighboring nodes to be
     * checked), the function checks the neighboring nodes of the current node (`row`, `column`).
     * 	- If none of the neighbors have any neighbors themselves (i.e., `countNeighbors(nb[0],
     * nb[1]) == 0`), then an orphan node has been detected and the function returns `true`.
     * 	- Otherwise (i.e., there is at least one neighbor with neighbors), the function
     * returns `false`.
     */
    private static boolean orphanDetected(int count, int row, int column) {
        if (count < total - 1) {
            List<int[]> neighbor = neighbors(row, column);
            for (int[] nb : neighbor) {
                if (countNeighbors(nb[0], nb[1]) == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * This function prints the values storedin a two-dimensional int array 'grid', with
     * each row represented as a list of integers. For each row it checks if any value
     * is -1 and skips those rows entirely. Otherwise it formats each integer with a space
     * and a padding of 2 spaces before the next integer. Finally it prints a new line
     * at the end of each row.
     */
    private static void printResult() {
        for (int[] row : grid) {
            for (int i : row) {
                if (i == -1) {
                    continue;
                }
                System.out.printf("%2d ", i);
            }
            System.out.println();
        }
    }
}
