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

    /**
     * This function computes and returns all possible paths from a specified source
     * vertex to a specified destination vertex of a given graph.
     * 
     * @param vertices The `vertices` input parameter represents the number of vertices
     * (i.e., nodes)in the graph. It is used to initialize the AllPathsFromSourceToTarget
     * data structure with the appropriate size.
     * 
     * @param a The `a` parameter is an array of integer arrays that represents the
     * adjacency matrix of a graph. Each inner integer array describes the edges connecting
     * two vertices (represented by their indices).
     * 
     * @param source The `source` input parameter specifies the starting vertex of the
     * search for all possible paths from that vertex to the `destination` vertex.
     * 
     * @param destination The `destination` input parameter specifies the target node
     * that the function should find all possible paths to reach from the `source` node.
     * 
     * @returns The output of the `allPathsFromSourceToTarget` function is a list of all
     * possible paths from the specified `source` vertex to the specified `destination`
     * vertex. This is achieved by first creating an empty graph and then iterating through
     * the input matrix `a`, adding edges between corresponding vertices as defined by
     * the matrix. Finally the function stores all possible paths from source to destination
     * and returns a list of lists of integers representing the paths.
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
