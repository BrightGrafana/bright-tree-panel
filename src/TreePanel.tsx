import React from 'react';
import { PanelProps } from '@grafana/data';
import { ClickMode, PanelOptions, RawNode } from './models';
import { Utils } from './utils';
import { Validator } from './validator';
import { TreeView } from './Tree-View';
import { Tree } from './tree';
import './styles/classes.css';

export const TreePanel: React.FC<PanelProps<PanelOptions>> = ({ options, data }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  // Convert data to a Node array
  const queryResult: RawNode[] = React.useMemo(
    () =>
      Utils.dfToNodeArray(
        data.series[0],
        options.idColumn,
        options.parentIdColumn,
        options.labelColumn,
        options.disabledColumn,
        options.clickMode === ClickMode.DataLink ? options.dataLinkUrl : undefined
      ),
    [
      data,
      options.idColumn,
      options.parentIdColumn,
      options.labelColumn,
      options.disabledColumn,
      options.clickMode,
      options.dataLinkUrl,
    ]
  );
  Validator.validateTreeInput(queryResult);

  const tree = React.useMemo(() => new Tree(queryResult, options.orderLevels), [queryResult, options.orderLevels]);

  // Determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => tree.getNodeIdsForDepth(options.displayedTreeDepth),
    [tree, options.displayedTreeDepth]
  );

  return (
    <div className="treeView">
      <TreeView
        tree={tree}
        options={{
          clickMode: options.clickMode,
          showItemCount: options.showItemCount,
          showSearch: options.showSearch,
          toggleMode: options.toggleSelectMode,
          multiSelect: options.multiSelect,
          supportsDisabled: options.supportsDisabled,
          dashboardVariableName: options.dashboardVariableName,
          dataLinkUrl: options.dataLinkUrl,
          dataLinkNewTab: options.dataLinkNewTab,
        }}
        expanded={expandedNodeIds}
      />
    </div>
  );
};
