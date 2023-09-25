import { PanelData, PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { TreeView, TreeItem } from '@material-ui/lab';
import { ExpandMore, ChevronRight } from '@material-ui/icons';
import React from 'react';
import { Utils } from './utils';
import { Node, PanelOptions, TreeLevelOrderMode, TreeClickEventControlMode } from './models';
import './CSS/classes.css';

// TODO: try and moe into the Tree function
let treeDepth: number;

function validateOptionsInput(options: PanelOptions, data: PanelData) {
  // Check for required panel options
  if (options.displayedTreeDepth === undefined || options.displayedTreeDepth < 0) {
    throw new Error("'Expanded levels' must be defined and >= 0 in panel options.");
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
    options.clickMode === TreeClickEventControlMode.Basic &&
    (!options.dashboardVariableName || options.dashboardVariableName.trim() === '')
  ) {
    throw new ReferenceError(
      "'Dashboard variable name' must be defined in panel options, when using dashboard variable on click mode."
    );
  }

  // Validate column names
  const colNames = Utils.getDataFrameColumnNames(data);
  const requiredColumns = [options.idColumn, options.labelColumn, options.parentIdColumn];

  for (const colName of requiredColumns) {
    if (!colNames.includes(colName)) {
      throw new Error(`'${colName}' is not a table column.`);
    }
  }
}

export const Tree: React.FC<PanelProps<PanelOptions>> = ({ options, data }) => {
  validateOptionsInput(options, data);

  const customJsFn = new Function('data', 'locationService', 'getTemplateSrv', options.onClick);

  // Convert data to a Node array
  const queryResult: Node[] = React.useMemo(
    () => Utils.dfToNodeArray(data.series[0], options.idColumn, options.parentIdColumn, options.labelColumn),
    [data, options.idColumn, options.parentIdColumn, options.labelColumn]
  );

  // Build the tree hierarchy
  const tree: Node[] = React.useMemo(() => {
    function getRootNodes(data: Node[]): Node[] {
      return data.filter((row) => row.parent === null);
    }

    function getChildrenOfNode(node: Node): Node[] {
      return queryResult.filter((row) => row.parent === node.id)!;
    }

    function addChildNodes(rootNodes: Node[]): Node[] {
      if (options.orderLevels === TreeLevelOrderMode.Asc) {
        rootNodes.sort((a, b) => a.name.localeCompare(b.name));
      } else if (options.orderLevels === TreeLevelOrderMode.Desc) {
        rootNodes.sort((a, b) => b.name.localeCompare(a.name));
      }

      return rootNodes.map((rootNode: Node) => {
        const childNodes = getChildrenOfNode(rootNode);
        if (childNodes.length === 0) {
          return rootNode;
        }
        addChildNodes(childNodes);
        rootNode.children = childNodes;

        return rootNode;
      });
    }

    return addChildNodes(getRootNodes(queryResult));
  }, [queryResult, options.orderLevels]);

  // Determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => Utils.getExpandedNodeIdsForDepth(tree, options.displayedTreeDepth),
    [tree, options]
  );
  const [expanded, setExpanded] = React.useState<string[]>(expandedNodeIds);

  // Update expanded nodes when depth changes
  if (treeDepth !== options.displayedTreeDepth) {
    treeDepth = options.displayedTreeDepth;
    setExpanded(expandedNodeIds);
  }

  // Handle node toggle
  const handleToggle = (event: React.ChangeEvent<any>, nodeIds: string[]) => setExpanded(nodeIds);

  // Handle node selection
  function setSelectedNodeId(event: React.ChangeEvent<any>, nodeIds: any): void {
    if (options.clickMode === TreeClickEventControlMode.Basic) {
      // SET a dashboard variable.
      const nodeId = typeof nodeIds === 'number' ? [nodeIds] : nodeIds;
      locationService.partial({ [`var-${options.dashboardVariableName}`]: nodeId }, true);
    } else if (options.clickMode === TreeClickEventControlMode.Advanced) {
      // use custom onClink handler
      customJsFn(Utils.extractSelectedTreeNodes(data, nodeIds, options.idColumn), locationService, getTemplateSrv);
    }
  }

  // Render TreeItem components recursively
  function renderTreeItem(node: Node) {
    if (node.children.length !== 0) {
      // add item count if needed to name
      const label = `${node.name}${options.showItemCount ? ` (${(node.children || []).length})` : ''}`;

      return (
        <TreeItem nodeId={node.id} label={label} custom-type="branch">
          {node.children.map((child: Node) => renderTreeItem(child))}
        </TreeItem>
      );
    }

    return <TreeItem nodeId={node.id} label={node.name} custom-type="leaf" />;
  }

  return (
    <div className="treeView">
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        onNodeToggle={handleToggle}
        onNodeSelect={setSelectedNodeId}
        multiSelect={options.multiSelect}
        expanded={expanded}
      >
        {tree.map((node: Node) => renderTreeItem(node))}
      </TreeView>
    </div>
  );
};
