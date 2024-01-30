/**
 * Author : Siddhant Swarup Mallick
 * Github : https://github.com/siddhant2002
 */

/** Program description - To find all possible paths from source to destination*/

/**Wikipedia link -> https://en.wikipedia.org/wiki/Shortest_path_problem */
package com.thealgorithms.backtracking

import java.util.*;

public class AllPathsFromSourceToTarget {

    // No. of vertices in graph
    private final int v;

    // To store the paths from source to destination
    static List<List<Integer>> nm = new ArrayList<>();
    // adjacency list
    private ArrayList<Integer>[] adjList;

    // Constructor
    public AllPathsFromSourceToTarget(int vertices) {

        // initialise vertex count
        this.v = vertices;

        // initialise adjacency list
        initAdjList();
    }

    // utility method to initialise adjacency list
    /**
     * This function initializes an adjacency list data structure for a graph with `v`
     * vertices. It creates an empty list for each vertex and initializes it with no elements.
     */
    private void initAdjList() {
        adjList = new ArrayList[v];

        for (int i = 0; i < v; i++) {
            adjList[i] = new ArrayList<>();
        }
    }

    // add edge from u to v
    /**
     * This function adds the vertex `v` to the list of vertices adjacent to `u`in the
     * graph represented by an adjacency list.
     * 
     * @param u In the `addEdge()` function given:
     * 
     * `u` is the first vertex whose neighbors list is being updated to include `v`.
     * 
     * @param v The `v` input parameter is the vertex being added to the edge. It represents
     * the neighboring vertex that is being connected to the vertex `u`.
     */
    public void addEdge(int u, int v) {
        // Add v to u's list.
        adjList[u].add(v);
    }

    /**
     * This function stores all possible paths from a starting vertex 's' to a destination
     * vertex 'd' by using breadth-first search. It adds the starting vertex to the list
     * of paths and then recursively calls itself for each adjacent vertex that has not
     * been visited before.
     * 
     * @param s In the provided function `storeAllPaths`, the `s` input parameter represents
     * the source vertex from which all paths are being searched.
     * 
     * @param d The `d` input parameter is the destination node that we want to find all
     * possible paths to from the given source node.
     */
    public void storeAllPaths(int s, int d) {
        boolean[] isVisited = new boolean[v];
        ArrayList<Integer> pathList = new ArrayList<>();

        // add source to path[]
        pathList.add(s);
        // Call recursive utility
        storeAllPathsUtil(s, d, isVisited, pathList);
    }

    /**
     * This function storeAllPathsUtil(Integer u ...), given an undirected graph represented
     * by an adjacency matrix and a depth d to explore until all paths are found starting
     * at each vertex and returning the lists of nodes (pm) of length d ending at vertex
     * v:
     * 1/ It first makes all the adjacent vertices unvisited except vertex v which is not
     * marked as visited yet
     * 2/ Traversing the adjacent unvisited vertices recursively finding all paths of
     * lengths upto d that visit only vertex v. If there is a path ending at vertex d
     * found it returns a list of nodes making this recursion redundant for this vertex
     * otherwise it waits till complete.
     * 3/ When returning to its initial marked visited state to continue to next unvisited
     * unexplored neighbor and repeat.
     * Does this explain the purpose of the given code?
     * 
     * @param u The `u` parameter is the current vertex being considered for traversal.
     * It represents the "unexplored" vertex that we are currently examining to find a
     * path to the target vertex `d`.
     * 
     * @param d The `d` input parameter represents the destination vertex for which we
     * need to find all possible paths from a given starting vertex `u`.
     * 
     * @param isVisited The `isVisited` input parameter marks whether a vertex has already
     * been visited or not during the recursive traversal.
     * 
     * @param localPathList The `localPathList` input parameter is used to store the path
     * of nodes that have been explored during the recursive call. It is a list of integers
     * and is used to keep track of the current path from the starting node to the
     * destination node.
     */
    private void storeAllPathsUtil(Integer u, Integer d, boolean[] isVisited, List<Integer> localPathList) {

        if (u.equals(d)) {
            nm.add(new ArrayList<>(localPathList));
            return;
        }

        // Mark the current node
        isVisited[u] = true;

        // Recursion for all the vertices adjacent to current vertex

        for (Integer i : adjList[u]) {
            if (!isVisited[i]) {
                // store current node in path[]
                localPathList.add(i);
                storeAllPathsUtil(i, d, isVisited, localPathList);

                // remove current node in path[]
                localPathList.remove(i);
            }
        }

        // Mark the current node
        isVisited[u] = false;
    }

    // Driver program
    /**
     * This function computes and returns all possible paths from a source vertex to a
     * destination vertex by recursively exploring the graph represented by an array of
     * integer arrays (a two-dimensional array).
     * 
     * @param vertices The `vertices` input parameter specifies the number of vertices
     * (i.e., nodes) In the graph. It is used to size the output list of lists of integers
     * representing the possible paths from source to destination.
     * 
     * @param a The `a` input parameter is an array of integers representing the edges
     * of a graph. Each integer array represents a directed edge between two vertices
     * with the index 0 being the source vertex and index 1 being the destination vertex.
     * 
     * @param source The `source` input parameter specifies the starting vertex of the
     * search for paths from the source to the destination.
     * 
     * @param destination The `destination` parameter specifies the target vertex that
     * the algorithm should find all possible paths to from the `source` vertex.
     * 
     * @returns This function takes a graph represented as an adjacency matrix `a` and
     * two integers `source` and `destination`, and returns a list of all possible paths
     * from `source` to `destination`. The output is a list of lists of integers representing
     * the paths. For example:
     * ```
     * [
     *   [0],   // Path starting at source (0)
     *   [0],   // Path starting at vertex 1
     *   [1],   // Path starting at vertex 2
     *   [2],   // Path starting at vertex 3
     *   [0],   // Path starting at vertex 4
     *   [1],   // Path starting at vertex 5
     *   [2],   // Path starting at vertex 6
     *   [0],   // Path starting at vertex 7
     *   [1],   // Path starting at vertex 8
     *   [2]   // Path starting at vertex 9
     * ]
     * ```
     * The output is a list of all possible paths from `source` to `destination`, where
     * each path is represented as a list of integers representing the vertices visited.
     * The list of lists of integers is returned.
     */
    public static List<List<Integer>> allPathsFromSourceToTarget(int vertices, int[][] a, int source, int destination) {
        // Create a sample graph
        AllPathsFromSourceToTarget g = new AllPathsFromSourceToTarget(vertices);
        for (int[] i : a) {
            g.addEdge(i[0], i[1]);
            // edges are added
        }
        g.storeAllPaths(source, destination);
        // method call to store all possible paths
        return nm;
        // returns all possible paths from source to destination
    }
}
