import { DataFrame, DataFrameView, PanelData } from '@grafana/data';
import { Node, PanelOptions } from './models';

/**
 * Utility class containing various functions for data manipulation.
 */
export class Utils {
  /**
   * Extracts rows from a DataFrame where nodes are selected in the tree.
   *
   * @param {PanelData} data - The PanelData object containing the query result.
   * @param {string[]} nodeIds - An array of node IDs that were selected in the tree.
   * @param {PanelOptions["idColumn"]} idColumn - The name of the query field that contains the node IDs.
   * @returns {DataFrame} - A DataFrame containing only the rows corresponding to the selected nodes.
   * @throws {Error} - Throws an error if required parameters are not supplied or if the specified column is not found.
   */
  static extractSelectedTreeNodes(data: PanelData, nodeIds: string[], idColumn: PanelOptions['idColumn']): DataFrame {
    if (data === undefined) {
      throw new Error('data: PanelData was not supplied when clicking on tree node.');
    }
    if (nodeIds === undefined) {
      throw new Error('Ids of clicked nodes were not supplied when clicking on tree nodes.');
    }
    if (idColumn === undefined) {
      throw new Error('Column name with node ids was not supplied when clicking tree nodes.');
    }

    const queryResult: DataFrame = data.series[0] as DataFrame;

    const nodeIdFieldIndex = queryResult.fields.findIndex((field) => field.name === idColumn);

    if (nodeIdFieldIndex === -1) {
      throw new Error(`Column '${idColumn}' not found in the query result.`);
    }

    const modifiedFields: any[] = queryResult.fields.map((field) => ({
      ...field,
      values: field.values.filter((value, index) =>
        nodeIds.includes(`${queryResult.fields[nodeIdFieldIndex].values[index]}`)
      ),
    }));

    const modifiedResult: DataFrame = {
      ...queryResult,
      length: nodeIds.length,
      fields: modifiedFields,
    };

    return modifiedResult;
  }
  /**
   * Get the column names from the first series in a DataFrame.
   *
   * @param {PanelData} df - The DataFrame to extract column names from.
   * @returns {string[]} An array of column names.
   */
  static getDataFrameColumnNames(df: PanelData): string[] {
    if (!df.series || !df.series[0] || !df.series[0].fields) {
      return [];
    }
    return df.series[0].fields.map((field) => field.name);
  }

  /**
   * MAP a DataFrame into an array of Node objects.
   *
   * @param {DataFrame} df - The DataFrame to map.
   * @param {string} idColumn - The name of the column containing node IDs.
   * @param {string} parentColumn - The name of the column containing parent node IDs.
   * @param {string} labelColumn - The name of the column containing node labels.
   * @returns {Node[]} An array of Node objects.
   */
  static dfToNodeArray(df: DataFrame, idColumn: string, parentColumn: string, labelColumn: string): Node[] {
    const data = new DataFrameView(df).toArray();

    return data.map((dfRow) => ({
      name: `${dfRow[labelColumn]}`,
      id: `${dfRow[idColumn]}`,
      parent: dfRow[parentColumn] != null ? `${dfRow[parentColumn]}` : undefined,
      children: [] as Node[],
    }));
  }

  /**
   * Get the IDs of expanded nodes in a tree structure up to a specified depth.
   *
   * @param {Node[]} tree - The tree structure represented as an array of Node objects.
   * @param {number} maxDepth - The maximum depth to consider for expanded nodes.
   * @returns {string[]} An array of node IDs that are expanded.
   */
  static getExpandedNodeIdsForDepth(tree: Node[], maxDepth: number): string[] {
    if (!maxDepth || maxDepth < 0) {
      throw new Error('maxDepth should be positive number');
    }
    if (!tree) {
      return [];
    }

    const traverse = (nodes: Node[], currentDepth: number): string[] => {
      const result: string[] = [];

      for (const node of nodes) {
        if ((node.children || []).length === 0) {
          continue;
        }

        if (currentDepth < maxDepth) {
          result.push(node.id);
        }
        if (currentDepth + 1 < maxDepth) {
          result.push(...traverse((node.children || []), currentDepth + 1));
        }
      }

      return result;
    };

    return traverse(tree, 0);
  }
}
