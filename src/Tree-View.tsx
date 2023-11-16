import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView as XTreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, TreeItemProps, useTreeItem, TreeItemContentProps } from '@mui/x-tree-view/TreeItem';
import { ToggleMode, TreeNode, TreeViewOptions } from './models';
import { locationService } from '@grafana/runtime';
import { Tree } from 'tree';

export const TreeView = ({
  tree,
  options,
  expanded: baseExpanded,
}: {
  tree: Tree;
  options: TreeViewOptions;
  expanded: string[];
}) => {
  // TODO: track locationService updates from within the dashboard (https://github.com/BrightGrafana/bright-tree-panel/issues/16)
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

  // set inital selected based on url
  const providedNodeIds = getProvidedNodes(options.dashboardVariableName);

  const [expandedNodes, setExpanded] = React.useState<string[]>([
    ...baseExpanded,
    ...getProvidedNodes(options.dashboardVariableName).flatMap((providedNodeId) => tree.getPath(providedNodeId)),
  ]);
  const [selectedNodes, setSelected] = React.useState<string[]>(providedNodeIds);

  const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;
    const { disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection } =
      useTreeItem(nodeId);
    const icon = iconProp || expansionIcon || displayIcon;

    // prevent normale mouse handler
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (options.toggleMode === ToggleMode.Expanded) {
        return;
      }
      handleExpansion(event);
    };

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (
        (!expanded && options.toggleMode !== ToggleMode.ChevronOnly) ||
        options.toggleMode === ToggleMode.SingleClick
      ) {
        handleExpansion(event);
      }
      handleSelection(event);
    };

    return (
      <div
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}
        onMouseDown={handleMouseDown}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
          {label}
        </Typography>
      </div>
    );
  });

  const CustomTreeItem = React.forwardRef(function CustomTreeItem(props: TreeItemProps, ref: React.Ref<HTMLLIElement>) {
    return <TreeItem ContentComponent={CustomContent} {...props} ref={ref} />;
  });

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node: TreeNode) => {
      return (
        <CustomTreeItem
          key={node.id}
          nodeId={node.id}
          label={`${node.name}${
            (node.children || []).length !== 0 && options.showItemCount ? ` (${(node.children || []).length})` : ''
          }`}
        >
          {Array.isArray(node.children) ? renderTree(node.children) : null}
        </CustomTreeItem>
      );
    });
  };

  // still needed for keyboard toggle
  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);

    const urlNodeIds = typeof nodeIds === 'number' ? [nodeIds] : nodeIds;
    locationService.partial({ [`var-${options.dashboardVariableName}`]: urlNodeIds }, true);
  };
  // still needed for keyboard toggle
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  return (
    <>
      <XTreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expandedNodes}
        selected={selectedNodes}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect={options.multiSelect ? true : undefined}
      >
        {renderTree(tree.getTree())}
      </XTreeView>
    </>
  );
};
