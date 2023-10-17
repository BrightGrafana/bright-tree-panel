import { RawNode, Node } from './models';

/**
 * A utility class for validating a tree structure represented by an array of nodes.
 */
export class Validator {
    /**
     * Validates the input tree for duplicate node IDs and child relationships.
     * @param {RawNode[]} rawNodes - The array of nodes representing the tree structure.
     * @throws {Error} If a duplicate node ID is found.
     */
    public static validateTreeInput(rawNodes: RawNode[]): void {
        /**
         * Set to store encountered node IDs.
         * @type {Set<RawNode['id']>}
         */
        const nodeIds: Set<RawNode['id']> = new Set();

        rawNodes.forEach((node: RawNode) => {
            if (nodeIds.has(node.id)) {
                throw new ReferenceError(`Duplicated ID found for: ${node.id}`);
            }
            if (node.id === node.parent) {
                throw new ReferenceError(`Parent can not be mapped to it self. for: ${node.id}`);
            }

            nodeIds.add(node.id);
        });

        // list of all ID's is build

        rawNodes.forEach((node: RawNode) => {
            if (node.parent && !nodeIds.has(node.parent)) {
                throw new ReferenceError(`Parent not found for id ${node.id} parent ${node.parent}`);
            }
        });
    }

    public static validateTreeBranches(rawNodes: RawNode[], tree: Node[]): void {
        // fetch all nodes in tree.
        const treeNodes: string[] = [];
        const findNodeIds = (nodes: Node[]) => {
            nodes.forEach((node) => {
                treeNodes.push(node.id);
                if (node.children) {
                    findNodeIds(node.children);
                }
            });
        };
        findNodeIds(tree);

        // find unused (detached) rawNodes
        rawNodes.forEach(node => {
            if (!treeNodes.includes(node.id)) {
                throw new ReferenceError(`Detached branch detected for id: ${node.id}`)
            }
        })
    }
}
