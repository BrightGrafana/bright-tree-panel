import { PanelData } from '@grafana/data';
import { RawNode, TreeNode, PanelOptions, ClickMode } from './types';
import { Utils } from './utils';

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
        throw new ReferenceError(`Duplicated ID found for id: ${node.id}`);
      }
      if (node.id === node.parent) {
        throw new ReferenceError(`Parent can not be mapped to itself. For id: ${node.id}`);
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

  public static validateTreeBranches(rawNodes: RawNode[], tree: TreeNode[]): void {
    // fetch all nodes used in the tree.
    const uniqueTreeNodes: string[] = [];
    const findNodeIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        uniqueTreeNodes.push(node.id);
        if (node.children) {
          findNodeIds(node.children);
        }
      });
    };
    findNodeIds(tree);

    // find unused (detached) rawNodes
    rawNodes.forEach((node) => {
      if (!uniqueTreeNodes.includes(node.id)) {
        throw new ReferenceError(`Detached branch detected for id: ${node.id}`);
      }
    });
  }

  public static validateOptionsInput(options: PanelOptions, data: PanelData): void {
    // Check for required panel options
    if (options.displayedTreeDepth === undefined || options.displayedTreeDepth < 0) {
      throw new ReferenceError("'Expanded levels' must be defined and >= 0 in panel options.");
    }

    if (
      !options.idColumn ||
      !options.labelColumn ||
      !options.parentIdColumn ||
      options.idColumn.trim() === '' ||
      options.labelColumn.trim() === '' ||
      options.parentIdColumn.trim() === ''
    ) {
      throw new ReferenceError(
        "'Node id field name', 'Node label field name', and 'Node parent id field name' must be defined in panel options."
      );
    }

    if (
      options.clickMode === ClickMode.SetVariable &&
      (!options.dashboardVariableName || options.dashboardVariableName.trim() === '')
    ) {
      throw new ReferenceError(
        "'Dashboard variable name' must be defined in panel options, when using Click mode set variable."
      );
    }

    // Validate column names
    const colNames = Utils.getDataFrameColumnNames(data).map((colName) => colName.toLowerCase().trim());
    const requiredColumns = [
      options.idColumn.toLowerCase().trim(),
      options.labelColumn.toLowerCase().trim(),
      options.parentIdColumn.toLowerCase().trim(),
    ];

    for (const colName of requiredColumns) {
      if (!colNames.includes(colName)) {
        throw new ReferenceError(`'${colName}' is not a table column.`);
      }
    }
  }
}
