import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView as XTreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, TreeItemProps, useTreeItem, TreeItemContentProps } from '@mui/x-tree-view/TreeItem';
import { ToggleMode, TreeNode, TreeViewOptions } from './models';
import { locationService } from '@grafana/runtime';
import { Input } from '@grafana/ui';
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
  const [filter, setFilter] = React.useState<string>('');
  const [treeData, setTreeData] = React.useState<TreeNode[]>(tree.getTree());

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
  const dashboardVariableName = React.useMemo(() => options.dashboardVariableName, [options.dashboardVariableName]);

  // set inital selected based on url
  const providedNodeIds = getProvidedNodes(dashboardVariableName);

  const [expandedNodes, setExpanded] = React.useState<string[]>([
    ...new Set([
      ...baseExpanded,
      ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
        const nodes = tree.getPath(providedNodeId);

        return nodes.filter((nodeId) => nodeId !== providedNodeId);
      }),
    ]),
  ]);

  const [selectedNodes, setSelected] = React.useState<string[]>(providedNodeIds);

  React.useEffect(() => {
    const history = locationService.getHistory();
    const unlisten = history.listen(() => {
      setSelected(() => {
        console.log('[history.listen] -> setSelected()');
        return getProvidedNodes(dashboardVariableName);
      });
      const tempExpandedNodes = [
        ...new Set([
          ...expandedNodes,
          ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
            const nodes = tree.getPath(providedNodeId);

            return nodes.filter((nodeId) => nodeId !== providedNodeId);
          }),
        ]),
      ];
      console.log(`[history.listen] ${expandedNodes.join(', ')}`);
      setExpanded(tempExpandedNodes);
    });

    return unlisten;
  }, [expandedNodes, dashboardVariableName, tree, options.toggleMode]);

  const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;
    const { disabled, expanded, selected, focused, handleSelection, preventSelection } = useTreeItem(nodeId);
    const icon = iconProp || expansionIcon || displayIcon;

    // prevent normale mouse handler
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };

    const handleChevronClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      console.log(options.toggleMode, ToggleMode.NoTogle);
      if (options.toggleMode === ToggleMode.NoTogle) {
        console.log(`[handleChevronClick] node ${nodeId} (no toggle)`);

        return;
      }

      if (!expanded) {
        console.log(`[handleChevronClick] expand node ${nodeId}`);
        setExpanded([...expandedNodes, nodeId]);
      } else {
        console.log(`[handleChevronClick] contract node ${nodeId}`);
        setExpanded(expandedNodes.filter((expandedNode) => expandedNode !== nodeId));
      }
    };

    const handleNodeSelection = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (options.toggleMode === ToggleMode.NoTogle || options.toggleMode === ToggleMode.ChevronOnly) {
        console.log(`[handleLabelClick] node ${nodeId} (no label toggle)`);
      } else {
        if (!expanded) {
          console.log(`[handleLabelClick] expand node ${nodeId}`);
          setExpanded([...expandedNodes, nodeId]);
          console.log(`[handleLabelClick] expanded nodes ${expandedNodes.join(', ')}`);
        } else if (expanded && options.toggleMode === ToggleMode.SingleClick) {
          console.log(`[handleLabelClick] contract node ${nodeId}`);
          setExpanded(expandedNodes.filter((expandedNode) => expandedNode !== nodeId));
        } else if (expanded && options.toggleMode === ToggleMode.ExpandOnly) {
          console.log(`[handleLabelClick] node ${nodeId} (no label toggle - expand only)`);
        }
      }

      console.log(`[handleNodeSelection] -> handleSelection()`);
      handleSelection(event);
    };

    const startIndex = `${filter}`.length > 0 ? `${label}`.toLowerCase().indexOf(filter.toLowerCase()) : -1;

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
        <div onClick={handleChevronClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography onClick={handleNodeSelection} component="div" className={classes.label}>
          {startIndex > -1 ? (
            <>
              <span>{`${label}`.slice(0, startIndex)}</span>
              <span style={{ textDecoration: 'underline' }}>
                {`${label}`.slice(startIndex, startIndex + `${filter}`.length)}
              </span>
              <span>{`${label}`.slice(startIndex + `${filter}`.length)}</span>
            </>
          ) : (
            label
          )}
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

  React.useEffect(() => {
    if (JSON.stringify(getProvidedNodes(dashboardVariableName)) === JSON.stringify(selectedNodes)) return;

    locationService.partial({ [`var-${dashboardVariableName}`]: selectedNodes }, true);
  }, [selectedNodes, dashboardVariableName]);

  // still needed for keyboard toggle
  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
  };

  // still needed for keyboard toggle
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    if (options.toggleMode === ToggleMode.NoTogle) {
      console.log(`[handleToggle] (no toggle)`);

      return;
    }
    setExpanded(nodeIds);
  };

  const getAllIds = (inputTree: TreeNode[]): string[] => {
    const traverse = (nodes: TreeNode[], currentDepth: number): string[] => {
      const result: string[] = [];

      for (const node of nodes) {
        result.push(node.id);
        result.push(...traverse(node.children || [], currentDepth + 1));
      }

      return result;
    };

    return traverse(inputTree, 0);
  };

  const onSearchInput = (e: any) => {
    const value = e.target.value;
    const newFilter = value.trim();
    setFilter(newFilter);

    if (!newFilter) {
      setTreeData(tree.getTree());
      setExpanded([
        ...baseExpanded,
        ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => tree.getPath(providedNodeId)),
      ]);

      return;
    }

    const tempTree = tree.searchTree(newFilter);

    setTreeData(() => tempTree);
    // show search results fully expanded
    setExpanded(() => getAllIds(tempTree));
  };

  return (
    <>
      {options.showSearch ? <Input placeholder="Search values" onChange={onSearchInput} /> : null}
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
        {renderTree(treeData)}
      </XTreeView>
    </>
  );
};
