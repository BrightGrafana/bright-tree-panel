import React from 'react';
import { PanelProps } from '@grafana/data';
import { ClickMode, PanelOptions, RawNode, TreeViewOptions } from 'types';
import { PanelDataErrorView } from '@grafana/runtime';
import { TreeView } from './TreeView';
import { Validator } from '../validator';
import { Utils } from '../utils';
import { Tree } from '../tree';
import '../classes.css';

interface Props extends PanelProps<PanelOptions> {}

function toArray(value: string | undefined): string[] {
  return (
    value
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  );
}

export const TreePanel: React.FC<Props> = ({ options, data, fieldConfig, id }) => {
  // validate options input before anything else
  Validator.validateOptionsInput(options, data);

  const additionalColumns: string[] = React.useMemo(
    () => [
      ...new Set([
        ...toArray(options.additionalColumns),
        ...(options.iconColumn ? [options.iconColumn] : []),
        ...(options.iconColorColumn ? [options.iconColorColumn] : []),
        ...(options.parentIconColumn ? [options.parentIconColumn] : []),
        ...(options.parentIconColorColumn ? [options.parentIconColorColumn] : []),
      ]),
    ],
    [
      options.additionalColumns,
      options.iconColumn,
      options.iconColorColumn,
      options.parentIconColumn,
      options.parentIconColorColumn,
    ]
  );

  // convert data to a raw node array
  const rawNodes: RawNode[] = React.useMemo(
    () =>
      Utils.dfToNodeArray(
        data.series[0],
        options.idColumn,
        options.parentIdColumn,
        options.labelColumn,
        options.disabledColumn,
        options.clickMode === ClickMode.DataLink || options.clickMode === ClickMode.Both
          ? options.dataLinkUrl
          : undefined,
        additionalColumns
      ),
    [
      data,
      options.idColumn,
      options.parentIdColumn,
      options.labelColumn,
      options.disabledColumn,
      options.clickMode,
      options.dataLinkUrl,
      additionalColumns,
    ]
  );

  // validate raw nodes
  Validator.validateTreeInput(rawNodes);

  const tree = React.useMemo(() => new Tree(rawNodes, options.orderLevels), [rawNodes, options.orderLevels]);

  // determine expanded nodes
  const expandedNodeIds: string[] = React.useMemo(
    () => tree.listNodeIdsByDepth(options.displayedTreeDepth),
    [tree, options.displayedTreeDepth]
  );

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const treeViewOptions: TreeViewOptions = {
    ...options,
    additionalColumns: toArray(options.additionalColumns),
  };

  return (
    <div className={'treeView'}>
      <TreeView tree={tree} options={treeViewOptions} expanded={expandedNodeIds} />
    </div>
  );
};
