package com.thealgorithms.backtracking;
import java.util.*;
public class KnightsTour {
/**
 * This function is a custom implementation of the `size()` method for a doubly linked
 * list class. It iterates through the list using a for-each loop and keeps track of
 * the number of nodes found. The loop exits when the end of the list is reached or
 * when the count reaches `Integer.MAX_VALUE`. The function returns the count of nodes
 * found.
 * 
 * @returns The function is implementing the `size()` method of an interface. It
 * returns the number of elements contained within a linked list. In particular:
 * 
 * 	- `first()` refers to the "head" (i.e., the first node) of the list.
 * 	- `p.item != null` checks whether each node contains an item or not; if it does
 * then it adds 1 to `count`.
 * 	- `++count == Integer.MAX_VALUE` is true only if `count` is equal to `Integer.MAX_VALUE`,
 * at which point the loop exits early and returns `count`.
 * 	- `if (p == (p = p.next)) continue restartFromHead;` moves the "cursor" `p` to
 * the next node; if `p` points to the end of the list (`p.next` is null), the loop
 * restarts from the beginning of the list (by setting `p` to `first()` again).
 * 
 * Therefore the output returned by this function is simply the total number of nodes
 * contained within the linked list. If no nodes are present then `size() == 0`,
 * otherwise `size() >= 1`.
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
     * This function generates a random filled grid of size base x base and then checks
     * if there is a solution for a sliding puzzle by starting from the top left corner
     * (row = 2 and col = 2). If a solution is found (i.e., all non-zero cells are reachable
     * by moving right/down), it prints the solution; otherwise it outputs "no result".
     * 
     * @param args The `args` input parameter is not used anywhere within the function
     * and is thus optional and defaultly initialized to an empty array (`new String[0]`).
     * Therefore the function is capable of running independently without any user inputs
     * or command line arguments.
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
     * This function solves a sliding puzzle by iterating over the neighbors of a given
     * cell and attempting to swap the values of the current cell and its neighbors. If
     * a solution is found (i.e., all cells are filled with values and no orphaned cells
     * remain), the function returns true. Otherwise it returns false.
     * 
     * @param row The `row` input parameter represents the row number of a given cell
     * that is being checked for solutions.
     * 
     * @param column In the function `solve`, the `column` input parameter specifies the
     * column of the grid to be checked for a valid next move.
     * 
     * @param count The `count` input parameter represents the current number of marbles
     * collected by the player. The function iteratively tries to add more marbles to the
     * player's collection by recursively calling itself with the updated values of `row`,
     * `column`, and `count + 1`.
     * 
     * @returns The `solve` function is a recursive backtracking algorithm that tries to
     * fill a grid with values between 1 and `total`, where each value can only be used
     * once. It takes three parameters: `row`, `column`, and `count`.
     * 
     * The output returned by this function is either `true` if the whole grid can be
     * filled with the given range of values or `false` if no solution is found. In other
     * words., the function returns whether a solution exists or not.
     * 
     * Concisely summarized: The function solves a version of the "Valley Game" puzzle
     * by backtracking and returning whether a valid solution exists for filling the grid
     * with values between 1 and `total`.
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

    // Returns List of neighbours
    /**
     * This function generates the set of possible neighboring positions of a given
     * position (row and column) on a grid. It uses the `moves` list of candidate moves
     * to generate the neighbors and counts the number of neighbors for each position.
     * 
     * @param row The `row` input parameter represents the row number of the starting
     * position from which to find neighbors.
     * 
     * @param column The `column` input parameter specifies the column index of the current
     * cell being evaluated for neighbors.
     * 
     * @returns The `neighbors` function takes two integer parameters `row` and `column`,
     * and returns a list of lists of integers representing the set of possible moves
     * that can be made from the current position ( Row+Y , Column+X) to neighboring
     * positions on the grid. Each sublist within the returned list contains three integers:
     * the destination row (`row + y`), column (`column + x`), and a count of how many
     * neighbors there are at that position.
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

    // Returns the total count of neighbors
    /**
     * This function counts the number of neighboring cells that are empty (have a value
     * of 0) at a given row and column position. It iterates through an array of possible
     * moves (represented as `int[]`), and for each move it checks if the cell at the
     * resulting position is empty. If it is empty it adds 1 to the count of neighboring
     * empty cells and returns that value.
     * 
     * @param row The `row` input parameter specifies the row of the grid that we are
     * counting neighbors for.
     * 
     * @param column The `column` input parameter specifies the column number where we
     * are counting the neighbors. It is used to iterate over the moves and check if there
     * are any neighboring squares with a value of 0 at that particular column.
     * 
     * @returns The function `countNeighbors(int row`, `int column)` takes two integers
     * as input and returns the number of non-zero elements present immediately adjacent
     * to the given row and column position (using the moves array) inside a 2D grid
     * filled with 0s and 1s.
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

    // Returns true if it is orphan
    /**
     * This function checks if a given cell is an orphan (i.e., has no living neighbors).
     * It does so by iterating over the list of neighboring cells and checking if any of
     * them have a count of living neighbors equal to zero. If such a cell is founds the
     * function returns true; otherwise it returns false.
     * 
     * @param count The `count` input parameter represents the number of cells to check
     * for orphan status. If all neighbors of a cell have zero count (i.e., no neighbors),
     * then the cell is considered an orphan and the function returns `true`.
     * 
     * @param row The `row` input parameter is passed as a parameter to the `neighbors`
     * method which returns a list of neighboring elements. This `row` value is used as
     * an index into the 2D array to retrieve the neighbors.
     * 
     * @param column The `column` parameter indicates which column of the grid is being
     * checked for orphaned cells. It is used within the `neighbors()` method to specify
     * which row of the neighbors to check.
     * 
     * @returns This function takes three integer parameters `count`, `row`, and `column`
     * and returns a boolean value indicating whether an orphan has been detected.
     * 
     * The function checks if the number of elements at row `row` and column `column` is
     * less than the total number of elements minus one (`total - 1`). If this condition
     * is true and there are no neighboring elements with zero count (using the
     * `countNeighbors()` method), the function returns `true`, indicating an orphan has
     * been detected. Otherwise (`count >= total - 1` or there is at least one neighbor
     * with non-zero count), the function returns `false`.
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

    // Prints the result grid
    /**
     * This function prints the contents of the `grid` two-dimensional array as a table
     * with spaces separating each column and a final line break separating each row. It
     * skips over any -1 valuesin the array.
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
