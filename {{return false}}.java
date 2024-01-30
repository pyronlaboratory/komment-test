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
     * This function checks if the current node has no child nodes. It returns `true` if
     * the node is a leaf node (has no children) and `false` otherwise.
     * 
     * @returns This function is a method of an object that inherits from another object
     * (i.e., it overrides a method). The output of the function is a boolean value
     * indicating whether the object is a leaf node or not. Specifically:
     * 
     * 	- If `childNodes` is null or has zero elements (size() == 0), the method returns
     * `true`, indicating that the object is a leaf node.
     * 	- Otherwise (if `childNodes` is non-null and has one or more elements), the method
     * returns `false`, indicating that the object is not a leaf node.
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
