import React from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, RawNode } from './models';
import { Utils } from './utils';
import { Validator } from './validator';
import { TreeView } from './Tree-View';
import { Tree } from 'tree';
import './CSS/classes.css';

export const TreePanel: React.FC<PanelProps<PanelOptions>> = ({ options, data }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  // Convert data to a Node array
  const queryResult: RawNode[] = React.useMemo(
    () => Utils.dfToNodeArray(data.series[0], options.idColumn, options.parentIdColumn, options.labelColumn),
    [data, options.idColumn, options.parentIdColumn, options.labelColumn]
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
          showItemCount: options.showItemCount,
          toggleMode: options.toggleSelectMode,
          multiSelect: options.multiSelect,
          dashboardVariableName: options.dashboardVariableName,
        }}
        expanded={expandedNodeIds}
      />
    </div>
  );
};
