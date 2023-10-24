import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import React from 'react';
import { PanelProps } from '@grafana/data';
import { Node, PanelOptions, RawNode } from './models';
import { buildTree, getPath } from './TreeBuilder';
import { Utils } from './utils';
import { Validator } from './validator';
import { locationService } from '@grafana/runtime';

export const TreePanel: React.FC<PanelProps<PanelOptions>> = ({ options, data }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  // Convert data to a Node array
  const queryResult: RawNode[] = React.useMemo(
    () => Utils.dfToNodeArray(data.series[0], options.idColumn, options.parentIdColumn, options.labelColumn),
    [data, options.idColumn, options.parentIdColumn, options.labelColumn]
  );
  Validator.validateTreeInput(queryResult);

  // buildTree
  const tree: Node[] = React.useMemo(
    () => buildTree(queryResult, options.orderLevels),
    [queryResult, options.orderLevels]
  );

  // Determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => Utils.getExpandedNodeIdsForDepth(tree, options.displayedTreeDepth),
    [tree, options]
  );

  const [expanded, setExpanded] = React.useState<string[]>(expandedNodeIds);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [treeDepth, setTreeDepth] = React.useState<number>(options.displayedTreeDepth);

  // Update expanded nodes when depth changes
  if (treeDepth !== options.displayedTreeDepth) {
    setTreeDepth(options.displayedTreeDepth);
    setExpanded(expandedNodeIds);
  }

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
    // SET a dashboard variable.
    const nodeId = typeof nodeIds === 'number' ? [nodeIds] : nodeIds;
    locationService.partial({ [`var-${options.dashboardVariableName}`]: nodeId }, true);
  };

  const getProvidedNodes = (dashboardVariableName: string): string[] => {
    const input = locationService.getSearchObject()[`var-${dashboardVariableName}`];
    if (!input) {
      return [];
    }
    if (!Array.isArray(input)) {
      return [`${input}`];
    }

    return input as string[];
  };

  // set selected based on url
  const providedNodes = getProvidedNodes(options.dashboardVariableName);
  if (JSON.stringify(providedNodes) !== JSON.stringify(selected)) {
    const extraExpansions: string[] = [];
    providedNodes.forEach((selectedNodeId: string) => {
      getPath(queryResult, queryResult.find((node) => node.id === selectedNodeId) as RawNode).forEach((nodeId) => {
        if (!expanded.includes(nodeId) && !extraExpansions.includes(nodeId)) {
          extraExpansions.push(nodeId);
        }
      });
    });

    setExpanded([...expanded, ...extraExpansions]);
    setSelected(providedNodes);
  }

  const renderTree = (nodes: Node[]) => {
    return nodes.map((node: Node) => {
      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={`${node.name}${
            (node.children || []).length !== 0 && options.showItemCount ? ` (${(node.children || []).length})` : ''
          }`}
        >
          {Array.isArray(node.children) ? renderTree(node.children) : null}
        </TreeItem>
      );
    });
  };

  return (
    <div className="treeView">
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect={options.multiSelect ? true : undefined}
      >
        {renderTree(tree)}
      </TreeView>
    </div>
  );
};
