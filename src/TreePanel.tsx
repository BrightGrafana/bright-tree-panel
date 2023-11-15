import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import React from 'react';
import { PanelProps } from '@grafana/data';
import { TreeNode, PanelOptions, RawNode } from './models';
import { Utils } from './utils';
import { Validator } from './validator';
import { locationService } from '@grafana/runtime';
import './CSS/classes.css';
import { Tree } from 'tree';

export const TreePanel: React.FC<PanelProps<PanelOptions>> = ({ options, data }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  // Convert data to a Node array
  const queryResult: RawNode[] = React.useMemo(
    () => Utils.dfToNodeArray(data.series[0], options.idColumn, options.parentIdColumn, options.labelColumn),
    [data, options.idColumn, options.parentIdColumn, options.labelColumn]
  );
  Validator.validateTreeInput(queryResult);

  const newTree = React.useMemo(() => new Tree(queryResult, options.orderLevels), [queryResult, options.orderLevels]);

  // Determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => newTree.getNodeIdsForDepth(options.displayedTreeDepth),
    [newTree, options]
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
    const expandedBasedOnUrl: string[] = [];
    providedNodes.forEach((selectedNodeId: string) => {
      newTree.getPath(selectedNodeId).forEach((nodeId) => {
        if (!expanded.includes(nodeId) && !expandedBasedOnUrl.includes(nodeId)) {
          expandedBasedOnUrl.push(nodeId);
        }
      });
    });

    setExpanded([...expanded, ...expandedBasedOnUrl]);
    setSelected(providedNodes);
  }

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node: TreeNode) => {
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
        {renderTree(newTree.getTree())}
      </TreeView>
    </div>
  );
};
