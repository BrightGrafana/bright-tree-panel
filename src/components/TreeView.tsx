import React, { useId } from 'react';
import clsx from 'clsx';
import { locationService } from '@grafana/runtime';
import { Tree } from 'tree';
import { ClickMode, IconClickMode, TreeNode, TreeViewOptions } from 'types';
import { Box, Checkbox, Icon, InlineField, InlineFieldRow, InlineSwitch, Input, toIconName } from '@grafana/ui';
import { findMatch, hasMatch } from '../valueMapping';

const CustomLabel = (props: { label: string | React.ReactNode; filter: string }) => {
  const filter = `${props.filter}`;
  const label = `${props.label}`;
  const startIndex = filter.length > 0 ? label.toLowerCase().indexOf(filter.toLowerCase()) : -1;

  return (
    <>
      {startIndex !== -1 ? (
        <>
          <span dangerouslySetInnerHTML={{ __html: label.slice(0, startIndex).replace(' ', '&nbsp;') }} />
          <span
            style={{ textDecoration: 'underline' }}
            dangerouslySetInnerHTML={{
              __html: label.slice(startIndex, startIndex + filter.length).replace(' ', '&nbsp;'),
            }}
          />
          <span dangerouslySetInnerHTML={{ __html: label.slice(startIndex + filter.length).replace(' ', '&nbsp;') }} />
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
  const getTreeNodeIds = React.useCallback((nodes: TreeNode[], currentDepth = 0): string[] => {
    const result: string[] = [];
    for (const node of nodes) {
      result.push(node.id);
      result.push(...getTreeNodeIds(node.children || [], currentDepth + 1));
    }
    return result;
  }, []);

  const allTreeNodeIds = React.useMemo(() => getTreeNodeIds(tree.value(), 0), [tree, getTreeNodeIds]);

  const getEnabledTreeNodeIds = React.useCallback((nodes: TreeNode[], currentDepth = 0): string[] => {
    const result: string[] = [];
    for (const node of nodes) {
      if (!node.disabled) {
        result.push(node.id);
      }
      result.push(...getEnabledTreeNodeIds(node.children || [], currentDepth + 1));
    }
    return result;
  }, []);

  const enabledTreeNodeIds = React.useMemo(() => getEnabledTreeNodeIds(tree.value(), 0), [tree, getEnabledTreeNodeIds]);

  const includesAllTreeNodeIds = React.useCallback(
    (ids: string[]) => ids.length === allTreeNodeIds.length && ids.every((id) => allTreeNodeIds.includes(id)),
    [allTreeNodeIds]
  );

  const includesAllEnabledTreeNodeIds = React.useCallback(
    (ids: string[]) => ids.length === enabledTreeNodeIds.length && ids.every((id) => enabledTreeNodeIds.includes(id)),
    [enabledTreeNodeIds]
  );

  /**
   * Parse input value from various possible formats into string array
   * @param input The input value from URL params or other sources
   * @param allValues Optional array of all possible values for '$__all' keyword
   */
  const parseInputValue = React.useCallback((input: any, allValues?: string[]): string[] => {
    if (input === null || input === undefined || input === '') {
      return [];
    }

    // check for '$__all' keyword and substitute with ids
    if (input === '$__all' && allValues) {
      return allValues.map((id) => `${id}`);
    }

    // if input is already an array, convert all elements to strings
    if (Array.isArray(input)) {
      return input.map((value) => `${value}`);
    }

    // if input is a string, split it by comma in case it's a comma-separated list
    if (typeof input === 'string') {
      return input.split(',').map((id) => id.trim());
    }

    return [`${input}`];
  }, []);

  const getProvidedNodes = React.useCallback(
    (dashboardVariableName: string): string[] => {
      const input = locationService.getSearchObject()[`var-${dashboardVariableName}`];
      return parseInputValue(
        input,
        options.showCheckbox && options.enableSelectDeselectAll && !options.includeDisabled
          ? enabledTreeNodeIds
          : allTreeNodeIds
      );
    },
    [
      allTreeNodeIds,
      enabledTreeNodeIds,
      parseInputValue,
      options.showCheckbox,
      options.enableSelectDeselectAll,
      options.includeDisabled,
    ]
  );

  const dashboardVariableName = React.useMemo(() => options.dashboardVariableName, [options.dashboardVariableName]);

  // set initial selected based on url
  const providedNodeIds = getProvidedNodes(dashboardVariableName);

  const [expandedNodes, setExpanded] = React.useState<string[]>([
    ...new Set([
      ...baseExpanded,
      ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) => {
        const nodes = tree.path(providedNodeId);
        return nodes.filter((nodeId) => nodeId !== providedNodeId);
      }),
    ]),
  ]);

  const [selectedNodes, setSelected] = React.useState<string[]>(providedNodeIds);

  const [allNoneSelected, setAllNoneSelected] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const all =
      options.showCheckbox && options.enableSelectDeselectAll && !options.includeDisabled
        ? enabledTreeNodeIds.every((nodeId: string) => selectedNodes.includes(nodeId))
        : allTreeNodeIds.every((nodeId: string) => selectedNodes.includes(nodeId));
    const none = selectedNodes.length === 0;
    setAllNoneSelected(none ? false : all ? all : undefined);
  }, [
    enabledTreeNodeIds,
    allTreeNodeIds,
    selectedNodes,
    setAllNoneSelected,
    options.showCheckbox,
    options.enableSelectDeselectAll,
    options.includeDisabled,
  ]);

  React.useEffect(() => {
    const history = locationService.getHistory();
    return history.listen(() => {
      setSelected(() => getProvidedNodes(dashboardVariableName));
      setExpanded((expandedNodes) => [
        ...new Set([
          ...expandedNodes,
          ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) =>
            tree.path(providedNodeId).filter((nodeId) => nodeId !== providedNodeId)
          ),
        ]),
      ]);
    });
  }, [dashboardVariableName, tree, getProvidedNodes]);

  /**
   * Checks if two arrays of node IDs contain the same elements (order independent)
   */
  const areNodeSelectionsEqual = React.useCallback((nodes1: string[], nodes2: string[]): boolean => {
    return nodes1.length === nodes2.length && nodes1.every((nodeId) => nodes2.includes(nodeId));
  }, []);

  React.useEffect(() => {
    const providedNodes = getProvidedNodes(dashboardVariableName);
    if (areNodeSelectionsEqual(providedNodes, selectedNodes)) {
      return;
    }

    if (options.showCheckbox && options.enableSelectDeselectAll && !options.includeDisabled) {
      const value = includesAllEnabledTreeNodeIds(selectedNodes)
        ? '$__all'
        : selectedNodes.length > 0
        ? selectedNodes
        : [];
      locationService.partial({ [`var-${dashboardVariableName}`]: value }, true);
    } else {
      const value = includesAllTreeNodeIds(selectedNodes) ? '$__all' : selectedNodes.length > 0 ? selectedNodes : [];
      locationService.partial({ [`var-${dashboardVariableName}`]: value }, true);
    }
  }, [
    selectedNodes,
    dashboardVariableName,
    getProvidedNodes,
    includesAllTreeNodeIds,
    includesAllEnabledTreeNodeIds,
    areNodeSelectionsEqual,
    options.showCheckbox,
    options.enableSelectDeselectAll,
    options.includeDisabled,
  ]);

  const [searchFilter, setSearchFilter] = React.useState<string>('');
  const [useFilterFn, setUseFilterFn] = React.useState<boolean>(false);
  const [inSearch, setInSearch] = React.useState<boolean>(false);
  const [expandedNodesBeforeSearch, setExpandedBeforeSearch] = React.useState<string[]>([]);
  const [treeData, setTreeData] = React.useState<TreeNode[]>(tree.value());

  const escapeHTMLInputElement: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Escape') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(event.target, '');
      const onChangeEvent = new Event('input', { bubbles: true });
      event.target.dispatchEvent(onChangeEvent);
    }
  };

  const ARROW_KEYS = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
  const isArrowKey = (key: string): boolean => ARROW_KEYS.includes(key);

  const ACTION_CODES = ['Enter', 'Space'];
  const isActionCode = (code: string): boolean => ACTION_CODES.includes(code);

  const filterFn = (node: TreeNode) => {
    if (!node.additionalData || !options.iconColumn || !options.iconMappings.valueMappings) {
      return false;
    }
    return hasMatch(node.additionalData[options.iconColumn], options.iconMappings.valueMappings);
  };

  // update tree view when the filter changes
  React.useMemo(() => {
    if (inSearch) {
      const searchResult = tree.findAll(searchFilter);
      const filtered = useFilterFn ? tree.filter(filterFn, searchResult) : searchResult;
      setTreeData(() => filtered);
      setExpanded(() => getTreeNodeIds(filtered, 0));
    } else {
      if (useFilterFn) {
        const filtered = tree.filter(filterFn);
        setTreeData(() => filtered);
        setExpanded(() => getTreeNodeIds(filtered, 0));
      } else {
        setTreeData(tree.value());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tree.value()), useFilterFn]);

  const handleSearchInput: React.FormEventHandler<HTMLInputElement> = (event) => {
    const searchTerm = (event.target as HTMLInputElement).value;
    setSearchTerm(searchTerm);
  };

  const setSearchTerm = (searchTerm: string) => {
    setSearchFilter(searchTerm);

    if (!searchTerm || searchTerm.length === 0) {
      // deactivate search mode: restore tree & restore expanded + possible new selection
      setInSearch(false);
      if (useFilterFn) {
        const filtered = tree.filter(filterFn);
        setTreeData(() => filtered);
        setExpanded([
          ...new Set([
            ...expandedNodesBeforeSearch,
            ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) =>
              tree.path(providedNodeId, filtered).filter((nodeId) => nodeId !== providedNodeId)
            ),
          ]),
        ]);
      } else {
        setTreeData(tree.value());
        setExpanded([
          ...new Set([
            ...expandedNodesBeforeSearch,
            ...getProvidedNodes(dashboardVariableName).flatMap((providedNodeId) =>
              tree.path(providedNodeId).filter((nodeId) => nodeId !== providedNodeId)
            ),
          ]),
        ]);
      }

      return;
    }

    if (!inSearch) {
      // new search query, store expanded nodes before search
      setExpandedBeforeSearch([...expandedNodes]);
      setInSearch(true);
    }

    // show search results fully expanded
    const searchResult = tree.findAll(searchFilter);
    const filtered = useFilterFn ? tree.filter(filterFn, searchResult) : searchResult;
    setTreeData(() => filtered);
    setExpanded(() => getTreeNodeIds(filtered, 0));
  };

  const renderCellContent = (value: any, columnName: string, nodeId: string) => {
    const testId = `cell-${columnName}-${nodeId}`;

    if (!options.valueMappings || !options.valueMappings[columnName]) {
      return (
        <span data-testid={testId}>
          <CustomLabel label={value} filter={searchFilter} />
        </span>
      );
    }

    const mapping = findMatch(value, options.valueMappings[columnName]);

    if (mapping) {
      const style = mapping.result.color
        ? ({
            '--value-color': mapping.result.color,
            color: mapping.result.color, // Add direct color for testing environments
          } as React.CSSProperties)
        : {};

      return (
        <span data-testid={testId} className="mapped-value">
          <span className="mapped-value-inner" style={style} data-has-color={!!mapping.result.color}>
            <CustomLabel label={mapping.result.text || value} filter={searchFilter} />
          </span>
        </span>
      );
    }

    return (
      <span data-testid={testId}>
        <CustomLabel label={value} filter={searchFilter} />
      </span>
    );
  };

  const treeNodes = tree.flatten(expandedNodes, 0, treeData);
  const [activeNodeId, setActiveNodeId] = React.useState<string | null | undefined>(undefined);

  const handleTableFocus: React.FocusEventHandler = (event) => {
    if (
      event.relatedTarget?.localName === 'tr' ||
      event.relatedTarget?.localName === 'input' ||
      event.relatedTarget === null
    ) {
      return;
    }
    setActiveNodeId(treeNodes[0]?.node?.id ?? undefined);
  };

  const handleTableBlur: React.FocusEventHandler = (event) => {
    if (
      event.target?.localName === 'input' ||
      event.target?.parentElement?.parentElement?.id === event.relatedTarget?.parentElement?.parentElement?.id
    ) {
      return;
    }
    setActiveNodeId(undefined);
  };

  const handleTableRowClick = (node: TreeNode, event: React.MouseEvent) => {
    if (options.clickMode === ClickMode.SetVariable || options.clickMode === ClickMode.Both) {
      if (options.multiSelect && (event.ctrlKey || event.metaKey || event.shiftKey)) {
        // clear selected text
        window?.getSelection()?.empty();
        window?.getSelection()?.removeAllRanges();

        setSelected((prev) => {
          if (event.shiftKey && activeNodeId !== null) {
            // calculated selected range
            const nodeIds = tree.flatten(expandedNodes, 0, treeData).map((item) => item.node.id);
            const fromIndex = nodeIds.findIndex((value) => value === activeNodeId);
            const toIndex = nodeIds.findIndex((value) => value === node.id);
            if (fromIndex > -1 && toIndex > -1) {
              const startIndex = fromIndex > toIndex ? toIndex : fromIndex;
              const endIndex = fromIndex > toIndex ? fromIndex : toIndex;
              return [...new Set([...prev, ...nodeIds.slice(startIndex, endIndex + 1)])];
            }
          }
          return prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id];
        });
      } else {
        setSelected([node.id]);
      }
    } else if (options.clickMode === ClickMode.DataLink && node.link) {
      window.open(node.link, options.dataLinkNewTab ? '_blank' : '_self');
    }
    setActiveNodeId(node.id);
  };

  const handleCheckboxChange = (node: TreeNode, event: React.FormEvent) => {
    if (options.clickMode === ClickMode.SetVariable || options.clickMode === ClickMode.Both) {
      if (options.multiSelect) {
        setSelected((prev) => {
          return prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id];
        });
      } else {
        setSelected([node.id]);
      }
    }
    setActiveNodeId(node.id);
  };

  const toggleSelectAll = () => {
    const shouldSelectAll =
      selectedNodes.length !==
      (options.showCheckbox && options.enableSelectDeselectAll && !options.includeDisabled
        ? enabledTreeNodeIds.length
        : allTreeNodeIds.length);
    const ids = shouldSelectAll
      ? [
          ...(options.showCheckbox && options.enableSelectDeselectAll && !options.includeDisabled
            ? enabledTreeNodeIds
            : allTreeNodeIds),
        ]
      : [];

    if (shouldSelectAll) {
      setExpanded(ids);
    }
    setSelected(ids);
  };

  const handleCheckboxSelectDeselectAllChange = (event: React.FormEvent) => {
    toggleSelectAll();
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (!isArrowKey(event.key) && !isActionCode(event.code)) {
      return;
    }

    if (event.key === 'ArrowDown') {
      setActiveNodeId((nodeId) => {
        const index = treeNodes.findIndex((item) => item.node.id === nodeId);
        return index === treeNodes.length - 1 ? nodeId : treeNodes[index + 1].node.id;
      });
    }

    if (event.key === 'ArrowUp') {
      if (activeNodeId === null) {
        return; // no active node id
      }
      setActiveNodeId((nodeId) => {
        const index = treeNodes.findIndex((item) => item.node.id === nodeId);
        return index === 0 ? null : treeNodes[index - 1].node.id;
      });
    }

    if (event.key === 'ArrowLeft') {
      if (activeNodeId === null || activeNodeId === undefined) {
        return; // no active node id
      }
      if (expandedNodes.includes(activeNodeId)) {
        setExpanded(expandedNodes.filter((id) => id !== activeNodeId));
      }
    }

    if (event.key === 'ArrowRight') {
      if (activeNodeId === null || activeNodeId === undefined) {
        return; // no active node id
      }
      const itemOption = treeNodes.find((item) => item.node.id === activeNodeId);
      if (itemOption === undefined) {
        return; // active node not visible
      }
      if (!expandedNodes.includes(activeNodeId) && itemOption.node.children.length > 0) {
        setExpanded([...expandedNodes, activeNodeId]);
      }
    }

    if (event.code === 'Space') {
      if (activeNodeId === undefined) {
        return; // no active node id
      }
      if (activeNodeId === null) {
        toggleSelectAll();
        return;
      }
      const itemOption = treeNodes.find((item) => item.node.id === activeNodeId);
      if (itemOption === undefined) {
        return; // active node not visible
      }
      if (!selectedNodes.includes(activeNodeId) && !itemOption.node.disabled) {
        setSelected(options.multiSelect ? (selectedNodes) => [...selectedNodes, activeNodeId] : [activeNodeId]);
      } else if (selectedNodes.includes(activeNodeId) && !itemOption.node.disabled) {
        setSelected(options.multiSelect ? (selectedNodes) => selectedNodes.filter((id) => id !== activeNodeId) : []);
      }
    }

    if (event.code === 'Enter') {
      if (activeNodeId === undefined) {
        return; // no active node id
      }
      if (activeNodeId === null) {
        toggleSelectAll();
        return;
      }
      const itemOption = treeNodes.find((item) => item.node.id === activeNodeId);
      if (itemOption === undefined) {
        return; // active node not visible
      }
      if (!selectedNodes.includes(activeNodeId) && !itemOption.node.disabled) {
        setSelected([activeNodeId]); // mark current node as selected
      } else if (selectedNodes.includes(activeNodeId) && !itemOption.node.disabled) {
        setSelected([]); // since this node is selected, unmark it as selected
      }
    }

    event.preventDefault();
  };

  const handleIconClick = (event: React.MouseEvent, node: TreeNode, children: TreeNode[]) => {
    if (node.disabled) {
      return;
    }
    if (options.iconClickMode === IconClickMode.Expand) {
      setExpanded((expandedNodes) => [
        ...new Set([
          ...expandedNodes,
          ...children
            .filter((child) => !child.disabled)
            .flatMap((child) => tree.path(child.id).filter((nodeId) => nodeId !== child.id)),
        ]),
      ]);
    }
    if (options.iconClickMode === IconClickMode.Select) {
      setSelected(children.filter((child) => !child.disabled).map((node) => node.id));
    }
    event.stopPropagation();
  };

  const showIconColumn = options.iconColumn && options.iconMappings.valueMappings.length > 0;
  const showParentIconColumn =
    showIconColumn && options.parentIconColumn && options.parentIconMappings.valueMappings.length > 0;

  const renderIcons = (node: TreeNode) => {
    if (!showIconColumn) {
      return <></>;
    }

    const iconMappingResultOption = findMatch(
      node.additionalData?.[options.iconColumn],
      options.iconMappings.valueMappings
    );
    const iconNameOption =
      iconMappingResultOption !== null ? toIconName(iconMappingResultOption.result.text) : undefined;

    const iconColorMappingResultOption = findMatch(
      node.additionalData?.[options.iconColorColumn],
      options.iconColorMappings.valueMappings
    );
    const iconStyle = {
      verticalAlign: 'baseline',
      ...(iconColorMappingResultOption !== null && { color: iconColorMappingResultOption.result.color }),
    };

    if (!showParentIconColumn) {
      if (iconNameOption !== undefined) {
        return (
          <td className={'iconContent'} style={{ width: '1px' }}>
            <Icon name={iconNameOption} style={iconStyle} tabIndex={-1} />
          </td>
        );
      }
      return <td className={'iconSlot'} style={{ width: '1px' }}></td>;
    }

    const children = tree.flatFilter(filterFn, node.children);

    const iconMappings = children
      .map((node) =>
        findMatch(node.additionalData?.[options.parentIconColumn], options.parentIconMappings.valueMappings)
      )
      .filter((value) => value !== null);
    const parentIconMappingResultOption =
      iconMappings.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0))[0] ?? null;

    const filteredChildren =
      parentIconMappingResultOption !== null
        ? children.filter((node) =>
            hasMatch(node.additionalData?.[options.parentIconColumn], options.parentIconMappings.valueMappings)
          )
        : [];
    const parentIconVisible = filteredChildren.length > 0;
    const parentIconNameOption =
      parentIconMappingResultOption !== null ? toIconName(parentIconMappingResultOption.result.text) : undefined;
    const parentIconMappings = children
      .map((node) =>
        findMatch(node.additionalData?.[options.parentIconColorColumn], options.parentIconColorMappings.valueMappings)
      )
      .filter((value) => value !== null);
    const parentIconColorMappingResultOption =
      parentIconMappings.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0))[0] ?? null;

    const parentIconStyle =
      parentIconColorMappingResultOption !== null ? { color: parentIconColorMappingResultOption.result.color } : {};

    return (
      <>
        {parentIconVisible && parentIconNameOption !== undefined ? (
          <td className={'parentIconContent'} style={{ width: '1px' }}>
            <Icon
              onClick={(event) => handleIconClick(event, node, filteredChildren)}
              aria-label={options.iconClickTooltip}
              name={parentIconNameOption}
              style={parentIconStyle}
              tabIndex={-1}
            />
          </td>
        ) : (
          <td className={'parentIconSlot'}></td>
        )}
        {iconNameOption !== undefined ? (
          <td className={'iconContent'} style={{ width: '1px' }}>
            <Icon name={iconNameOption} style={iconStyle} tabIndex={-1} />
          </td>
        ) : (
          <td className={'iconSlot'}></td>
        )}
      </>
    );
  };

  const renderCheckbox = (node: TreeNode) => {
    if (!options.showCheckbox) {
      return <></>;
    }

    return (
      <td style={{ width: '1px' }} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          tabIndex={-1}
          checked={selectedNodes.includes(node.id)}
          onChange={(e) => {
            handleCheckboxChange(node, e);
          }}
        />
      </td>
    );
  };

  const id = useId();

  return (
    <>
      {options.showSearch && (
        <Box marginBottom={2} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Input
            prefix={<Icon name="search" />}
            placeholder={options.searchPlaceholder}
            onChange={handleSearchInput}
            value={searchFilter}
            type="search"
            onKeyDown={escapeHTMLInputElement}
            suffix={
              searchFilter &&
              searchFilter.length > 0 && (
                <Icon
                  name="times"
                  onClick={(event) => {
                    setSearchTerm('');
                    event.preventDefault();
                  }}
                />
              )
            }
            data-testid="search-input"
          />
          {options.showIconFilter && (
            <InlineFieldRow>
              <InlineField label={options.iconFilterLabel} style={{ margin: 0 }}>
                <InlineSwitch value={useFilterFn} onChange={(e) => setUseFilterFn(e.currentTarget.checked)} />
              </InlineField>
            </InlineFieldRow>
          )}
        </Box>
      )}
      <table
        className={`bright-tree-panel-table grid-lines ${!options.showGridLines ? 'no-grid-lines' : ''} ${
          options.compactMode ? 'compact-mode' : ''
        }`}
        id={id}
        tabIndex={-1}
        onFocus={handleTableFocus}
        onBlur={handleTableBlur}
        onKeyDown={handleKeyDown}
      >
        {options.showColumnHeaders && (
          <thead>
            <tr>
              {showParentIconColumn && <th className={'parentIconSlot'}></th>}
              {showIconColumn && <th className={'iconSlot'}></th>}
              {options.showCheckbox && <th></th>}
              <th style={{ paddingLeft: '16px' }}>{options.labelColumn}</th>
              {options.additionalColumns && options.additionalColumns.map((col, index) => <th key={col}>{col}</th>)}
            </tr>
          </thead>
        )}
        {
          <tbody>
            {options.showCheckbox && options.enableSelectDeselectAll && (
              <tr
                onClick={(e) => {
                  handleCheckboxSelectDeselectAllChange(e);
                }}
                className={clsx({
                  'active-node': activeNodeId === null,
                })}
                onFocus={(e) => {
                  setActiveNodeId(null);
                }}
                tabIndex={0}
              >
                {showParentIconColumn && <td className={'parentIconSlot'}></td>}
                {showIconColumn && <td className={'iconSlot'}></td>}
                <td>
                  <Checkbox tabIndex={-1} checked={allNoneSelected} />
                </td>
                <td>
                  <span style={{ marginLeft: `16px` }}>Select all / Deselect all</span>
                </td>
                {options.additionalColumns && options.additionalColumns.map((col) => <td key={col}></td>)}
              </tr>
            )}
            {tree.flatten(expandedNodes, 0, treeData).map(({ node, depth }, index) => {
              return (
                <tr
                  key={node.id}
                  className={clsx({
                    'disabled-node': options.supportsDisabled && node.disabled,
                    'selected-node': selectedNodes.includes(node.id),
                    'active-node': activeNodeId === node.id,
                  })}
                  onClick={(e) => handleTableRowClick(node, e)}
                  tabIndex={index === 0 ? -1 : -1}
                >
                  {renderIcons(node)}
                  {renderCheckbox(node)}
                  <td>
                    <span
                      style={{ marginLeft: `${(depth + (node.children && node.children.length > 0 ? 0 : 1)) * 16}px` }}
                    >
                      {node.children && node.children.length > 0 && (
                        <Icon
                          onClick={(e) => {
                            e.stopPropagation();
                            expandedNodes.includes(node.id)
                              ? setExpanded(expandedNodes.filter((id) => id !== node.id))
                              : setExpanded([...expandedNodes, node.id]);
                          }}
                          aria-label={expandedNodes.includes(node.id) ? 'Click to collapse' : 'Click to expand'}
                          name={expandedNodes.includes(node.id) ? 'angle-down' : 'angle-right'}
                          tabIndex={-1}
                        />
                      )}
                      {renderCellContent(node.name, options.labelColumn, node.id)}
                      {options.clickMode === ClickMode.Both &&
                        !node.disabled &&
                        (node.link ? `${node.link}` : '').trim() !== '' && (
                          <a
                            href={node.link}
                            target={options.dataLinkNewTab ? '_blank' : undefined}
                            rel="noreferrer"
                            tabIndex={-1}
                          >
                            <Icon
                              aria-label={options.dataLinkNewTab ? 'Open link in new tab' : 'Open link'}
                              name="external-link-alt"
                              style={{ paddingLeft: '8px', marginTop: '-2px', width: '20px', height: '20px' }}
                              tabIndex={-1}
                            />
                          </a>
                        )}
                      {options.showItemCount && node.children && node.children.length !== 0 && (
                        <span>{` (${node.children.length})`}</span>
                      )}
                    </span>
                  </td>
                  {options.additionalColumns &&
                    options.additionalColumns.map((col) => (
                      <td key={col}>{renderCellContent(node.additionalData?.[col] ?? '', col, node.id)}</td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        }
      </table>
    </>
  );
};
