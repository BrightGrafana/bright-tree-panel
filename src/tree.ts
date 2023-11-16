import { RawNode, TreeLevelOrderMode, TreeNode } from 'models';
import { Validator } from 'validator';

export class Tree {
  private tree: TreeNode[] = [];

  constructor(private rawNodes: RawNode[], private orderLevels: TreeLevelOrderMode) {
    Validator.validateTreeInput(this.rawNodes);
    this.buildTree();
    Validator.validateTreeBranches(this.rawNodes, this.tree);
  }

  private buildTree() {
    if (this.orderLevels === TreeLevelOrderMode.Asc) {
      this.rawNodes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.orderLevels === TreeLevelOrderMode.Desc) {
      this.rawNodes.sort((a, b) => b.name.localeCompare(a.name));
    }

    const nodeMap: { [id: string]: TreeNode } = {};

    // Create a mapping from id to nodes
    for (const rawNode of this.rawNodes) {
      nodeMap[rawNode.id] = {
        id: rawNode.id,
        name: rawNode.name,
        children: [],
      };
    }

    const rootNodes: TreeNode[] = [];

    // Connect children to their parent nodes
    for (const rawNode of this.rawNodes) {
      const node = nodeMap[rawNode.id];
      if (rawNode.parent && nodeMap[rawNode.parent]) {
        nodeMap[rawNode.parent].children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    this.tree = rootNodes;
  }

  getTree(): TreeNode[] {
    return this.tree;
  }

  /**
   * Get the TreeNode IDs up to a specified depth.
   *
   * @param {number} maxDepth - The maximum depth to consider for expanded nodes.
   * @returns {string[]} An array of node IDs that are expanded.
   */
  getNodeIdsForDepth(maxDepth: number): string[] {
    if (!maxDepth || maxDepth < 0) {
      throw new ReferenceError('maxDepth should be positive number');
    }

    const traverse = (nodes: TreeNode[], currentDepth: number): string[] => {
      const result: string[] = [];

      for (const node of nodes) {
        if (node.children.length === 0) {
          continue;
        }

        if (currentDepth < maxDepth) {
          result.push(node.id);
        }

        if (currentDepth + 1 < maxDepth) {
          result.push(...traverse(node.children || [], currentDepth + 1));
        }
      }

      return result;
    };

    return traverse(this.tree, 0);
  }

  getPath(id: TreeNode['id']): Array<TreeNode['id']> {
    const traverse = (nodes: TreeNode[], search: TreeNode['id']): Array<TreeNode['id']> => {
      for (const node of nodes) {
        if (node.id === search) {
          return [node.id];
        }

        const childResult = traverse(node.children, search);
        if (childResult.length > 0) {
          return [node.id, ...childResult];
        }
      }

      return [];
    };

    return traverse(this.tree, id);
  }

  searchTree(searchTerm: string): TreeNode[] {
    return this._searchTree(this.tree, searchTerm);
  }

  private _searchTree(nodes: TreeNode[], searchTerm: string): TreeNode[] {
    const result: TreeNode[] = [];
    for (let node of nodes) {
      const children = this._searchTree(node.children, searchTerm);
      if (children.length > 0 || node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        result.push({ ...node, children });
      }
    }

    return result;
  }
}
