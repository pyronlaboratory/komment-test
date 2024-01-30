/**
 * Author : Siddhant Swarup Mallick
 * Github : https://github.com/siddhant2002
 */

/** Program description - To find all possible paths from source to destination*/

/**Wikipedia link -> https://en.wikipedia.org/wiki/Shortest_path_problem */
package com.thealgorithms.backtracking;

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
     * This function initializes an array list of size `v` named `adjList`, where each
     * element is a list of integers representing the adjacent nodes to the current node.
     */
    private void initAdjList() {
        adjList = new ArrayList[v];

        for (int i = 0; i < v; i++) {
            adjList[i] = new ArrayList<>();
        }
    }

    // add edge from u to v
    /**
     * This function adds the vertex `v` to the list of vertices adjacent to `u` for all
     * lists of type `adjList`.
     * 
     * @param u In the function `addEdge`, the `u` input parameter is the source node of
     * the edge being added. It is used as an index to access the list of nodes stored
     * within the adjacency list represented by `adjList`.
     * 
     * @param v In the `addEdge` function given:
     * 
     * The `v` input parameter is the vertex being added to the edge list of `u`.
     */
    public void addEdge(int u, int v) {
        // Add v to u's list.
        adjList[u].add(v);
    }

    /**
     * This function stores all possible paths from a source vertex (specified by `s`)
     * to all other vertices (specified by `d`) using DFS Recursive algorithm.
     * 
     * @param s In the given function `storeAllPaths`, the `s` parameter represents the
     * starting vertex of the search. It is used as the initial value for the recursive
     * utility function `storeAllPathsUtil`.
     * 
     * @param d The `d` input parameter represents the depth of the tree being traversed.
     * It determines how far the recursive function should go down the tree before stopping.
     */
    public void storeAllPaths(int s, int d) {
        boolean[] isVisited = new boolean[v];
        ArrayList<Integer> pathList = new ArrayList<>();

        // add source to path[]
        pathList.add(s);
        // Call recursive utility
        storeAllPathsUtil(s, d, isVisited, pathList);
    }

    // A recursive function to print all paths from 'u' to 'd'.
    // isVisited[] keeps track of vertices in current path.
    // localPathList<> stores actual vertices in the current path
    /**
     * This function stores all possible paths from a starting node (u) to a ending node
     * (d), using a stack to keep track of the nodes visited and an array to store the
     * path. It marks the current node as visited and recursively calls itself for all
     * adjacent vertices that have not been visited before.
     * 
     * @param u The `u` parameter is the "current node" being explored during the depth-first
     * search. It represents the vertex being examined at each iteration of the recursive
     * function call.
     * 
     * @param d The `d` input parameter specifies the target vertex to which a path should
     * be found from the starting vertex specified by `u`. The function `storeAllPathsUtil`
     * recurrently traverses the graph starting from `u`, explores all reachable vertices
     * up to `d`, and collects the visited vertices into a list.
     * 
     * @param isVisited The `isVisited` parameter is a boolean array that represents
     * whether a node has already been visited or not. In the function `storeAllPathsUtil()`,
     * it is used to mark the current node and its adjacent vertices as visited during
     * the depth-first search traversal.
     * 
     * @param localPathList The `localPathList` input parameter is used to store the path
     * of the nodes that have been visited so far during the recursive call for a given
     * node. It is a List<Integer> that keeps track of the nodes that have been explored
     * while finding all possible paths from a given source vertex to a given destination
     * vertex.
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
     * This function allPathsFromSourceToTarget() takes an integer representing the number
     * of vertices (n), a 2D array representing the graph edges (a), and two integers
     * representing the source and target vertices (source and destination). It then
     * creates a sample graph based on the input data and returns a List of List of
     * Integers representing all possible paths from the source vertex to the target vertex.
     * 
     * @param vertices The `vertices` input parameter represents the number of vertices
     * (i.e., nodes) present within the graph. This function takes no such variable so
     * it's defined as undefined.
     * 
     * @param a The `a` input parameter is an array of integer arrays representing the
     * graph edges. Each inner integer array contains two indices representing the two
     * vertices connected by the edge. The function adds these edges to the graph using
     * the `addEdge()` method.
     * 
     * @param source The `source` input parameter specifies the starting vertex for the
     * search of possible paths from source to destination.
     * 
     * @param destination The `destination` input parameter specifies the target vertex
     * that the method should find all possible paths from the `source` vertex to reach.
     * It is the endpoint of the path search.
     * 
     * @returns Based on the signature and the comments provided:
     * 
     * The output of this function is a list of all possible paths from the source vertex
     * (specified by `source`) to the target vertex (specified by `destination`) via all
     * edges present within the graph (represented as an adjacency matrix `a`). The return
     * type is a list of lists of integers (where each inner list represents a path).
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
