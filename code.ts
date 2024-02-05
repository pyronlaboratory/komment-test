function enqueueImport(node: ts.Node, importText: string): void {
  if (options.importIgnorePattern.test(importText)) {
    return;
  }

  const nodeSourceFile = node.getSourceFile();
  let fullPath: string;
  if (/(^\.\/)|(^\.\.\/)/.test(importText)) {
    fullPath = path.join(path.dirname(nodeSourceFile.fileName), importText) + '.ts';
  } else {
    fullPath = importText + '.ts';
  }
  enqueueFile(fullPath);
}

function findParentImportDeclaration(node: ts.Declaration): ts.ImportDeclaration | null {
  let _node: ts.Node = node;
  do {
    if (ts.isImportDeclaration(_node)) {
      return _node;
    }
    _node = _node.parent;
  } while (_node);
  return null;
}
