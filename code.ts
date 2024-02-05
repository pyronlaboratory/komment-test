/**
 * @description enqueueImport(node: ts.Node. string): void  {
 * if (options.importIgnorePattern.test(importText)) return;
 * 
 * const fullPath: string= path.join(path. direc norie(node SourceFile fileName),
 * importText ) + '.ts';
 * enqueue File( fullPath) };
 * 
 * @param { undefined } node - node: ts.Node
 *              - ignores import texts matching ignore pattern
 *              - gets source file of the node when it does not match
 *            and calls enqueueFile with the full path
 * 
 * @param { string } importText - Accepts a string of import text as an input to
 * determine whether the import should be skipped or not based on ignore patterns.
 * 
 * @returns { void } The function enqueues a file for import.
 */
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

/**
 * @description Finds the import declaration that is a direct or indirect parent of
 * the given node and returns it. If no such import declaration is found Returns null.
 * 
 * @param { undefined } node - The node input parameter provides access to the Ts
 * declaration being analyzed.
 * 
 * @returns {  } The function findParentImportDeclaration takes a node as input and
 * searches up theAST to find an Import Declaration that declares it. It returns the
 * first import declaration found or null if none is found.
 */
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
