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

    @Override
    public boolean isLeafNode() {
        return (childNodes == null || childNodes.size() == 0);
    }

    public Collection<LargeTreeNode<E>> getChildNodes() {
        return childNodes;
    }

    public void setChildNodes(Collection<LargeTreeNode<E>> childNodes) {
        this.childNodes = childNodes;
    }
}
