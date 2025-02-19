import React from 'react';
import clsx from 'clsx';
import { locationService } from '@grafana/runtime';
import { Tree } from 'tree';
import { ClickMode, ToggleMode, TreeNode, TreeViewOptions } from 'types';
import {
  RichTreeView,
  TreeItemCheckbox,
  TreeItemContent,
  TreeItemDragAndDropOverlay,
  TreeItemGroupTransition,
  TreeItemIcon,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemProps,
  TreeItemProvider,
  TreeItemRoot,
  TreeViewBaseItem,
  useTreeItem,
  UseTreeItemContentSlotOwnProps,
  UseTreeItemIconContainerSlotOwnProps,
  useTreeItemModel, useTreeItemUtils,
} from '@mui/x-tree-view';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TreeViewDefaultItemModelProperties } from '@mui/x-tree-view/models/items';
import { Typography } from '@mui/material';
import { Input } from '@grafana/ui';

const Label = (props: { label: string | React.ReactNode; filter: string }) => {
  const filter = `${props.filter}`;
  const label = `${props.label}`;
  const startIndex = filter.length > 0 ? label.toLowerCase().indexOf(filter.toLowerCase()) : -1;

  return (
    <>
      {startIndex !== -1 ? (
        <>
          <span>{label.slice(0, startIndex)}</span>
          <span style={{ textDecoration: 'underline' }}>{label.slice(startIndex, startIndex + filter.length)}</span>
          <span>{label.slice(startIndex + filter.length)}</span>
        </>
      ) : (
        label
      )}
    </>
  );
};

