import React from 'react';
import { PanelProps } from '@grafana/data';
import { ClickMode, PanelOptions, RawNode } from 'types';
import { PanelDataErrorView } from '@grafana/runtime';
import Box from '@mui/material/Box';
import { TreeView } from './TreeView';
import { Validator } from '../validator';
import { Utils } from '../utils';
import { Tree } from '../tree';
import '../classes.css';

interface Props extends PanelProps<PanelOptions> {}

export const TreePanel: React.FC<Props> = ({ options, data, fieldConfig, id }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  // convert data to a Node array
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

  // determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => tree.getNodeIdsForDepth(options.displayedTreeDepth),
    [tree, options.displayedTreeDepth]
  );

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <Box className={'treeView'}>
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
    </Box>
  );
};
