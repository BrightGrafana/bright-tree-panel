import { RawNode, Node, TreeLevelOrderMode } from './models';

export const buildTree = (rawNodes: RawNode[], orderLevels: TreeLevelOrderMode): Node[] => {
    if (orderLevels === TreeLevelOrderMode.Asc) {
        rawNodes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderLevels === TreeLevelOrderMode.Desc) {
        rawNodes.sort((a, b) => b.name.localeCompare(a.name));
    }

    const nodeMap: { [id: string]: Node } = {};

    // Create a mapping from id to nodes
    for (const rawNode of rawNodes) {
        const node: Node = { ...rawNode, children: [] };
        nodeMap[node.id] = node;
    }

    const rootNodes: Node[] = [];

    // Connect children to their parent nodes
    for (const rawNode of rawNodes) {
        const node = nodeMap[rawNode.id];
        if (rawNode.parent && nodeMap[rawNode.parent]) {
            nodeMap[rawNode.parent].children.push(node);
        } else {
            rootNodes.push(node);
        }
    }

    return rootNodes;
};

export const getPath = (rawNodes: RawNode[], leaf: RawNode): Array<Node['id']> => {
    const nodeMap: { [id: string]: RawNode } = {};

    // Create a mapping from id to nodes
    for (const rawNode of rawNodes) {
        const node: RawNode = { ...rawNode };
        nodeMap[node.id] = node;
    }
    const resultset: Array<Node['id']> = [];
    const traverse = (item: RawNode) => {
        resultset.unshift(item.id);
        if (item.parent && nodeMap[item.parent] && !resultset.includes(item.parent)) {
            traverse(nodeMap[item.parent]);
        }
    };

    traverse(leaf);

    return resultset;
};
