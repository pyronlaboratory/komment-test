package com.thealgorithms.backtracking;
import java.util.*;
public class KnightsTour {

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
     * This function creates a rectangular grid of size base x base filled with -1s except
     * for the central cell which is 1. It then randomly selects two cells within the
     * grid and marks them as 1. Finally it attempts to solve the sliding puzzle by
     * changing the values of nearby cells to reach the initial configuration. If the
     * puzzle can be solved it prints "solution found" otherwise it prints "no result".
     * 
     * @param args The `args` parameter is not used at all within the provided code
     * snippet. Therefore it has no effect on the program's behavior.
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
     * This function solves a sliding puzzle by iterating through the neighbors of a given
     * cell and updating the values of the grid based on the current count and the number
     * of unorphaned cells around each neighbor. It returns true if the given cell is
     * solvable with the given count and false otherwise.
     * 
     * @param row The `row` input parameter is used to update the values of a given row
     * when a neighboring cell is found with the same value as the current cell.
     * 
     * @param column The `column` input parameter represents the column number where the
     * count is being checked and updated. It is used to iterate over the neighboring
     * cells of a given cell.
     * 
     * @param count The `count` input parameter represents the number of dots to place
     * on a given cell. The function recursively calls itself with the same `row`, `column`,
     * and an incremented `count`. If a solution is found before `count` exceeds `total`,
     * the function returns `true`; otherwise (including when no solutions are found),
     * it returns `false`.
     * 
     * @returns This function takes three integers `row`, `column`, and `count` as input
     * and returns a boolean value indicating whether the given region of size `count x
     * count` contains a solutions (i.e., a sub-grid with all cells filled) or not.
     * 
     * Here's a concise description of the output:
     * 
     * The function repeatedly searches the neighborhood of the current cell using a
     * sorted list of adjacent cells and updates the value of the current cell and its
     * neighbors accordingly. If a solution is found within the specified size range
     * (excluding the current cell), the function returns `true`, otherwise it returns `false`.
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
     * This function `neighbors` returns a list of tuples representing the neighboring
     * positions on a grid from a given row and column position. The list contains tuples
     * with three elements: the x-coord of the position on the grid; the y-coord of the
     * position on the grid; and the number of neighbors at that position.
     * 
     * @param row The `row` input parameter specifies the row of the grid to look for neighbors.
     * 
     * @param column The `column` input parameter represents the column index of the
     * current cell being considered for potential neighbors.
     * 
     * @returns The `neighbors` function returns a list of integer arrays representing
     * the neighboring cells of the given row and column on a grid. Each array contains
     * three integers: the row and column of the neighboring cell (0-based indexing), and
     * the number of neighbors for that cell. The list of neighboring cells is empty if
     * there are no non-wall cells adjacent to the given row and column.
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
     * This function counts the number of neighbors of a given cell that have a value of
     * 0.
     * 
     * @param row The `row` input parameter specifies the row index of the current cell
     * being processed.
     * 
     * @param column The `column` input parameter specifies the column where the count
     * of neighbors should be checked.
     * 
     * @returns The function `countNeighbors(int row`, int `column)` takes two integer
     * parameters and returns the number of neighbors (defined as non-zero elements) of
     * a cell at position (`row`, `column`) considering all possible moves `m` available.
     * 
     * The output is an `int` value representing the count of non-zero elements among all
     * neighboring cells reached from the initial cell located at position (`row`, `column`).
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
     * This function checks if a given cell is an orphan (i.e., has no neighboring cells
     * with the same value) by checking the neighboring cells and counting their values.
     * If none of the neighbors have the same value as the given cell and its row and
     * column indices are not equal to the total size of the array - 1 , then the function
     * returns true; otherwise it returns false.
     * 
     * @param count The `count` input parameter represents the number of orphaned cells
     * found so far at the current position.
     * 
     * @param row The `row` input parameter is passed by value and represents one of the
     * cells within the 2D array that's being processed. It serves as an index for the
     * row number of the cell that's currently being examined to determine whether or not
     * it has living neighbors.
     * 
     * @param column The `column` input parameter represents the column of the current
     * node being evaluated for orphanhood. It is used to loop through the neighbors of
     * the current node and check if any of them have zero count neighbors.
     * 
     * @returns This function takes three inputs: `count`, `row`, and `column`, which
     * represent the number of balls currently on the row and column where the orphan
     * might be located. It then checks if any of the neighboring rows or columns have 0
     * balls (i.e., are "orphaned"), and returns `true` if such a row or column is found.
     * 
     * In other words: If there is at least one "orphaned" row or column (defined as a
     * row or column with 0 balls) among the neighboring rows and columns of the current
     * row and column `count`, `row`, `column`, then the function returns `true`. Otherwise
     * it returns `false`.
     * 
     * So the output returned by this function is a `boolean` value indicating whether
     * an orphaned row or column has been found.
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
     * This function prints the contents of a two-dimensional integer array `grid` to the
     * console.
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
