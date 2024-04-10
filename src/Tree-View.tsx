import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SimpleTreeView  } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, TreeItemProps, useTreeItemState, TreeItemContentProps } from '@mui/x-tree-view/TreeItem';
import { ClickMode, ToggleMode, TreeNode, TreeViewOptions } from './models';
import { locationService } from '@grafana/runtime';
import { Input } from '@grafana/ui';
import { Tree } from './tree';

const Label = ({ label, filter }: { label: string | React.ReactNode; filter: string }) => {
  const startIndex = `${filter}`.length > 0 ? `${label}`.toLowerCase().indexOf(filter.toLowerCase()) : -1;

  return (
    <>
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
    </>
  );
};

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

  const CustomContent = React.forwardRef(function CustomContent(props: { link?: string } & TreeItemContentProps, ref) {
    const { classes, className, label, link, itemId, icon: iconProp, expansionIcon, displayIcon } = props;
    const { disabled, expanded, selected, focused, handleSelection, preventSelection } = useTreeItemState(itemId);
    const icon = iconProp || expansionIcon || displayIcon;

    // prevent normale mouse handler
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };

    const handleChevronClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      console.log(options.toggleMode, ToggleMode.NoToggle);
      if (options.toggleMode === ToggleMode.NoToggle) {
        console.log(`[handleChevronClick] node ${itemId} (no toggle)`);

        return;
      }

      if (!expanded) {
        console.log(`[handleChevronClick] expand node ${itemId}`);
        setExpanded([...expandedNodes, itemId]);
      } else {
        console.log(`[handleChevronClick] contract node ${itemId}`);
        setExpanded(expandedNodes.filter((expandedNode) => expandedNode !== itemId));
      }
    };

    const handleNodeSelection = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (options.toggleMode === ToggleMode.NoToggle || options.toggleMode === ToggleMode.ChevronOnly) {
        console.log(`[handleLabelClick] node ${itemId} (no label toggle)`);
      } else {
        if (!expanded) {
          console.log(`[handleLabelClick] expand node ${itemId}`);
          setExpanded([...expandedNodes, itemId]);
          console.log(`[handleLabelClick] expanded nodes ${expandedNodes.join(', ')}`);
        } else if (expanded && options.toggleMode === ToggleMode.SingleClick) {
          console.log(`[handleLabelClick] contract node ${itemId}`);
          setExpanded(expandedNodes.filter((expandedNode) => expandedNode !== itemId));
        } else if (expanded && options.toggleMode === ToggleMode.ExpandOnly) {
          console.log(`[handleLabelClick] node ${itemId} (no label toggle - expand only)`);
        }
      }

      if (options.clickMode === ClickMode.SetVariable) {
        console.log(`[handleNodeSelection] -> handleSelection()`);
        handleSelection(event);
      }
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
        <div onClick={handleChevronClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography onClick={handleNodeSelection} component="div" className={classes.label}>
          {options.clickMode === ClickMode.DataLink && !disabled && (link ? `${link}` : '').trim() !== '' ? (
            <a href={link} target={options.dataLinkNewTab ? '_blank' : undefined} rel="noreferrer">
              <Label label={label} filter={filter} />
            </a>
          ) : (
            <Label label={label} filter={filter} />
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
          itemId={node.id}
          label={`${node.name}${
            (node.children || []).length !== 0 && options.showItemCount ? ` (${(node.children || []).length})` : ''
          }`}
          disabled={options.supportsDisabled && node.disabled}
          ContentProps={{ link: node.link } as any}
        >
          {Array.isArray(node.children) ? renderTree(node.children) : null}
        </CustomTreeItem>
      );
    });
  };

  React.useEffect(() => {
    if (JSON.stringify(getProvidedNodes(dashboardVariableName)) === JSON.stringify(selectedNodes)) {
      return;
    }

    locationService.partial({ [`var-${dashboardVariableName}`]: selectedNodes }, true);
  }, [selectedNodes, dashboardVariableName]);

  // still needed for keyboard toggle
  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
  };

  // still needed for keyboard toggle
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    if (options.toggleMode === ToggleMode.NoToggle) {
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

  const [expandedNodesBeforeSearch, setExpandedBeforeSearch] = React.useState<string[]>([]);
  const [inSearch, setInSearch] = React.useState<boolean>(false);

  // update tree view in Tree (query result) changes
  React.useMemo(() => {
    if (inSearch) {
      const tempTree = tree.searchTree(filter);
      setTreeData(() => tempTree);
      // show search results fully expanded
      setExpanded(() => getAllIds(tempTree));
    } else {
      setTreeData(tree.getTree());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tree.getTree())]);

  const escape = (event: any) => {
    if (event.key === 'Escape') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(event.target, '');
      const onChangeEvent = new Event('input', { bubbles: true });
      event.target.dispatchEvent(onChangeEvent);
    }
  };

  const onSearchInput = (e: any) => {
    console.log(`[onSearchInput] ${inSearch}`, expandedNodesBeforeSearch);
    const value = e.target.value;
    const query = value.trim();
    setFilter(query);

    if (!query) {
      // deactivete serach mode: restore tree & restore expanded + posible new selection
      setInSearch(false);
      setTreeData(tree.getTree());
      setExpanded([
        ...new Set([
          ...expandedNodesBeforeSearch,
          ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
            const nodes = tree.getPath(providedNodeId);

            return nodes.filter((nodeId) => nodeId !== providedNodeId);
          }),
        ]),
      ]);

      return;
    }

    if (!inSearch) {
      // new search query
      // store expanded nodes before search
      setExpandedBeforeSearch([...expandedNodes]);
      setInSearch(true);
    }

    const tempTree = tree.searchTree(query);
    setTreeData(() => tempTree);
    // show search results fully expanded
    setExpanded(() => getAllIds(tempTree));
  };

  return (
    <>
      <table className="equansdatahub-tree-panel-table">
        {options.showSearch ? (
          <thead>
            <tr>
              <td>
                <div style={{ marginBottom: '16px' }}>
                  <Input placeholder="Search values" onChange={onSearchInput} type="search" onKeyDown={escape} />
                </div>
              </td>
            </tr>
          </thead>
        ) : null}
        <tbody>
          <tr>
            <td>
              <SimpleTreeView
                aria-label="controlled"
                slots={{  collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                expandedItems={expandedNodes}
                selectedItems={selectedNodes}
                onExpandedItemsChange={handleToggle}
                onSelectedItemsChange={handleSelect}
                multiSelect={options.multiSelect ? true : undefined}
                disabledItemsFocusable={false}
              >
                {renderTree(treeData)}
              </SimpleTreeView>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