type ExtendedTreeItemProps = TreeViewDefaultItemModelProperties & {
  disabled: boolean | undefined;
  link: string | undefined;
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

  // set initial selected based on url
  const providedNodeIds = getProvidedNodes(dashboardVariableName);

  const [expandedItems, setExpanded] = React.useState<string[]>([
    ...new Set([
      ...baseExpanded,
      ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
        const nodes = tree.getPath(providedNodeId);

        return nodes.filter((nodeId) => nodeId !== providedNodeId);
      }),
    ]),
  ]);

  const [selectedItems, setSelected] = React.useState<string[]>(providedNodeIds);

  React.useEffect(() => {
    const history = locationService.getHistory();
    return history.listen(() => {
      setSelected(() => getProvidedNodes(dashboardVariableName));
      const tempExpandedNodes = [
        ...new Set([
          ...expandedItems,
          ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
            const nodes = tree.getPath(providedNodeId);

            return nodes.filter((nodeId) => nodeId !== providedNodeId);
          }),
        ]),
      ];
      setExpanded(tempExpandedNodes);
    });
  }, [expandedItems, dashboardVariableName, tree, options.toggleMode]);

  const [filter, setFilter] = React.useState<string>('');

  const CustomTreeItem = React.forwardRef(function CustomTreeItem(props: TreeItemProps, ref: React.Ref<HTMLLIElement>) {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getContextProviderProps,
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });
    const model = useTreeItemModel<ExtendedTreeItemProps>(itemId)!;

    const { interactions } = useTreeItemUtils({ itemId, children });

    const onTreeItemContentMouseDown: UseTreeItemContentSlotOwnProps['onMouseDown'] = (event) => {
      event.defaultMuiPrevented = true;
    };

    const onTreeItemIconContainerClick: UseTreeItemIconContainerSlotOwnProps['onClick'] = (event) => {
      event.defaultMuiPrevented = true;
    };

    const onTreeItemContentClick: UseTreeItemContentSlotOwnProps['onClick'] = (event) => {
      const onChevronClick = ['path', 'svg'].includes((event.target as HTMLElement).nodeName);
      if (onChevronClick) {
        if ((model.children ?? []).length > 0 && options.toggleMode !== ToggleMode.NoTogle) {
          if (status.expanded) {
            setExpanded(expandedItems.filter((expandedItem) => expandedItem !== itemId));
          } else {
            setExpanded([...expandedItems, itemId]);
          }
        }
        return;
      }

      if ((model.children ?? []).length > 0) {
        if (options.toggleMode !== ToggleMode.NoTogle && options.toggleMode !== ToggleMode.ChevronOnly) {
          if (status.expanded) {
            if (options.toggleMode === ToggleMode.SingleClick) {
              setExpanded(expandedItems.filter((expandedItem) => expandedItem !== itemId));
            }
          } else {
            setExpanded([...expandedItems, itemId]);
          }
        }
      }

      if (options.clickMode === ClickMode.SetVariable) {
        interactions.handleSelection(event);
      }

      event.defaultMuiPrevented = true;
    };

    return (
      <TreeItemProvider {...getContextProviderProps()}>
        <TreeItemRoot {...(getRootProps(other) as {})}>
          <TreeItemContent
            {...getContentProps({
              onMouseDown: onTreeItemContentMouseDown,
              onClick: onTreeItemContentClick,
              className: clsx('content', {
                'Mui-expanded': status.expanded,
                'Mui-selected': status.selected,
                'Mui-focused': status.focused,
                'Mui-disabled': status.disabled,
                'custom-selected': status.selected,
              }),
            })}
          >
            <TreeItemIconContainer
              {...getIconContainerProps({
                onClick: onTreeItemIconContainerClick,
              })}
            >
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>
            <TreeItemCheckbox {...getCheckboxProps()} />
            <TreeItemLabel {...getLabelProps()}>
              <Typography component="div" className={props.classes?.label}>
                {options.clickMode === ClickMode.DataLink &&
                !disabled &&
                (model.link ? `${model.link}` : '').trim() !== '' ? (
                  <a href={model.link} target={options.dataLinkNewTab ? '_blank' : undefined} rel="noreferrer">
                    <Label label={label} filter={filter} />
                  </a>
                ) : (
                  <Label label={label} filter={filter} />
                )}
              </Typography>
            </TreeItemLabel>
            <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </TreeItemContent>
          {children && <TreeItemGroupTransition {...getGroupTransitionProps()} />}
        </TreeItemRoot>
      </TreeItemProvider>
    );
  });

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node: TreeNode) => {
      const item: TreeViewBaseItem<ExtendedTreeItemProps> = {
        id: node.id,
        label: `${node.name}${
          (node.children || []).length !== 0 && options.showItemCount ? ` (${(node.children || []).length})` : ``
        }`,
        children: Array.isArray(node.children) ? renderTree(node.children) : undefined,
        disabled: options.supportsDisabled ? node.disabled : undefined,
        link: node.link,
      };
      return item;
    });
  };

  React.useEffect(() => {
    if (JSON.stringify(getProvidedNodes(dashboardVariableName)) === JSON.stringify(selectedItems)) {
      return;
    }

    locationService.partial({ [`var-${dashboardVariableName}`]: selectedItems }, true);
  }, [selectedItems, dashboardVariableName]);

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
    const value = e.target.value;
    const query = value.trim();
    setFilter(query);

    if (!query) {
      // deactivate search mode: restore tree & restore expanded + possible new selection
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
      // new search query, store expanded nodes before search
      setExpandedBeforeSearch([...expandedItems]);
      setInSearch(true);
    }

    const searchResults = tree.searchTree(query);
    setTreeData(() => searchResults);
    // show search results fully expanded
    setExpanded(() => getAllIds(searchResults));
  };

  return (
    <>
      <table className="bright-tree-panel-table">
        {options.showSearch ? (
          <thead>
            <tr>
              <td>
                <div style={{ marginBottom: '16px' }}>
                  <Input
                    data-testid={'search-input'}
                    placeholder="Search values"
                    onChange={onSearchInput}
                    type="search"
                    onKeyDown={escape}
                  />
                </div>
              </td>
            </tr>
          </thead>
        ) : null}
        <tbody>
          <tr>
            <td>
              <RichTreeView
                aria-label="controlled"
                slots={{
                  expandIcon: ChevronRightIcon,
                  collapseIcon: ExpandMoreIcon,
                  item: CustomTreeItem,
                }}
                expandedItems={expandedItems}
                onExpandedItemsChange={(_: React.SyntheticEvent, itemIds: string[]) => {
                  if (options.toggleMode !== ToggleMode.NoTogle) {
                    setExpanded(itemIds);
                  }
                }}
                expansionTrigger={'content'}
                selectedItems={selectedItems}
                multiSelect={options.multiSelect}
                onSelectedItemsChange={(_: React.SyntheticEvent, itemIds: string[] | string | null) => {
                  setSelected(Array.isArray(itemIds) ? itemIds : itemIds !== null ? [itemIds] : []);
                }}
                disabledItemsFocusable={true}
                items={renderTree(treeData)}
                isItemDisabled={(item) => options.supportsDisabled && (item.disabled ?? false)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
