import { PanelPlugin } from '@grafana/data';
import { TreePanel } from './TreePanel';
import { PanelOptions, ToggleMode, TreeLevelOrderMode } from './models';

export const plugin = new PanelPlugin<PanelOptions>(TreePanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'idColumn',
      name: 'Node id field name',
      description: 'Field name that contains the ids of nodes (every row in the table result is a node).',
      defaultValue: 'id',
    })
    .addTextInput({
      path: 'labelColumn',
      name: 'Node label field name',
      description: 'Field name that contains the names of the nodes.',
      defaultValue: 'label',
    })
    .addTextInput({
      path: 'parentIdColumn',
      name: 'Node parent id field name',
      description: 'Name of the field that contains the parent ids of the nodes.',
      defaultValue: 'parent',
    })
    .addNumberInput({
      path: 'displayedTreeDepth',
      name: 'Expanded levels',
      description: 'Number of levels expanded by default. Applied after save and apply (page refresh).',
      defaultValue: 100,
    })
    .addBooleanSwitch({
      path: 'showItemCount',
      name: 'Show item count',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showSearch',
      name: 'Show Search',
      defaultValue: false,
    })
    .addRadio({
      path: 'orderLevels',
      name: 'Order in each level.',
      defaultValue: TreeLevelOrderMode.Asc,
      settings: {
        options: [
          { value: TreeLevelOrderMode.Asc, label: 'Ascending' },
          { value: TreeLevelOrderMode.Desc, label: 'Descending' },
          { value: TreeLevelOrderMode.Source, label: 'Source' },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'multiSelect',
      name: 'Allow multi select using Ctrl-Click or Shift-Click.',
      defaultValue: true,
    })
    .addSelect({
      path: 'toggleSelectMode',
      name: 'Toggle mode',
      defaultValue: ToggleMode.SingleClick,
      description:
        'How Chevron and Label clicking is handled. with `no toggle` make sure `Expanded levels` is high enough.',
      settings: {
        options: [
          { value: ToggleMode.SingleClick, label: 'Both label & chevron toggle' },
          { value: ToggleMode.ExpandOnly, label: 'Chevron toggles. Label only expands' },
          { value: ToggleMode.ChevronOnly, label: 'Only chevron toggles' },
          { value: ToggleMode.NoTogle, label: 'No Toggle' },
        ],
      },
    })
    .addTextInput({
      path: 'dashboardVariableName',
      name: 'Dashboard variable name',
      description: 'Name of the dashboard variable in which the id of the clicked node(s) is/are stored.',
      defaultValue: 'Placeholder',
    });
});
