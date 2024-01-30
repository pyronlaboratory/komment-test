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
     * This function initializes an array of adjacency lists for a graph with `v` vertices.
     * It creates an empty list for each vertex and assigns it to the corresponding index
     * of the `adjList` array.
     */
    private void initAdjList() {
        adjList = new ArrayList[v];

        for (int i = 0; i < v; i++) {
            adjList[i] = new ArrayList<>();
        }
    }

    // add edge from u to v
    /**
     * This function adds a edge between two vertices (u and v) by adding v to the list
     * of vertices adjacent to u.
     * 
     * @param u In this function `addEdge(int u)`, the `u` input parameter is the tail
     * node of the edge being added.
     * 
     * @param v In the `addEdge` function above `$v$ is the `vertex` being added as an
     * neighbor to vertex $u$.
     */
    public void addEdge(int u, int v) {
        // Add v to u's list.
        adjList[u].add(v);
    }

    /**
     * This function stores all possible paths from a source vertex to a destination
     * vertex using recursion.
     * 
     * @param s The `s` input parameter represents the current node being considered for
     * exploration during Breadth-First Search (BFS). It initializes the path exploration
     * from the source node specified by `s`.
     * 
     * @param d The `d` input parameter represents the destination node of the traversal.
     * It is passed to the recursive `storeAllPathsUtil` function and used to determine
     * the current node to be visited and added to the path list.
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
     * This function stores all paths from a starting vertex 'u' to a destination vertex
     * 'd' using depth-first search. It mark the vertices as visited and recursively
     * explores all the adjacent vertices of the current vertex until the destination
     * vertex is reached. The function accumulates all the reached nodes (including the
     * start node) on a list 'nm' for future use.
     * 
     * @param u The `u` input parameter represents the current vertex being processed.
     * It is used to traverse the graph and visit all the vertices adjacent to it.
     * 
     * @param d The `d` input parameter represents the target vertex for which we want
     * to find all reachable paths from the starting vertex `u`. The function stores all
     * possible paths from `u` to `d` (including `u` itself) and adds them to a list.
     * 
     * @param isVisited The `isVisited` input parameter keeps track of which vertices
     * have already been visited during the depth-first search traversal of the graph.
     * It is used to avoid visiting a vertex twice during the recursion.
     * 
     * @param localPathList The `localPathList` parameter is used to store the partial
     * path found during the recursive call for each adjacent vertex of the current vertex.
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
     * This function is named `allPathsFromSourceToTarget` and its task is to find all
     * the possible paths that start at a source vertex and end at a destination vertex
     * by iterating through the edges of a given graph.
     * 
     * @param vertices The `vertices` input parameter represents the number of vertices
     * (i.e., nodes) present within the given graph.
     * 
     * @param a The `a` input parameter is an array of arrays representing the graph's
     * edges. It contains information about the connections between vertices (i.e., which
     * vertices are connected).
     * 
     * @param source The `source` input parameter specifies the starting vertex of the
     * graph that we want to find all possible paths from.
     * 
     * @param destination The `destination` parameter specifies the target node that the
     * algorithm should find all possible paths from the `source` node to.
     * 
     * @returns The function `allPathsFromSourceToTarget` takes five parameters:
     * 
     * 	- `vertices`: the number of vertices (nodes)in the graph.
     * 	- `a`: an array of arrays representing the edges of the graph (where each inner
     * array represents an edge between two nodes).
     * 	- `source`: the starting node from which we want to find all possible paths.
     * 	- `destination`: the ending node where we want to reach.
     * 
     * The function creates a sample graph using the given edges and stores all possible
     * paths from the source node to the destination node. It then returns all these
     * possible paths as a list of lists of integers (where each sub-list represents a
     * path between two nodes).
     * 
     * In other words. the output returned by this function is a list of all possible
     * paths from the source node to the destination node. Each path is represented as a
     * list of integers representing the nodes visited on that particular path.
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
