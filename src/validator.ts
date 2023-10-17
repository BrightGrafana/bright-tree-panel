import { Node } from './models';

/**
 * A utility class for validating a tree structure represented by an array of nodes.
 */
export class Validator {
    /**
     * Validates the input tree for duplicate node IDs and child relationships.
     * @param {Node[]} tree - The array of nodes representing the tree structure.
     * @throws {Error} If a duplicate node ID is found.
     */
    public static validateTreeInput(tree: Node[]): void {
        /**
         * Set to store encountered node IDs.
         * @type {Set<Node['id']>}
         */
        const nodeIds: Set<Node['id']> = new Set();

        /**
         * Recursively validates node IDs and child relationships.
         * @param {Node} node - The node to validate.
         * @throws {Error} If a duplicate node ID is found.
         */
        function validateIds(node: Node): void {
            if (nodeIds.has(node.id)) {
                throw new ReferenceError(`Duplicated ID found for: ${node.id}`);
            }

            nodeIds.add(node.id);

            if (node.children) {
                node.children.forEach(validateIds);
            }
        }

        tree.forEach(validateIds);
    }
}
