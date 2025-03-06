import { RawNode, TreeLevelOrderMode, TreeNode } from './types';
import { Validator } from 'validator';

export class Tree {
  private tree: TreeNode[] = [];

  constructor(private rawNodes: RawNode[], private orderLevels: TreeLevelOrderMode) {
    Validator.validateTreeInput(this.rawNodes);
    this.#buildTree();
    Validator.validateTreeBranches(this.rawNodes, this.tree);
  }

  #buildTree() {
    if (this.orderLevels === TreeLevelOrderMode.Asc) {
      this.rawNodes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.orderLevels === TreeLevelOrderMode.Desc) {
      this.rawNodes.sort((a, b) => b.name.localeCompare(a.name));
    }

    const nodeMap: { [id: string]: TreeNode } = {};

    // create a mapping from id to nodes including additional data
    for (const rawNode of this.rawNodes) {
      nodeMap[rawNode.id] = {
        id: rawNode.id,
        name: rawNode.name,
        children: [],
        disabled: rawNode.disabled,
        link: rawNode.link,
        additionalData: rawNode.additionalData,
      };
    }

    const rootNodes: TreeNode[] = [];

    // connect children to their parent nodes
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

  value(): TreeNode[] {
    return this.tree;
  }

  /**
   * Get the TreeNode IDs up to a specified depth.
   *
   * @param {number} maxDepth - The maximum depth to consider for expanded nodes.
   * @param {TreeNode[]} nodes - The nodes to process, if not provided the current tree will be used
   * @returns {string[]} An array of node IDs that are expanded.
   */
  listNodeIdsByDepth(maxDepth: number, nodes?: TreeNode[]): string[];
  listNodeIdsByDepth(maxDepth: number, nodes: TreeNode[] = this.tree): string[] {
    if (maxDepth === undefined || maxDepth < 0) {
      throw new ReferenceError('maxDepth should be positive number');
    }
    return this.#listNodeIdsByDepth(nodes, 0, maxDepth);
  }

  #listNodeIdsByDepth(nodes: TreeNode[], currentDepth: number, maxDepth: number): string[] {
    const result: string[] = [];

    for (const node of nodes) {
      if (node.children.length === 0) {
        continue;
      }

      if (currentDepth < maxDepth) {
        result.push(node.id);
      }

      if (currentDepth + 1 < maxDepth) {
        result.push(...this.#listNodeIdsByDepth(node.children || [], currentDepth + 1, maxDepth));
      }
    }

    return result;
  }

  flatten(expandedNodes: string[], depth: number, nodes?: TreeNode[]): Array<{ node: TreeNode; depth: number }>;
  flatten(
    expandedNodes: string[],
    depth: number,
    nodes: TreeNode[] = this.tree
  ): Array<{
    node: TreeNode;
    depth: number;
  }> {
    return this.#flatten(nodes, expandedNodes, depth);
  }

  #flatten(nodes: TreeNode[], expandedNodes: string[], depth = 0): Array<{ node: TreeNode; depth: number }> {
    return nodes.reduce((acc, node) => {
      acc.push({ node, depth });
      if (node.children && node.children.length > 0 && expandedNodes.includes(node.id)) {
        acc.push(...this.#flatten(node.children, expandedNodes, depth + 1));
      }
      return acc;
    }, [] as Array<{ node: TreeNode; depth: number }>);
  }

  path(id: string, nodes?: TreeNode[]): string[];
  path(id: string, nodes: TreeNode[] = this.tree): string[] {
    return this.#path(nodes, id);
  }

  #path(nodes: TreeNode[], search: string): string[] {
    for (const node of nodes) {
      if (node.id === search) {
        return [node.id];
      }

      const childResult = this.#path(node.children, search);
      if (childResult.length > 0) {
        return [node.id, ...childResult];
      }
    }

    return [];
  }

  findAll(searchTerm: string, nodes?: TreeNode[]): TreeNode[];
  findAll(searchTerm: string, nodes: TreeNode[] = this.tree): TreeNode[] {
    return this.#findAll(nodes, searchTerm);
  }

  #findAll = (nodes: TreeNode[], searchTerm: string): TreeNode[] => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    return nodes.reduce((acc: TreeNode[], node) => {
      const nameMatch = `${node.name}`.toLowerCase().includes(searchTermLowerCase);
      const additionalMatch =
        node.additionalData &&
        Object.values(node.additionalData).some((val) => `${val}`.toLowerCase().includes(searchTermLowerCase));
      const filteredChildren = node.children ? this.#findAll(node.children, searchTerm) : [];
      if (nameMatch || additionalMatch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, [] as TreeNode[]);
  };

  filter(filterFn: (node: TreeNode) => boolean, nodes?: TreeNode[]): TreeNode[];
  filter(filterFn: (node: TreeNode) => boolean, nodes: TreeNode[] = this.tree): TreeNode[] {
    return this.#filter(nodes, filterFn);
  }

  #filter = (nodes: TreeNode[], filterFn: (node: TreeNode) => boolean): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      const match = filterFn(node);
      const filteredChildren = node.children ? this.#filter(node.children, filterFn) : [];
      if (match || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, [] as TreeNode[]);
  };

  flatFilter(filterFn: (node: TreeNode) => boolean, nodes?: TreeNode[]): TreeNode[];
  flatFilter(filterFn: (node: TreeNode) => boolean, nodes: TreeNode[] = this.tree): TreeNode[] {
    return this.#flatFilter(nodes, filterFn);
  }

  #flatFilter = (nodes: TreeNode[], filterFn: (node: TreeNode) => boolean): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      const match = filterFn(node);
      const filteredChildren = node.children ? this.#flatFilter(node.children, filterFn) : [];
      if (match) {
        acc.push(node);
      }
      if (filteredChildren.length > 0) {
        acc.push(...filteredChildren);
      }
      return acc;
    }, [] as TreeNode[]);
  };

  some(filterFn: (node: TreeNode) => boolean, nodes?: TreeNode[]): boolean;
  some(filterFn: (node: TreeNode) => boolean, nodes: TreeNode[] = this.tree): boolean {
    return this.#some(nodes, filterFn);
  }

  #some = (nodes: TreeNode[], filterFn: (node: TreeNode) => boolean): boolean => {
    return nodes.reduce((acc: boolean, node) => {
      const match = filterFn(node);
      const matchInChildren = node.children ? this.#some(node.children, filterFn) : false;
      if (match || matchInChildren) {
        return true;
      }
      return acc;
    }, false);
  };

  last(filterFn: (node: TreeNode) => boolean, nodes?: TreeNode[]): TreeNode[];
  last(filterFn: (node: TreeNode) => boolean, nodes: TreeNode[] = this.tree): TreeNode[] {
    return this.#last(nodes, filterFn);
  }

  #last = (nodes: TreeNode[], filterFn: (node: TreeNode) => boolean): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      const match = filterFn(node);
      const matchesInChildren = node.children ? this.#last(node.children, filterFn) : [];
      if (match || matchesInChildren.length > 0) {
        return matchesInChildren.length > 0 ? matchesInChildren : match ? [node] : [];
      }
      return acc;
    }, []);
  };
}
