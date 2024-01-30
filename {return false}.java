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
     * This function checks whether the current node is a leaf node or not. It returns
     * true if the node has no child nodes or if the size of the child nodes array is zero.
     * 
     * @returns This function is checking if a node has any child nodes or not. It returns
     * "true" if there are no child nodes and "false" otherwise. In other words , it
     * checks whether the node is a leaf node or not .
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
