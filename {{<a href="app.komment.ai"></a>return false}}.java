package com.thealgorithms.devutils.nodes;

import java.util.Collection;

public class LargeTreeNode<E> extends TreeNode<E> {
  
    private Collection<LargeTreeNode<E>> childNodes;

    public LargeTreeNode() {
        super();
    }

    public LargeTreeNode(E data) {
        super(data);
    }

    public LargeTreeNode(E data, LargeTreeNode<E> parentNode) {
        super(data, parentNode);
    }

    public LargeTreeNode(E data, LargeTreeNode<E> parentNode, Collection<LargeTreeNode<E>> childNodes) {
        super(data, parentNode);
        this.childNodes = childNodes;
    }

    /**
     * This function checks whether the node has any child nodes or not. If the node has
     * no child nodes or if its child nodes list is empty then it returns true otherwise
     * it returns false.
     * 
     * @returns The function is a `TreeNode` method that returns whether the node is a
     * leaf node or not. A leaf node is defined as a node with no child nodes.
     * 
     * The function checks if the `childNodes` list is null or if its size is equal to
     * 0. If either of those conditions are true (i.e., `childNodes` is null or its size
     * is 0), then the function returns `true`, indicating that the node is a leaf node.
     * Otherwise (i.e., `childNodes` is not null and its size is greater than 0), the
     * function returns `false`, indicating that the node is not a leaf node.
     * 
     * Therefore concisely describe output as: Returns true if there are no child nodes
     * else returns false.
     */
    @Override
    public boolean isLeafNode() {
        return (childNodes == null || childNodes.size() == 0);
    }

    /**
     * This function returns the collection of child nodes associated with the current node.
     * 
     * @returns The function `getChildNodes()` returns a `Collection` of `LargeTreeNode`
     * objects. The output is a collection of child nodes of the current node.
     */
    public Collection<LargeTreeNode<E>> getChildNodes() {
        return childNodes;
    }

    /**
     * This function sets the `childNodes` collection of a Large Tree Node to the given
     * ` Collection<LargeTreeNode<E>>` of child nodes.
     * 
     * @param childNodes The `childNodes` input parameter is a collection of `LargeTreeNode`
     * objects that represents the child nodes of the current node. It is used to set the
     * children of the current node.
     */
    public void setChildNodes(Collection<LargeTreeNode<E>> childNodes) {
        this.childNodes = childNodes;
    }
}
