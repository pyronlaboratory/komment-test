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


    /**
     * This function initializes an array of arrays to store adjacency lists for a graph.
     * It creates `v` arrays, each containing an empty list, and then iterates over the
     * `v` arrays to fill them with new lists.
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

    /**
     * This function calculates and returns all possible paths from a specified source
     * vertex to a specified destination vertex within a given graph represented as an
     * adjacency matrix.
     * 
     * @param vertices The `vertices` input parameter is the number of vertices (i.e.,
     * nodes) on each of which there are edges.
     * 
     * @param a The `a` input parameter is an array of integer arrays that represents the
     * edges of the graph. Each integer array `i` corresponds to an edge between vertices
     * `i[0]` and `i[1]`.
     * 
     * @param source The `source` input parameter specifies the starting vertex of the
     * path that we want to find all possible paths from.
     * 
     * @param destination The `destination` input parameter specifies the target node
     * that the function should find all possible paths to. The function returns a list
     * of all possible paths from the `source` node to the `destination` node.
     * 
     * @returns This function takes an integer `vertices`, an array of integer arrays
     * representing the adjacency matrix of a graph (`a`), and two integers `source` and
     * `destination` denoting the starting and ending points of a path. The function
     * stores all possible paths from the source to the destination and returns a list
     * of lists (`List<List<Integer>>`) containing all the stored paths. Each sub-list
     * represents a single path from source to destination.
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
